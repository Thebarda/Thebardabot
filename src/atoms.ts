import { atom } from "jotai";
import { Badge, ChatMessage, Emote, User } from "./models";

export const tokenAtom = atom<string | null>(null);

export const userAtom = atom<User | null>(null);

export const chatMessagesAtom = atom<Array<ChatMessage>>([]);

export const emotesAtom = atom<Array<Emote>>([]);

export const badgesAtom = atom<Array<Badge>>([]);

export const channelsAtom = atom<Array<string | null>>([null]);

export const tabsAtom = atom<number>(1);

export const tabWidthAtom = atom<number>(window.innerWidth);
