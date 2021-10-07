import Main from "../Main";
import { Reaction } from "../types";

export const getReactions = async (
  channelId: string,
  messageId: string,
  include: string[]
): Promise<Reaction> => {
  const channel = await Main.Client.channels.cache.get(channelId);
  const message = await (channel as any).messages.fetch(messageId);
  return (await Promise.all(
    message.reactions.cache
      .filter((reaction) =>
        include.includes(
          /^[a-zA-Z]+$/.test(reaction.emoji.name)
            ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
            : reaction.emoji.name
        )
      )
      .map(async (reaction) => ({
        name: reaction.emoji.name,
        users: (await reaction.users.fetch())
          .map((user) => user.id)
          .filter((id) => id !== Main.Client.user.id)
      }))
  )) as any as Reaction;
};
