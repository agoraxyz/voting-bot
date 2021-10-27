import { body, param } from "express-validator";

export default {
  pollId: param("id").isNumeric().trim().isLength({ min: 1 }),
  userId: param("userId").isNumeric().trim().isLength({ min: 18, max: 18 }),
  serverId: param("serverId")
    .isNumeric()
    .trim()
    .isLength({ min: 18, max: 18 }),
  channelId: body("channelId")
    .isNumeric()
    .trim()
    .isLength({ min: 18, max: 18 }),
  content: body("content").isString().trim().isLength({ min: 1 }),
  reactions: body("reactions").trim().isLength({ min: 1 }),
  signedMsg: body("signed")
    .trim()
    .matches(/^0x[a-zA-Z0-9]{130}$/)
};
