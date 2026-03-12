import express from "express";
import { addSubscriber } from "../controllers/subscriberController.js";

const subscribeRouter = express.Router();

subscribeRouter.post("/", addSubscriber);

export default subscribeRouter;
