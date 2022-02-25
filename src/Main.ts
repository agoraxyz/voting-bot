/* eslint no-underscore-dangle: "off" */
/* eslint no-return-await: "off" */

import { Client, Intents } from "discord.js";
import express from "express";
import { slashCommands } from "./bot/commands/list";
import createRouter from "./api/router";
import config from "./config";
import DB from "./utils/db";
import logger from "./utils/logger";
import Whitelist from "./utils/whitelist";
import { interactionCreate, messageCreate } from "./bot/actions";

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

    this._client.on("interactionCreate", interactionCreate);
    this._client.on("messageCreate", messageCreate);

    this._client.login(config.botToken ?? "");
  }
}

Main.start();

export default Main;
