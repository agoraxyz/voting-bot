/* eslint no-plusplus: "off" */
/* eslint no-return-await: "off" */
/* eslint no-underscore-dangle: "off" */
/* eslint no-await-in-loop: "off" */

import dayjs from "dayjs";
import JSONdb from "simple-json-db";
import { getReactions } from "../service/reactions";
import { NewPoll } from "../types";
import DB from "../utils/db";
import logger from "../utils/logger";
import {
  cancelPollCommand,
  doneCommand,
  endPollCommand,
  enoughCommand,
  pingCommand,
  pollCommand,
  resetPollCommand
} from "./commands/impl";

const interactionCreate = async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  /* prettier-ignore */
  const commandList = {
    ping   : pingCommand,
    poll   : pollCommand,
    endpoll: endPollCommand,
    enough : enoughCommand,
    done   : doneCommand,
    reset  : resetPollCommand,
    cancel : cancelPollCommand
  };

  try {
    commandList[interaction.commandName](interaction);
  } catch (e) {
    logger.verbose("This command is not implemented yet");
  }
};

const messageCreate = async (message) => {
  if (message.channel.type === "DM" && !message.author.bot) {
    const db = new JSONdb("polls.json");
    const authorId = message.author.id;
    const poll = db.get(authorId) as NewPoll;

    if (poll) {
      switch (poll.status) {
        case 1: {
          if (poll.options.length === poll.reactions.length) {
            poll.options.push(message.content);

            message.reply("Now send me the corresponding emoji");
          } else {
            poll.reactions.push(message.content);

            if (poll.options.length === 2) {
              message.reply(
                "Give me a new option or go to the nex step by using " +
                  "**/enough**"
              );
            } else {
              message.reply("Give me the next option");
            }
          }

          db.set(authorId, poll);
          db.sync();

          break;
        }

        case 2: {
          try {
            const duration = message.content.split(":");

            const expDate = dayjs()
              .add(parseInt(duration[0], 10), "day")
              .add(parseInt(duration[1], 10), "hour")
              .add(parseInt(duration[2], 10), "minute");

            poll.endDate = expDate;
            ++poll.status;

            db.set(authorId, poll);
            db.sync();

            await message.reply("Your poll will look like this:");

            let content = `${poll.question}\n`;

            for (let i = 0; i < poll.options.length; ++i) {
              content += `\n${poll.reactions[i]} ${poll.options[i]}`;
            }

            const msg = await message.reply(content);

            poll.reactions.map(async (emoji) => await msg.react(emoji));

            await message.reply(
              "You can accept it by using **/done**,\n" +
                "reset the data by using **/reset**\n" +
                "or cancel it using **/cancel**."
            );
          } catch (e) {
            message.reply("Incorrect input, please try again.");
          }

          break;
        }

        default: {
          poll.question = message.content;
          ++poll.status;

          db.set(authorId, poll);
          db.sync();

          message.channel.send(
            "Give me the options and the corresponding emojies for the poll " +
              "(one after another)"
          );

          break;
        }
      }
    } else {
      message.reply("I'm sorry but I couldn't interpret your request.");
    }
  }
};

const messageReactionCommon = async (reaction, user, removed: boolean) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      logger.error("Something went wrong when fetching the message:", error);

      return;
    }
  }

  const msg = reaction.message;

  const entries = DB.getKeys()
    .map((key) => ({ key, poll: DB.get(key) }))
    .filter(
      (entry) =>
        entry.poll.channelId === msg.channelId &&
        entry.poll.messageId === msg.id
    );

  if (entries !== []) {
    const {key} = entries[0];
    const {poll} = entries[0];

    if (!removed) {
      const emoji = reaction._emoji;

      let userReactions;

      if (poll.reactions.includes(`<:${emoji.name}:${emoji.id}>`)) {
        userReactions = msg.reactions.cache.filter(
          (react) => react.users.cache.has(user.id) && react._emoji !== emoji
        );
      } else {
        userReactions = msg.reactions.cache.filter(
          (react) => react.users.cache.has(user.id) && react._emoji === emoji
        );
      }

      try {
        Array.from(userReactions.values()).map(
          async (react) => await (react as any).users.remove(user.id)
        );
      } catch (error) {
        logger.error("Failed to remove reaction:", error);
      }
    }

    const reacResults = (
      await getReactions(poll.channelId, poll.messageId, poll.reactions)
    ).map((react) => react.users.length);

    poll.results = reacResults;
    poll.voteCount = reacResults.reduce((a, b) => a + b);

    let content = `Poll #${DB.lastId()}:\n\n${poll.question}\n`;

    for (let i = 0; i < poll.options.length; ++i) {
      let percentage = `${(reacResults[i] / poll.voteCount) * 100}`;

      if (Number(percentage) % 1 !== 0) {
        percentage = Number(percentage).toFixed(2);
      }

      content += `\n${poll.reactions[i]} ${poll.options[i]} (${percentage}%)`;
    }

    content += `\n\n${poll.voteCount} person${
      poll.voteCount > 1 || poll.voteCount === 0 ? "s" : ""
    } voted so far.`;

    msg.edit(content);

    DB.set(Number(key), poll);
  }
};

const messageReactionAdd = async (reaction, user) => {
  messageReactionCommon(reaction, user, false);
};

const messageReactionRemove = async (reaction, user) => {
  messageReactionCommon(reaction, user, true);
};

export {
  interactionCreate,
  messageCreate,
  messageReactionAdd,
  messageReactionRemove
};
