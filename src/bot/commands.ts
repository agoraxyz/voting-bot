import { Constants } from "discord.js";

export const slashCommands = [
  {
    name: "ping",
    description: "Replies with pong."
  },
  {
    name: "poll",
    description: "Creates a poll.",
    options: [
      {
        name: "subject",
        description: "The subject of the vote.",
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING
      },
      {
        name: "reacts",
        description: "Emotes separated by a semicolon.",
        required: false,
        type: Constants.ApplicationCommandOptionTypes.STRING
      }
    ]
  },
  {
    name: "dmpoll",
    description: "Create a poll using direct messages."
  },
  {
    name: "endpoll",
    description: "Closes a poll.",
    options: [
      {
        name: "id",
        description: "The ID of the poll you want to close.",
        required: true,
        type: Constants.ApplicationCommandOptionTypes.NUMBER
      }
    ]
  },
  {
    name: "whitelistadd",
    description: "Add (an) address(es) to the whitelist.",
    options: [
      {
        name: "addresses",
        description: "Address(es) to be added to the whitelist.",
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING
      }
    ]
  },
  {
    name: "whitelistrm",
    description: "Remove (an) address(es) from the whitelist.",
    options: [
      {
        name: "addresses",
        description: "Address(es) to be removed from the whitelist.",
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING
      }
    ]
  }
];
