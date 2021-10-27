import { GuildChannel, ThreadChannel } from "discord.js";

type NewPoll = {
  status: number;
  channelId: string;
  content: string;
  reactions: string[];
};

type Poll = {
  channelId: string;
  messageId: string;
  reactions: string[];
  ended: boolean;
  results: number[];
};

type Reaction = {
  name: string;
  users: string[];
};

type Channel = GuildChannel | ThreadChannel;

export { Channel, NewPoll, Poll, Reaction };
