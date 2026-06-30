import {
  listNotesByUserId,
  createNote,
  listNoteByNoteId,
  updateNote,
  deleteNoteByNoteId,
} from "../services/notes.service.js";
import { createNoteSchema } from "../validators/note.schema.js";

export const getCreateNotePage = async (req, res) => {
  const { notes } = await listNotesByUserId({ user_id: req.user.userId });
  return res.render("editnote1", {
    notes,
    currentNoteId: null,
    contentHTML: "",
    contentText: "",
    tags: [],
  });
};

export const postCreateNote = async (req, res) => {
  const parsed = createNoteSchema.safeParse(req.body);

  if (!parsed.success) {
    const issueMessages = (parsed.error.issues || parsed.error.errors || [])
      .map((err) => err.message)
      .filter(Boolean);

    const messages = issueMessages.join(". ") || "Title is required";

    // Re-render the editor and preserve user input so they don't lose content
    const { notes } = await listNotesByUserId({ user_id: req.user.userId });

    return res.render("editnote1", {
      notes,
      title: req.body.title || "",
      contentHTML: req.body.contentHTML || "",
      contentText: req.body.contentText || "",
      tags: req.body.tags || [],
      errorMessage: messages,
    });
  }

  const { title, contentHTML, contentText, tags } = parsed.data;

  try {
    await createNote({
      user_id: req.user.userId,
      contentText,
      contentHTML,
      title,
      tags,
    });
    req.flash("success", "Note created successfully.");
    return res.redirect("/dashboard");
  } catch (error) {
    console.error(error);

    const { notes } = await listNotesByUserId({ user_id: req.user.userId });

    return res.render("editnote1", {
      notes,
      title,
      contentHTML,
      contentText,
      tags,
      errorMessage: "Something went wrong while saving the note.",
    });
  }
};

export const getEditNotePage = async (req, res) => {
  const { notes } = await listNotesByUserId({ user_id: req.user.userId });
  const noteId = req.params.id;
  const note = await listNoteByNoteId({
    user_id: req.user.userId,
    note_id: noteId,
  });

  if (!note) {
    req.flash(
      "error",
      "Note not found or you do not have permission to edit it.",
    );
    return res.redirect("/dashboard");
  }

  return res.render("editnote1", {
    notes,
    title: note.title || "",
    contentHTML: note.contentHTML || "",
    contentText: note.contentText || "",
    currentNoteId: note.id,
    tags: (note.tags || []).map(({ tag }) => tag?.name).filter(Boolean),
  });
};

export const postUpdateNote = async (req, res) => {
  const noteId = req.params.id;
  const parsed = createNoteSchema.safeParse(req.body);

  if (!parsed.success) {
    const issueMessages = (parsed.error.issues || parsed.error.errors || [])
      .map((err) => err.message)
      .filter(Boolean);

    const { notes } = await listNotesByUserId({ user_id: req.user.userId });

    return res.render("editnote1", {
      notes,
      title: req.body.title || "",
      contentHTML: req.body.contentHTML || "",
      contentText: req.body.contentText || "",
      currentNoteId: noteId,
      errorMessage: issueMessages.join(". ") || "Title is required",
    });
  }

  try {
    const { title, contentHTML, contentText } = parsed.data;
    await updateNote({
      user_id: req.user.userId,
      note_id: noteId,
      title,
      contentHTML,
      contentText,
    });

    req.flash("success", "Note updated successfully.");
    return res.redirect(`/notes/${noteId}`);
  } catch (error) {
    console.error(error);

    const { notes } = await listNotesByUserId({ user_id: req.user.userId });

    return res.render("editnote1", {
      notes,
      title: req.body.title || "",
      contentHTML: req.body.contentHTML || "",
      contentText: req.body.contentText || "",
      currentNoteId: noteId,
      errorMessage: "Something went wrong while updating the note.",
    });
  }
};

export const deleteNote = async (req, res) => {
  const noteId = req.params.id;
  try {
    await deleteNoteByNoteId({
      user_id: req.user.userId,
      note_id: noteId,
    });

    req.flash("success", "Note have been moved to recycle bin.");
    return res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong while deleting the note.");
    return res.redirect(`/notes/${noteId}`);
  }
};
