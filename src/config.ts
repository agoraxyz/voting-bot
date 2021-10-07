import * as dotenv from "dotenv";

const envFound = dotenv.config();

if (envFound.error) {
  throw new Error("Couldn't find .env file or volumes in compose.");
}

const botToken = process.env.BOT_TOKEN;
const guildID = process.env.GUILD_ID;

if (!botToken) {
  throw new Error("You need to specify the bot's BOT_TOKEN in the .env file.");
}

if (!guildID) {
  throw new Error("You need to specify the bot's GUILD_ID in the .env file.");
}

export default {
  botToken,
  guildID
};
