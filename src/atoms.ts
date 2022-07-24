import { atom } from "jotai";
import { ChatMessage, Emote, User } from "./models";

export const tokenAtom = atom<string | null>(null);

export const userAtom = atom<User | null>(null);

export const chatMessagesAtom = atom<Array<ChatMessage>>([]);

export const emotesAtom = atom<Array<Emote>>([]);