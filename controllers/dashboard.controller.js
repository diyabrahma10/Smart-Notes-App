import { listNotesByUserId } from "../services/notes.service.js";

export const getDashPage = async(req, res) => {
    const page = req.query.page?parseInt(req.query.page):undefined;
    const limit = req.query.limit?parseInt(req.query.limit):undefined;
    const search = req.query.search ? req.query.search.trim() : undefined;

    const {notes, pagination}  = await listNotesByUserId({
        user_id:  req.user.userId,
        page, limit, search
    });

    console.log(notes);
    
    return res.render('dashboard');
}

export const postDash  = (req, res) => {

}