import { Router } from "express";
import { controller } from "./controller";
import validators from "./validators";

const createRouter = () => {
  const router: Router = Router();

  router.get("/reacts/:id", [validators.id], controller.reacts);
  router.get("/polls/list/:id", [validators.id], controller.list);
  router.get("/channels/:userId", [validators.userId], controller.channels);
  router.get(
    "/polls/create/:signed/:channelId/:content/:reactions",
    [validators.signedMsg],
    [validators.channelId],
    [validators.content],
    [validators.reactions],
    controller.create
  );

  return router;
};

export default createRouter;
