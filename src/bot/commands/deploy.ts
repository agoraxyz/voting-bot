/* eslint no-return-await: "off" */

import Main from "../../Main";
import logger from "../../utils/logger";
import { slashCommands } from "./list";

const client = Main.Client;

client.on("ready", async () => {
  const commands = Main.Client.application?.commands;

  logger.verbose("Clearing slash commands");

  (await commands.fetch()).map(
    async (command) => await commands.delete(command.id)
  );

  logger.verbose("Adding slash commands");

  await Promise.all(
    slashCommands.map(async (command) => await commands.create(command))
  );

  process.exit(0);
});
