export interface User {
  login: string;
  id: string;
}

export enum ChatMessageType {
  Chat = 'chat',
}

export interface ChatMessage {
  displayName?: string;
  isModerator: boolean;
  isBroadcaster: boolean;
  hasPrime: boolean;
  username?: string;
  color?: string;
  message: string;
  type?: "chat" | "action" | "whisper" | "connect";
  id?: string;
}

export interface Emote {
  name: string;
  url: string;
}