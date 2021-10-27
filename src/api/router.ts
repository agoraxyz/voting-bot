import { Router } from "express";
import { controller } from "./controller";
import validators from "./validators";

const createRouter = () => {
  const router: Router = Router();

  router.get("/reacts/:id", [validators.pollId], controller.reacts);
  router.get("/polls/list/:serverId", [validators.serverId], controller.list);
  router.get("/channels/:userId", [validators.userId], controller.channels);
  router.post(
    "/polls/create",
    [validators.signedMsg],
    [validators.channelId],
    [validators.content],
    [validators.reactions],
    controller.create
  );

  return router;
};

export default createRouter;
