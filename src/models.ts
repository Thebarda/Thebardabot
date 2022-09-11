import tmi from 'tmi.js';

export interface User {
  login: string;
  id: string;
}

export enum ChatMessageType {
  Chat = 'chat',
}

export interface ChatMessage {
  displayName?: string;
  username?: string;
  color?: string;
  message: string;
  type?: "chat" | "action" | "whisper" | "connect";
  id?: string;
  badges?: tmi.Badges;
  emotes?: {
    [key: string]: Array<string>;
  },
  subscriberBadgeMessage?: string;
  badgeInfo?: tmi.BadgeInfo;
}

export interface Emote {
  name: string;
  url: string;
}

interface BadgeVersion {
  id: string;
  image_url_1x: string;
  image_url_2x: string;
  image_url_4x: string;
}

export interface Badge {
  set_id: string;
  versions: Array<BadgeVersion>
}

export interface ChannelInformation {
  displayName: string;
  profileImage: string;
}