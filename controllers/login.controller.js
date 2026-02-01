import { createSession, deleteSession, generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../services/token.service.js";
import { findUserByEmail, verifyPassword } from "../services/user.service.js";
import { loginUserSchema } from "../validators/user.schema.js";


export const getLoginPage = (req, res)=> {
    return res.render('login');

}

export const postLogin = async(req, res) => {
    const parsed = loginUserSchema.safeParse(req.body);

    if(!parsed.success){
       const errors = parsed.error.issues.map(e => e.message);
        return res.render("login", {
            errors,
            values: req.body,
        });
    }

    const {email, password} = parsed.data;

    try {
        const user = await findUserByEmail(email);
        if(!user){
             return res.render("login", {
                errors: ["Invalid email or password"],
                values: { email },
            });
        }

        const isMatch = await verifyPassword(password, user.passwordhash);
        if(!isMatch){
            return res.render("login", {
                errors: ["Invalid email or password"],
                values: { email },
            });
        }

        const access_payload = {
            id : user.id,
            username :user.username,
            email: user.email
        }

        const session  = createSession(user.id);

        const refresh_payload = {
            sessionId : (await session).id,
        };
        const accessToken  = generateAccessToken(access_payload);
        const refreshToken  = generateRefreshToken(refresh_payload);
        res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
        });

        // 4️⃣ Set REFRESH TOKEN cookie (long-lived)
        res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.redirect('/dashboard');
    } catch (error) {
        console.error(error);

        // req.flash("error", "Something went wrong. Please try again later.");
        // return res.redirect("/register");
    }
}

export const getLogout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const payload = verifyRefreshToken(refreshToken);

    await deleteSession(payload.sessionId);
    req.flash('success', 'Login to proceed');
    res.redirect('/login');

}