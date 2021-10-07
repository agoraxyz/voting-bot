import Main from "../Main";
import { Channel } from "../types";

const getAvailableChannels = async (userId: string): Promise<string[]> =>
  Main.Client.guilds.cache
    .map((_) => _)
    .filter(async (guild) => guild.members.fetch(userId).catch(() => null))
    .map((guild) => guild.channels.cache.map((_) => _))
    .reduce((prev: Channel[], curr: Channel[]) => prev.concat(curr))
    .filter((channel) => channel.type === "GUILD_TEXT")
    .map((channel) => channel.id);

const getChannels = async (guildId: string): Promise<string[]> =>
  (await Main.Client.guilds.cache.get(guildId).channels.fetch())
    .filter((channel) => channel.type === "GUILD_TEXT")
    .map((channel) => channel.id);

export { getChannels, getAvailableChannels };
