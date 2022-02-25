import { Constants } from "discord.js";

export const slashCommands = [
  {
    name: "ping",
    description: 'Replies with "pong".'
  },
  {
    name: "poll",
    description: "Creates a poll."
  },
  {
    name: "done",
    description: "Finalizes a poll."
  },
  {
    name: "reset",
    description: "Restarts poll creation."
  },
  {
    name: "cancel",
    description: "Cancels poll creation."
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
  }
];
