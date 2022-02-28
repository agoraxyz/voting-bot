/* eslint no-plusplus: "off" */
/* eslint no-return-await: "off" */

import dayjs from "dayjs";
import JSONdb from "simple-json-db";
import { NewPoll } from "../types";
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

  const commandList = {
    ping: pingCommand,
    poll: pollCommand,
    endpoll: endPollCommand,
    enough: enoughCommand,
    done: doneCommand,
    reset: resetPollCommand,
    cancel: cancelPollCommand
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

const messageReactionAdd = async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      logger.error("Something went wrong when fetching the message:", error);

      return;
    }
  }

  logger.verbose(user);

  logger.verbose(
    `${reaction.message.author}'s message "${reaction.message.content}" ` +
      "gained a reaction!"
  );

  logger.verbose(
    `${reaction.count} user(s) have given the same reaction to this message!`
  );
};

export { interactionCreate, messageCreate, messageReactionAdd };
