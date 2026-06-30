import express from "express";
import {
  getCreateNotePage,
  getEditNotePage,
  postCreateNote,
  postUpdateNote,
  deleteNote,
} from "../controllers/notes.controller.js";

export const notesRouter = express.Router();

notesRouter.get("/new", getCreateNotePage);
notesRouter.post("/", postCreateNote);
notesRouter.get("/:id", getEditNotePage);
notesRouter.post("/:id", postUpdateNote);
notesRouter.post("/:id/delete", deleteNote);
