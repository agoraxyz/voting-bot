import JSONdb from "simple-json-db";
import { createPoll } from "../service/polls";
import { NewPoll } from "../types";
import logger from "../utils/logger";
import {
  cancelPollCommand,
  endPollCommand,
  pingCommand,
  pollCommand,
  resetPollCommand,
  whiteListAddCommand,
  whiteListRmCommand
} from "./commands/impl";

const interactionCreate = async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const commandList = {
    ping: pingCommand,
    whitelistadd: whiteListAddCommand,
    whitelistrm: whiteListRmCommand,
    poll: pollCommand,
    endpoll: endPollCommand,
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
          poll.reactions = message.content
            .split("\n")
            .filter((line) => /^.+-.+$/.test(line))
            .map((line) => line.split("-")[0].trim());

          if (message.content.split("\n").length === poll.reactions.length) {
            poll.content += `\n\n${message.content}`;

            await createPoll(poll.channelId, poll.content, poll.reactions);

            db.delete(authorId);
            db.sync();
          } else {
            message.channel.send("Please check the example and try again.");
          }

          break;
        }

        default: {
          poll.content = message.content;
          poll.status = 1;

          db.set(authorId, poll);
          db.sync();

          message.channel.send(
            "Give me the options for the poll. For example:\n" +
              "🥵 - yes\n" +
              "🥴 - no\n"
          );

          break;
        }
      }
    } else {
      message.reply("I'm sorry but I couldn't interpret your request.");
    }
  }
};

export { interactionCreate, messageCreate };
