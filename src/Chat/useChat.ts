import { useAtomValue, useSetAtom } from 'jotai';
import { append, concat, drop, gte, isNil, length, map } from 'ramda';
import { useEffect, useRef } from 'react';
import tmi, { ChatUserstate, Client } from 'tmi.js';
import { badgesAtom, channelAtom, chatMessagesAtom, emotesAtom, tokenAtom, userAtom } from '../atoms';

import credentials from '../credentials.json';
import { ChatMessage, Emote } from '../models';

const formatEmotesFromAPI = map<{ name: string; images: { url_1x: string } }, Emote>(({ name, images }) => ({ name, url: images.url_1x }))

const formatBTTVEmotesFromApi = map<{ id: string; code: string; }, Emote>(({ id, code }) => ({ name: code, url: `https://cdn.betterttv.net/emote/${id}/1x` }));

export const useChat = () => {
  const token = useAtomValue(tokenAtom);
  const user = useAtomValue(userAtom);
  const channel = useAtomValue(channelAtom);
  const setChatMessages = useSetAtom(chatMessagesAtom);
  const setEmotes = useSetAtom(emotesAtom);
  const setBadges = useSetAtom(badgesAtom);

  const clientRef = useRef<Client | null>(null);

  const { clientId } = credentials;

  const onConnectedHandler = (addr: string, port: number) => {
    setChatMessages((currentChatMessages) => append<ChatMessage>({
      color: '',
      displayName: undefined,
      type: 'connect',
      username: undefined,
      message: "Welcome to the chat",
      id: 'connect',
    }, currentChatMessages))
  }
  
  const onMessageHandler = (target: unknown, context: ChatUserstate, msg: string, self: unknown) => {
    setChatMessages((currentChatMessages) => {
      const messagesList = gte(length(currentChatMessages), 200) ? drop(1, currentChatMessages) : currentChatMessages;

      return append<ChatMessage>({
        color: context.color,
        displayName: context['display-name'],
        badges: context.badges,
        type: context['message-type'],
        username: context.username,
        message: msg.trim(),
        id: context.id,
        emotes: context.emotes,
      }, messagesList);
    })
  }

  const startListenChat = (channel: string): void => {
    const client = new tmi.client({
      identity: {
        username: clientId,
        password: `oauth:${token}`
      },
      channels: [channel]
    });

    clientRef.current = client;

    client.on('message', onMessageHandler);
    client.on('connected', onConnectedHandler);

    client.connect();
  }

  const getChannelInformation = () => fetch(`https://api.twitch.tv/helix/users?login=${channel}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': clientId,
    }
  })

  const getGlobalEmotes = () => fetch('https://api.twitch.tv/helix/chat/emotes/global', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': clientId,
    }
  });

  const getGlobalBadges = () => fetch('https://api.twitch.tv/helix/chat/badges/global', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': clientId,
    }
  });

  const getChannelEmotes = (id: string) => fetch(`https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': clientId,
    }
  });

  const getChannelBadges = (id: string) => fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': clientId,
    }
  });

  const getBTTVGlobalEmotes = () => fetch('https://api.betterttv.net/3/cached/emotes/global');

  const initChannelInformationEmotesAndBadges = () => {
    getChannelInformation().then(async (response) => {
      const { id } = (await response.json()).data[0];

      Promise.all([
        getChannelEmotes(id),
        getGlobalEmotes(),
        getBTTVGlobalEmotes()
      ]).then(async([retrievedChannelEmotes, retrievedGlobalEmotes, retrievedBTTVGlobalEmotes]) => {
        const channelEmotes = await retrievedChannelEmotes.json();
        const globalEmotes = await retrievedGlobalEmotes.json();
        const BTTVGlobalEmotes = await retrievedBTTVGlobalEmotes.json();
  
        const formattedChannelEmotes = formatEmotesFromAPI(channelEmotes.data);
        const formattedGlobalEmotes = formatEmotesFromAPI(globalEmotes.data);
        const formattedBTTVGlobalEmotes = formatBTTVEmotesFromApi(BTTVGlobalEmotes);
  
        setEmotes([
          ...formattedChannelEmotes,
          ...formattedGlobalEmotes,
          ...formattedBTTVGlobalEmotes
        ]);
  
        startListenChat(channel as string);
      });

      Promise.all([
        getGlobalBadges(),
        getChannelBadges(id),
      ]).then(async ([retrievedGlobalBadges, retrievedChannelBadges]) => {
        const globalBadges = await retrievedGlobalBadges.json();
        const channelBadges = await retrievedChannelBadges.json();
  
        setBadges(concat(channelBadges.data, globalBadges.data));
      })
    });
  }

  useEffect(() => {
    setChatMessages([]);
    setEmotes([]);
    setBadges([]);
    
    if (isNil(token) || isNil(user)) {
      return () => {
        clientRef.current?.disconnect();
      };
    }

    initChannelInformationEmotesAndBadges();

    return () => {
      clientRef.current?.disconnect();
    };
  }, [token, user, channel]);
}