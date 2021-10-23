import { getChannels } from "./channels";
import DB from "../utils/db";
import { CommandInteraction, TextChannel } from "discord.js";
import { ethers } from "ethers";
import Main from "../Main";
import { Poll } from "../types";
import logger from "../utils/logger";
import { isWhiteListed } from "./whitelist";
import { getReactions } from "./reactions";

const createPoll = async (
  channelId: string,
  _content: string,
  reactions: string[],
  interaction?: CommandInteraction,
  signed?: string
): Promise<boolean> => {
  try {
    const address = signed
      ? ethers.utils.verifyMessage("Hello world", signed)
      : null;
    const channel = Main.Client.channels.cache.get(channelId) as TextChannel;
    const content = `Poll #${DB.lastId()}:\n\n${_content}`;

    if (!address || (await isWhiteListed(channel.guildId, address))) {
      const msg: any = interaction
        ? await interaction.reply({ content, fetchReply: true })
        : await channel.send(content);

      reactions.forEach((reaction) => msg.react(reaction));

      DB.add({
        channelId,
        messageId: msg.id,
        reactions,
        ended: false,
        results: []
      });

      return true;
    }
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
  let poll = DB.get(id);

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
