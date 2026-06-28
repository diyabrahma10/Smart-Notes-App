import { listNotesByUserId, createNote } from "../services/notes.service.js";
import { createNoteSchema } from "../validators/note.schema.js";

export const getEditNotePage = async (req, res) => {
  const { notes } = await listNotesByUserId({ user_id: req.user.userId });
  return res.render("editnote1", {
    notes,
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
