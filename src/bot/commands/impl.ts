/* eslint no-plusplus: "off" */

import dayjs from "dayjs";
import JSONdb from "simple-json-db";
import { createPoll, endPoll } from "../../service/polls";
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
      endDate: dayjs()
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

const enoughCommand = async (interaction) => {
  const db = new JSONdb("polls.json");
  const authorId = interaction.user.id;
  const poll = db.get(authorId) as NewPoll;

  ++poll.status;
  interaction.reply("Give me the end date of the poll in the DD:HH:mm format");

  db.set(authorId, poll);
  db.sync();
};

const doneCommand = async (interaction) => {
  const db = new JSONdb("polls.json");
  const authorId = interaction.user.id;
  const poll = db.get(authorId) as NewPoll;

  if (poll.status === 3) {
    await createPoll(poll);

    interaction.reply({
      content: "The poll has been created.",
      ephemeral: true
    });

    db.delete(authorId);
    db.sync();
  } else {
    interaction.reply({
      content: "Poll creation procedure is not finished, you must continue.",
      ephemeral: true
    });
  }
};

const resetPollCommand = async (interaction) => {
  const db = new JSONdb("polls.json");
  const authorId = interaction.user.id;

  if (db.delete(authorId)) {
    db.set(authorId, { status: 0 } as NewPoll);

    interaction.reply({
      content: "The current poll creation procedure has been restarted.",
      ephemeral: true
    });
  }

  db.sync();
};

const cancelPollCommand = async (interaction) => {
  const db = new JSONdb("polls.json");

  if (db.delete(interaction.user.id)) {
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
  enoughCommand,
  doneCommand,
  resetPollCommand,
  cancelPollCommand
};
