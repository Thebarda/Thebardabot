import credentials from "./credentials.json";
import { useEffect, useRef } from "react";
import { isNil } from "ramda";
import { useAtom, useSetAtom } from "jotai";
import { tokenAtom, userAtom } from "./atoms";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "./shared/customFetch";

interface TwitchUser {
  login: string;
  user_id: string;
  expires_in: number;
}

const useTwitchChat = () => {
  const intervalRef = useRef<NodeJS.Timer | undefined>(undefined);

  const [token, setToken] = useAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);

  const { data } = useQuery(
    ["validate", token],
    ({ signal }) =>
      customFetch<TwitchUser>({
        endpoint: "https://id.twitch.tv/oauth2/validate",
        signal,
        fetchHeaders: { Authorization: `OAuth ${token}` },
      }),
    { enabled: Boolean(token) }
  );

  const { clientId } = credentials;

  const initializeToken = (): boolean => {
    const queryString = window.location.href.split("#")[1];

    if (queryString === undefined) {
      return false;
    }

    const urlParams = new URLSearchParams(queryString);

    setToken(urlParams.get("access_token"));

    return !isNil(urlParams.get("access_token"));
  };

  useEffect(() => {
    if (initializeToken()) {
      return;
    }

    window.location.href = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${window.location.href}&scope=chat:read+chat:edit+user:read:email+user:read:follows`;

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  if (isNil(data)) {
    return;
  }

  setUser({
    login: data.login,
    id: data.user_id,
  });

  clearInterval(intervalRef.current);
  intervalRef.current = setInterval(() => {
    initializeToken();
  }, data.expires_in);
};

export default useTwitchChat;
