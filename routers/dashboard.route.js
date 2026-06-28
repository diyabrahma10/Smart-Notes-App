import express from "express";
import { getDashPage } from "../controllers/dashboard.controller.js";

export const dashRouter = express.Router();

dashRouter.get("/", getDashPage);
