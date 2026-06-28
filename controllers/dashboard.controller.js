import { listNotesByUserId, listTagNames } from "../services/notes.service.js";

export const getDashPage = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : undefined;
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  const search = req.query.search ? req.query.search.trim() : undefined;

  const { notes, pagination } = await listNotesByUserId({
    user_id: req.user.userId,
    page,
    limit,
    search,
  });

  console.log(notes);
  //getting the names of all the tags for the user
  const tags = await listTagNames(req.user.userId);
  return res.render("dashboard", {
    notes,
    pagination,
    tags,
    activePage: "all",
  });
};
