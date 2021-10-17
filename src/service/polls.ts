import { getChannels } from "./channels";
import DB from "../db";
import { CommandInteraction, TextChannel } from "discord.js";
import * as ethers from "ethers";
import Main from "../Main";
import { Poll } from "../types";
import { isWhiteListed } from "./whitelist";
import logger from "../utils/logger";

const createPoll = async (
  channelId: string,
  content: string,
  reactions: string[],
  interaction?: CommandInteraction,
  signed?: string
): Promise<boolean> => {
  try {
    const address = ethers.utils.verifyMessage("Hello world", signed);
    const channel = Main.Client.channels.cache.get(channelId) as TextChannel;

    if (await isWhiteListed(channel.guildId, address)) {
      const msg: any = interaction
        ? await interaction.reply({ content, fetchReply: true })
        : await channel.send(content);

      reactions.forEach((reaction) => msg.react(reaction));

      DB.add({
        channelId,
        messageId: msg.id,
        reactions
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

export { createPoll, getPolls };
