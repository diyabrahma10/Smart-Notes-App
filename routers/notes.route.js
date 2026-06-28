import express from "express";
import {
  getEditNotePage,
  postCreateNote,
} from "../controllers/notes.controller.js";

export const notesRouter = express.Router();

notesRouter.get("/new", getEditNotePage);
notesRouter.post("/", postCreateNote);
notesRouter.get("/:id/edit", getEditNotePage);
