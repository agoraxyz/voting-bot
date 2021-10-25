import * as dotenv from "dotenv";

const envFound = dotenv.config();

if (envFound.error) {
  throw new Error("Couldn't find .env file or volumes in compose.");
}

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  throw new Error("You need to specify the bot's BOT_TOKEN in the .env file.");
}

export default {
  botToken
};
