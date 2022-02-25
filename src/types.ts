import dayjs from "dayjs";
import { GuildChannel, ThreadChannel } from "discord.js";

type NewPoll = {
  status: number;
  optionIdx: number;
  channelId: string;
  question: string;
  options: string[];
  reactions: string[];
  endDate: dayjs.Dayjs;
};

type Poll = {
  channelId: string;
  messageId: string;
  reactions: string[];
  endDate: dayjs.Dayjs;
  ended: boolean;
  results: number[];
};

type Reaction = {
  name: string;
  users: string[];
};

type Channel = GuildChannel | ThreadChannel;

export { Channel, NewPoll, Poll, Reaction };
