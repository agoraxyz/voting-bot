/* eslint no-plusplus: "off" */
/* eslint no-return-await: "off" */

import { CommandInteraction, TextChannel } from "discord.js";
import { getChannels } from "./channels";
import DB from "../utils/db";
import Main from "../Main";
import { NewPoll, Poll } from "../types";
import logger from "../utils/logger";
import { getReactions } from "./reactions";

const createPoll = async (
  _poll: NewPoll,
  interaction?: CommandInteraction
): Promise<boolean> => {
  try {
    const channel = Main.Client.channels.cache.get(
      _poll.channelId
    ) as TextChannel;

    let content = `Poll #${DB.lastId()}:\n\n${_poll.question}\n`;

    for (let i = 0; i < _poll.options.length; ++i) {
      content += `\n${_poll.reactions[i]} ${_poll.options[i]} (0%)`;
    }

    content += "\n\n0 people voted so far.";

    const msg: any = interaction
      ? await interaction.reply({ content, fetchReply: true })
      : await channel.send(content);

    _poll.reactions.map(async (emoji) => await msg.react(emoji));

    /* prettier-ignore */
    const poll = {
      channelId: _poll.channelId,
      messageId: msg.id,
      question : _poll.question,
      options  : _poll.options,
      reactions: _poll.reactions,
      endDate  : _poll.endDate,
      ended    : false,
      voteCount: 0,
      results  : []
    };

    DB.add(poll);

    return true;
  } catch (e) {
    logger.error(e);
  }

  return false;
};

const getPolls = async (guildId: string): Promise<Poll[]> => {
  const channelIds = await getChannels(guildId);

  return [...Array(DB.lastId()).keys()]
    .filter((i) => channelIds.includes(DB.get(i.toString()).channelId))
    .map((i) => DB.get(i.toString()));
};

const endPoll = async (
  id: string,
  interaction?: CommandInteraction
): Promise<void> => {
  const poll = DB.get(id);

  poll.ended = true;
  poll.results = (
    await getReactions(poll.channelId, poll.messageId, poll.reactions)
  ).map((react) => react.users.length);

  DB.set(Number(id), poll);

  interaction.reply({
    content: `Poll #${id} has been closed`,
    ephemeral: true
  });
};

const hasEnded = async (id: string): Promise<boolean> => DB.get(id).ended;

export { createPoll, getPolls, endPoll, hasEnded };
