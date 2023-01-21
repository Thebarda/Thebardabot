import { useTheme } from "@mui/material";
import { useAtomValue, useAtom } from "jotai";
import { append, concat, drop, gt, gte, has, isNil, length, map } from "ramda";
import { useEffect, useRef, useState, useCallback } from "react";
import tmi, { ChatUserstate, Client } from "tmi.js";
import {
  channelInformationAtom,
  emotesAtom,
  tokenAtom,
  userAtom,
} from "../atoms";

import credentials from "../credentials.json";
import { Badge, ChatMessage, Emote } from "../models";

const formatEmotesFromAPI = map<
  { name: string; images: { url_1x: string } },
  Emote
>(({ name, images }) => ({ name, url: images.url_1x }));

const formatBTTVEmotesFromApi = map<{ id: string; code: string }, Emote>(
  ({ id, code }) => ({
    name: code,
    url: `https://cdn.betterttv.net/emote/${id}/1x`,
  })
);

export const useChat = (channel: string) => {
  const theme = useTheme();
  const defaultChannelColor = theme.palette.grey[900];

  const [chatMessages, setChatMessages] = useState<Array<ChatMessage>>([]);
  const [emotes, setEmotes] = useAtom(emotesAtom, channel);
  const [badges, setBadges] = useState<Array<Badge>>([]);
  const [channelInformation, setChannelInformation] = useAtom(
    channelInformationAtom,
    channel
  );
  const [channelColor, setChannelColor] = useState<string>(defaultChannelColor);

  const token = useAtomValue(tokenAtom);
  const user = useAtomValue(userAtom);

  const clientRef = useRef<Client | null>(null);

  const { clientId } = credentials;

  const onConnectedHandler = useCallback((addr: string, port: number) => {
    setChatMessages((currentChatMessages) =>
      append<ChatMessage>(
        {
          color: "",
          displayName: undefined,
          type: "connect",
          username: undefined,
          message: "Welcome to the chat",
          id: "connect",
        },
        currentChatMessages
      )
    );
  }, []);

  const onMessageHandler = useCallback(
    (target: unknown, context: ChatUserstate, msg: string, self: unknown) => {
      setChatMessages((currentChatMessages) => {
        const messagesList = gte(length(currentChatMessages), 200)
          ? drop(1, currentChatMessages)
          : currentChatMessages;

        return append<ChatMessage>(
          {
            color: context.color,
            displayName: context["display-name"],
            badges: context.badges,
            badgeInfo: context["badge-info"],
            type: context["message-type"],
            username: context.username,
            message: msg.trim(),
            id: context.id,
            emotes: context.emotes,
            subscriberBadgeMessage: has("subscriber", context["badge-info"])
              ? `Subscribed ${context["badge-info"].subscriber} month${
                  gt(Number(context["badge-info"].subscriber), 1) ? "s" : ""
                } ago`
              : undefined,
          },
          messagesList
        );
      });
    },
    []
  );

  const startListenChat = useCallback(
    (channel: string): void => {
      const client = new tmi.client({
        identity: {
          username: clientId,
          password: `oauth:${token}`,
        },
        channels: [channel],
      });

      clientRef.current = client;

      client.on("message", onMessageHandler);
      client.on("connected", onConnectedHandler);

      client.connect();
    },
    [channel, clientId, token]
  );

  const getChannelInformation = useCallback(
    () =>
      fetch(`https://api.twitch.tv/helix/users?login=${channel}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": clientId,
        },
      }),
    [token, clientId]
  );

  const getGlobalEmotes = useCallback(
    () =>
      fetch("https://api.twitch.tv/helix/chat/emotes/global", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": clientId,
        },
      }),
    [token, clientId]
  );

  const getGlobalBadges = useCallback(
    () =>
      fetch("https://api.twitch.tv/helix/chat/badges/global", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": clientId,
        },
      }),
    [token, clientId]
  );

  const getChannelEmotes = useCallback(
    (id: string) =>
      fetch(`https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": clientId,
        },
      }),
    [clientId, token]
  );

  const getChannelBadges = useCallback(
    (id: string) =>
      fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": clientId,
        },
      }),
    [token, clientId]
  );

  const getBTTVGlobalEmotes = useCallback(
    () => fetch("https://api.betterttv.net/3/cached/emotes/global"),
    []
  );

  const getBTTVChannelEmotes = useCallback(
    (id: string) =>
      fetch(`https://api.betterttv.net/3/cached/users/twitch/${id}`),
    []
  );

  const getChannelColor = useCallback(
    (id: string) =>
      fetch(`https://api.twitch.tv/helix/chat/color?user_id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": clientId,
        },
      }),
    [token, clientId]
  );

  const initChannelInformationEmotesAndBadges = useCallback(() => {
    getChannelInformation().then(async (response) => {
      if (!response.ok) {
        setChatMessages([]);
        setEmotes([]);
        setBadges([]);
        setChannelInformation(null);
      }

      const { id, ...information } = (await response.json()).data[0];

      setChannelInformation({
        displayName: information.display_name,
        profileImage: information.profile_image_url,
        login: information.login,
      });

      getChannelColor(id)
        .then(async (response) => response.json())
        .then(({ data }) => {
          setChannelColor(data[0]?.color || defaultChannelColor);
        });

      Promise.all([
        getChannelEmotes(id),
        getGlobalEmotes(),
        getBTTVGlobalEmotes(),
      ]).then(
        async ([
          retrievedChannelEmotes,
          retrievedGlobalEmotes,
          retrievedBTTVGlobalEmotes,
        ]) => {
          const channelEmotes = await retrievedChannelEmotes.json();
          const globalEmotes = await retrievedGlobalEmotes.json();
          const BTTVGlobalEmotes = await retrievedBTTVGlobalEmotes.json();

          const formattedChannelEmotes = formatEmotesFromAPI(
            channelEmotes.data
          );
          const formattedGlobalEmotes = formatEmotesFromAPI(globalEmotes.data);
          const formattedBTTVGlobalEmotes =
            formatBTTVEmotesFromApi(BTTVGlobalEmotes);

          setEmotes((currentEmotes) => [
            ...currentEmotes,
            ...formattedChannelEmotes,
            ...formattedGlobalEmotes,
            ...formattedBTTVGlobalEmotes,
          ]);

          getBTTVChannelEmotes(id).then(async (response) => {
            const BTTVChannelEmotes = await response.json();

            const formattedBTTVChannelEmotes = formatBTTVEmotesFromApi(
              BTTVChannelEmotes.channelEmotes
            );
            const formattedBTTVSharedEmotes = formatBTTVEmotesFromApi(
              BTTVChannelEmotes.sharedEmotes
            );

            setEmotes((currentEmotes) => [
              ...currentEmotes,
              ...formattedBTTVChannelEmotes,
              ...formattedBTTVSharedEmotes,
            ]);
          });

          startListenChat(channel as string);
        }
      );

      Promise.all([getGlobalBadges(), getChannelBadges(id)]).then(
        async ([retrievedGlobalBadges, retrievedChannelBadges]) => {
          const globalBadges = await retrievedGlobalBadges.json();
          const channelBadges = await retrievedChannelBadges.json();

          setBadges(concat(channelBadges.data, globalBadges.data));
        }
      );
    });
  }, [token, clientId, channel]);

  useEffect(() => {
    setChatMessages([]);
    setEmotes([]);
    setBadges([]);
    setChannelInformation(null);

    if (isNil(token) || isNil(user)) {
      return () => {
        clientRef.current?.disconnect();
      };
    }

    initChannelInformationEmotesAndBadges();

    return () => {
      clientRef.current?.disconnect();
    };
  }, [token, user?.login, channel]);

  return {
    channelInformation,
    emotes,
    badges,
    chatMessages,
    clientRef,
    channelColor,
  };
};
