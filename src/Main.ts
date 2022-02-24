/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

import { slashCommands } from "./bot/commands";
import { Client, Intents } from "discord.js";
import express from "express";
import JSONdb from "simple-json-db";
import createRouter from "./api/router";
import config from "./config";
import DB from "./utils/db";
import logger from "./utils/logger";
import { NewPoll } from "./types";
import { createPoll, endPoll } from "./service/polls";
import Whitelist from "./utils/whitelist";

export class Main {
  private static _app: express.Application;

  private static _client: Client;

  static get Client(): Client {
    return this._client;
  }

  static start() {
    this._client = new Client({
      intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
      ],
      partials: ["CHANNEL"]
    });

    this._client.on("ready", async () => {
      logger.verbose("The bot is up and running");

      const commands = this._client.application?.commands;

      logger.verbose("Clearing slash commands");

      (await commands.fetch()).map(
        async (command) => await commands.delete(command.id)
      );

      logger.verbose("Adding slash commands");

      await Promise.all(
        slashCommands.map(async (command) => await commands.create(command))
      );

      logger.verbose("Initializing database");

      DB.init();

      logger.verbose("Initializing whitelist");

      Whitelist.init();

      logger.verbose("Starting express server on port 8080");

      this._app = express();

      this._app.use(express.json());
      this._app.use("/api", createRouter());

      const server = this._app.listen(8080);

      const stop = () => {
        logger.verbose("Stopping express server");
        server.close();

        logger.verbose("Stopping Discord bot");
        this._client.destroy();
      };

      process.once("SIGINT", () => stop());
      process.once("SIGTERM", () => stop());
    });

    this._client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) {
        return;
      }

      const { commandName, options } = interaction;

      switch (commandName) {
        case "ping": {
          interaction.reply({
            content: "pong",
            ephemeral: true
          });

          break;
        }

        case "poll": {
          const subject = options.getString("subject");
          const emotes = options.getString("reacts");

          let reactions: string[] = [];

          if (emotes) {
            emotes.split(";").forEach((emote) => {
              reactions.push(emote.trim());
            });
          } else {
            reactions = ["👍", "👎"];
          }

          await createPoll(
            interaction.channelId,
            subject,
            reactions,
            interaction
          );

          break;
        }

        case "dmpoll": {
          const db = new JSONdb("polls.json");
          db.set(interaction.user.id, {
            status: 0,
            channelId: interaction.channelId,
            content: "",
            reactions: []
          });
          db.sync();

          interaction.user
            .send(
              "Give me the subject of the poll. For example:\n" +
                '"Do you think drinking milk is cool?"'
            )
            .then(() =>
              interaction.reply({
                content: "Check your DM's",
                ephemeral: true
              })
            );

          break;
        }

        case "endpoll": {
          endPoll(`${options.getNumber("id")}`, interaction);

          break;
        }

        case "whitelistadd": {
          if (interaction.member.user.id === interaction.guild.ownerId) {
            Whitelist.add(
              interaction.guildId,
              options.getString("addresses").match(/0x[a-zA-Z0-9]{40}/g)
            );

            interaction.reply({
              content: "The addresses have been added to the whitelist.",
              ephemeral: true
            });
          }
          break;
        }

        case "whitelistrm": {
          if (interaction.member.user.id === interaction.guild.ownerId) {
            Whitelist.delete(
              interaction.guildId,
              options.getString("addresses").match(/0x[a-zA-Z0-9]{40}/g)
            );

            interaction.reply({
              content: "The addresses have been removed from the whitelist.",
              ephemeral: true
            });
          }

          break;
        }

        default: {
          logger.verbose("This command is not implemented yet");
        }
      }
    });

    this._client.on("messageCreate", async (message) => {
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

              if (
                message.content.split("\n").length === poll.reactions.length
              ) {
                poll.content += `\n\n${message.content}`;

                await createPoll(poll.channelId, poll.content, poll.reactions);

                db.delete(authorId);
                db.sync();
              } else {
                message.channel.send(
                  "Please check the example and try again."
                );
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
    });

    this._client.login(config.botToken ?? "");
  }
}

Main.start();

export default Main;
