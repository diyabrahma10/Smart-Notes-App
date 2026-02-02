
import {createUser, findUserByEmail, hashPassword} from "../services/user.service.js"
import { registerUserSchema } from "../validators/user.schema.js";

export const getRegisterPage = (req, res) => {
    if(req.user){
        return res.redirect('/dashboard');
    }
    return res.render('register', {
        values:{},
    });
}

export const postRegister = async(req, res) => {
    const parsed = registerUserSchema.safeParse(req.body);
    console.log(parsed);
    
    if(!parsed.success){
        const errors = parsed.error.issues.map(issue => issue.message);
        return res.render('register', {
            errors: errors,
            values:req.body
        })
    }

    const {username , password, email} = parsed.data;
     try {
        const user_exists = await findUserByEmail(email);
        if(user_exists){
            return res.render("register", {
                errors:["Email already exists"],
                values: req.body
            })
        }

        const hashedPass = await hashPassword(password);

        const user_created = await createUser({
            email,
            passwordhash:hashedPass,
            username
        })

        req.flash("success", "Registration successful. Please log in.");
        return res.redirect("/login");


     } catch (error) {
        console.error(error);

        req.flash("error", "Something went wrong. Please try again later.");
        return res.redirect("/register");
     }
}