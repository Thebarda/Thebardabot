import credentials from './credentials.json';
import { useEffect, useRef } from 'react';
import {isNil} from 'ramda';
import { useAtom, useSetAtom } from 'jotai';
import { tokenAtom, userAtom } from './atoms';

const useTwitchChat = () => {
  const intervalRef = useRef<NodeJS.Timer | undefined>(undefined);

  const [token, setToken] = useAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);

  const { clientId } = credentials;

  const initializeToken = (): boolean => {
    const queryString = window.location.href.split('#')[1];

    if (queryString === undefined) {
      return false;
    }

    const urlParams = new URLSearchParams(queryString);

    setToken(urlParams.get('access_token'))
    
    return !isNil(urlParams.get('access_token'));
  }

  useEffect(() => {
    if (initializeToken()) {
      return;
    }

    window.location.href = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=http://localhost:3000&scope=chat%3Aread+user%3Aread%3Aemail`;

    return () => {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    if (isNil(token)) {
      return;
    }

    fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `OAuth ${token}` 
      }
    }).then(async (response) => {
      const json = await response.json();
      
      setUser({
        login: json.login,
        id: json.user_id,
      })

      // startListenChat(json.login);

      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        initializeToken();
      }, json.expires_in)
    })
  },
  [token]);
}

export default useTwitchChat;