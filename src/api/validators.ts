import { param } from "express-validator";

export default {
  id: param("id").isNumeric().trim().isLength({ min: 18, max: 18 }),
  userId: param("userId").isNumeric().trim().isLength({ min: 18, max: 18 }),
  channelId: param("channelId")
    .isNumeric()
    .trim()
    .isLength({ min: 18, max: 18 }),
  content: param("content").isString().trim().isLength({ min: 1 }),
  reactions: param("reactions").trim().isLength({ min: 1 })
};
