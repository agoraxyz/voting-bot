import JSONdb from "simple-json-db";
import { endPoll } from "../../service/polls";
import { NewPoll } from "../../types";

const pingCommand = async (interaction) => {
  interaction.reply({
    content: "pong",
    ephemeral: true
  });
};

const pollCommand = async (interaction) => {
  if (interaction.channel.type !== "DM" && !interaction.user.bot) {
    const db = new JSONdb("polls.json");
    db.set(interaction.user.id, {
      status: 0,
      optionIdx: 0,
      channelId: interaction.channelId,
      options: [],
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
  } else {
    interaction.reply({
      content:
        "You have to use this command in the channel " +
        "you want the poll to appear"
    });
  }
};

const endPollCommand = async (interaction) => {
  endPoll(`${interaction.options.getNumber("id")}`, interaction);
};

const resetPollCommand = async (interaction) => {
  const db = new JSONdb("polls.json");

  if (db.delete(interaction.user.id)) {
    interaction.reply({
      content: "The current poll creation procedure has been restarted.",
      ephemeral: true
    });
  }

  db.sync();
};

const cancelPollCommand = async (interaction) => {
  const db = new JSONdb("polls.json");
  const authorId = interaction.user.id;

  if (db.delete(authorId)) {
    db.set(authorId, { status: 0 } as NewPoll);

    interaction.reply({
      content: "The current poll creation procedure has been cancelled.",
      ephemeral: true
    });
  }

  db.sync();
};

export {
  pingCommand,
  pollCommand,
  endPollCommand,
  resetPollCommand,
  cancelPollCommand
};
