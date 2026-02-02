import jwt from 'jsonwebtoken';
import { deleteSession, findSessionById, generateAccessToken, verifyAccessToken, verifyRefreshToken } from '../services/token.service.js';

export const assignUser = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  // ---------- 1️⃣ Try ACCESS TOKEN ----------
    if (accessToken) {
        try {
            const decoded = verifyAccessToken(accessToken);
            req.user = {
                username : decoded.username,
                userId: decoded.id,
                email: decoded.email,
            };
            res.locals.user = {
                username : session.user.username,
                userId: session.user.id,
                email: session.user.email,
            };

            return next();
        } catch (error) {
            console.log(error);
            res.clearCookie("accessToken");
            return next();
            //now the access token is not verified either due to it is revoked or mybe tampered 
            
        }
    }

    if (!refreshToken) {
        return next(); // user not logged in
    } 

    //now try to refresh the access token that is generate new token as the refreshtoken exist
    try {
        const decodedRefresh = verifyRefreshToken(refreshToken);
        const session = await findSessionById(decodedRefresh.sessionId);
        // console.log(session);
        
        if(!session) {
            return next();
        }

        //check if the session is valid ie its not expired 
        const refreshMaxAgeMs =
        Number(process.env.SESSION_EXPIRES_IN) *
        24 * 60 * 60 * 1000;

        const isExpired =
        Date.now() - session.createdAt.getTime() > refreshMaxAgeMs;

        if (isExpired) {
            await deleteSession(session.id);
            return next();
        }
        

        //now the refresh token is there and session also have not expired so we will go for creating new access tokens
        const newAccessToken = generateAccessToken({
            id : session.user.id,
            username : session.user.username,
            email: session.user.email
        });

        res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
        });

        req.user = {
            username : session.user.username,
            userId: session.user.id,
            email: session.user.email,
        };

        res.locals.user = {
            username : session.user.username,
            userId: session.user.id,
            email: session.user.email,
        };

        return next();

    } catch (error) {
        //refresh token is invalid or expired 
        
        res.clearCookie("refreshToken");
        console.log(error);
        return next();
        
    }


}


export const requireAuth = (req, res, next) => {
    if(!req.user){
        req.flash("error", "Please Login to continue!");
        return res.redirect('/login');
    }
    return next();
}