import { atom } from "jotai";
import { isEmpty, isNil } from "ramda";
import { Badge, ChannelInformation, ChatMessage, Emote, User } from "./models";

export const tokenAtom = atom<string | null>(null);

export const userAtom = atom<User | null>(null);

export const chatMessagesAtom = atom<Array<ChatMessage>>([]);

export const emotesAtom = atom<Array<Emote>>([]);

export const badgesAtom = atom<Array<Badge>>([]);

export const channelAtom = atom<string | null>(null);

export const isWaitingForConnectionDerivedAtom = atom((get) => isEmpty(get(chatMessagesAtom)) && !isNil(get(channelAtom)));

export const channelInformationAtom = atom<ChannelInformation | null>(null);