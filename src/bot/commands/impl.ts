import JSONdb from "simple-json-db";
import { endPoll } from "../../service/polls";
import Whitelist from "../../utils/whitelist";

const pingCommand = async (interaction) => {
  interaction.reply({
    content: "pong",
    ephemeral: true
  });
};

const whiteListAddCommand = async (interaction) => {
  if (interaction.member.user.id === interaction.guild.ownerId) {
    Whitelist.add(
      interaction.guildId,
      interaction.options.getString("addresses").match(/0x[a-zA-Z0-9]{40}/g)
    );

    interaction.reply({
      content: "The addresses have been added to the whitelist.",
      ephemeral: true
    });
  }
};

const whiteListRmCommand = async (interaction) => {
  if (interaction.member.user.id === interaction.guild.ownerId) {
    Whitelist.delete(
      interaction.guildId,
      interaction.options.getString("addresses").match(/0x[a-zA-Z0-9]{40}/g)
    );

    interaction.reply({
      content: "The addresses have been removed from the whitelist.",
      ephemeral: true
    });
  }
};

const pollCommand = async (interaction) => {
  const db = new JSONdb("polls.json");
  db.set(interaction.user.id, {
    status: 0,
    channelId: interaction.channelId,
    content: "",
    reactions: [],
    endDate: Number
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
};

const endPollCommand = async (interaction) => {
  endPoll(`${interaction.options.getNumber("id")}`, interaction);
};

const resetPollCommand = async (interaction) => {
  // TODO: clear all the data in the poll object
  interaction.reply({
    content: "The current poll creation procedure has been restarted.",
    ephemeral: true
  });
};

const cancelPollCommand = async (interaction) => {
  // TODO: delete the poll object
  interaction.reply({
    content: "The current poll creation procedure has been cancelled.",
    ephemeral: true
  });
};

export {
  pingCommand,
  whiteListAddCommand,
  whiteListRmCommand,
  pollCommand,
  endPollCommand,
  resetPollCommand,
  cancelPollCommand
};
