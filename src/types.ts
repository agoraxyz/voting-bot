import dayjs from "dayjs";
import { GuildChannel, ThreadChannel } from "discord.js";

/* prettier-ignore */
type NewPoll = {
  // poll creation
  status   : number;
  // Discord
  channelId: string;
  // poll
  question : string;
  options  : string[];
  reactions: string[];
  endDate  : dayjs.Dayjs;
};

/* prettier-ignore */
type Poll = {
  // Discord
  channelId: string;
  messageId: string;
  // poll
  question : string;
  options  : string[];
  reactions: string[];
  endDate  : dayjs.Dayjs;
  // voting
  ended    : boolean;
  voteCount: number;
  results  : number[];
};

type Reaction = {
  name: string;
  users: string[];
};

type Channel = GuildChannel | ThreadChannel;

export { Channel, NewPoll, Poll, Reaction };
