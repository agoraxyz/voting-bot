import { Request, Response } from "express";
import { validationResult } from "express-validator";
import DB from "../utils/db";
import { getAvailableChannels } from "../service/channels";
import { createPoll, getPolls } from "../service/polls";
import { getReactions } from "../service/reactions";
import { Poll } from "../types";
import logger from "../utils/logger";

export const controller = {
  reacts: async (req: Request, res: Response): Promise<void> => {
    try {
      logger.verbose(
        `endpoint: reacts, params: ${JSON.stringify(req.params)}`
      );

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const poll = DB.get(req.params.id) as Poll;

      const result = poll.ended
        ? poll.results
        : (
            await getReactions(poll.channelId, poll.messageId, poll.reactions)
          ).map((react) => react.users.length);

      res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      });
      res.status(200).json(result);
    } catch (e) {
      res.status(400).json(e);
    }
  },

  list: async (req: Request, res: Response): Promise<void> => {
    try {
      logger.verbose(`endpoint: list, params: ${JSON.stringify(req.params)}`);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const result = await getPolls(req.params.id);

      res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      });
      res.status(200).json(result);
    } catch (e) {
      res.status(400).json(e);
    }
  },

  channels: async (req: Request, res: Response): Promise<void> => {
    try {
      logger.verbose(
        `endpoint: channels, params: ${JSON.stringify(req.params)}`
      );

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const result = await getAvailableChannels(req.params.userId);

      res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      });
      res.status(200).json(result);
    } catch (e) {
      res.status(400).json(e);
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      logger.verbose(
        `endpoint: create, params: ${JSON.stringify(req.params)}`
      );

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const result = await createPoll(
        req.params.channelId,
        req.params.content,
        req.params.reactions.split(" "),
        undefined,
        req.params.signed
      );

      res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      });
      res.status(200).json(result);
    } catch (e) {
      res.status(400).json(e);
    }
  }
};
