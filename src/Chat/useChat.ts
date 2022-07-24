import { useAtomValue, useSetAtom } from 'jotai';
import { append, concat, equals, isNil, map } from 'ramda';
import { useEffect, useRef } from 'react';
import tmi, { ChatUserstate, Client } from 'tmi.js';
import { chatMessagesAtom, emotesAtom, tokenAtom, userAtom } from '../atoms';

import credentials from '../credentials.json';
import { ChatMessage, Emote } from '../models';

const formatEmotesFromAPI = map<{ name: string; images: { url_1x: string } }, Emote>(({ name, images }) => ({ name, url: images.url_1x }))

export const useChat = () => {
  const token = useAtomValue(tokenAtom);
  const user = useAtomValue(userAtom);
  const setChatMessages = useSetAtom(chatMessagesAtom);
  const setEmotes = useSetAtom(emotesAtom);

  const clientRef = useRef<Client | null>(null);

  const { clientId } = credentials;

  const onConnectedHandler = (addr: string, port: number) => {
    console.log(`* Connected to ${addr}:${port}`);
    setChatMessages((currentChatMessages) => append<ChatMessage>({
      color: '',
      displayName: undefined,
      hasPrime: false,
      isBroadcaster: false,
      isModerator: false,
      type: 'connect',
      username: undefined,
      message: "Welcome to the chat",
      id: 'connect',
    }, currentChatMessages))
  }
  
  const onMessageHandler = (target: unknown, context: ChatUserstate, msg: string, self: unknown) => {
    if (self) { 
      return; 
    }
    console.log(context)

    setChatMessages((currentChatMessages) => append<ChatMessage>({
      color: context.color,
      displayName: context['display-name'],
      hasPrime: equals(context.badges?.premium, '1'),
      isBroadcaster: equals(context.badges?.broadcaster, '1'),
      isModerator: equals(context.badges?.moderator, '1'),
      type: context['message-type'],
      username: context.username,
      message: msg.trim(),
      id: context.id,
    }, currentChatMessages))
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

  const getGlobalEmotes = () => fetch('https://api.twitch.tv/helix/chat/emotes/global', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': clientId,
    }
  });

  const getChannelEmotes = () => fetch(`https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${user?.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': clientId,
    }
  });

  useEffect(() => {
    if (isNil(token) || isNil(user)) {
      return () => {
        clientRef.current?.disconnect();
      };
    }

    Promise.all([
      getChannelEmotes(),
      getGlobalEmotes(),
    ]).then(async([retrievedChannelEmotes, retrievedGlobalEmotes]) => {
      const channelEmotes = await retrievedChannelEmotes.json();
      const globalEmotes = await retrievedGlobalEmotes.json();

      const formattedChannelEmotes = formatEmotesFromAPI(channelEmotes.data);
      const formattedGlobalEmotes = formatEmotesFromAPI(globalEmotes.data);

      setEmotes(concat(formattedGlobalEmotes, formattedChannelEmotes));

      startListenChat(user.login);
    });

    return () => {
      clientRef.current?.disconnect();
    };
  }, [token, user])
}