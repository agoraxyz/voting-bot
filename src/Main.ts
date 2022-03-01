/* eslint no-underscore-dangle: "off" */

import { Client, Intents } from "discord.js";
import express from "express";
import createRouter from "./api/router";
import config from "./config";
import DB from "./utils/db";
import logger from "./utils/logger";
import {
  interactionCreate,
  messageCreate,
  messageReactionAdd,
  messageReactionRemove
} from "./bot/actions";

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
      partials: ["MESSAGE", "CHANNEL", "REACTION"]
    });

    this._client.on("ready", async () => {
      logger.verbose("The bot is up and running");

      logger.verbose("Initializing database");

      DB.init();

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
    this._client.on("messageReactionAdd", messageReactionAdd);
    this._client.on("messageReactionRemove", messageReactionRemove);

    this._client.login(config.botToken ?? "");
  }
}

Main.start();

export default Main;
