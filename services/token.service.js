import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const createSession = async(user_id) =>{
    return await prisma.sessions.create({
        data: {userId:user_id}
    })
};

export const deleteSession = async(sessionId) => {
    return await prisma.sessions.delete({
      where: {
        id : sessionId
      }
    });
}

export const verifyAccessToken = (accessToken) => {
    return jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
}

export const verifyRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
}

export const findSessionById = async(session_id) => {
    return await prisma.sessions.findFirst({
      where: {
        id: session_id,
        
      },
      include: {
        user: true,
      },
    });
}


