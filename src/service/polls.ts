import { CommandInteraction, TextChannel } from "discord.js";
import { getChannels } from "./channels";
import DB from "../db";
import Main from "../Main";
import { Poll } from "../types";

const createPoll = async (
  channelId: string,
  content: string,
  reactions: string[],
  interaction?: CommandInteraction
): Promise<boolean> => {
  try {
    const msg: any = interaction
      ? await interaction.reply({ content, fetchReply: true })
      : await (Main.Client.channels.cache.get(channelId) as TextChannel).send(
          content
        );

    reactions.forEach((reaction) => msg.react(reaction));

    DB.add({
      channelId,
      messageId: msg.id,
      reactions
    });

    return true;
  } catch (e) {
    return false;
  }
};

const getPolls = async (guildId: string): Promise<Poll[]> => {
  const channelIds = await getChannels(guildId);

  return [...Array(DB.lastId()).keys()]
    .filter((i) => channelIds.includes(DB.get(i.toString()).channelId))
    .map((i) => DB.get(i.toString()));
};

export { createPoll, getPolls };
