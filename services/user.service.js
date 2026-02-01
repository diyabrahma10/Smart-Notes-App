import { error } from "console";
import prisma from "../config/prisma.js"
import { compare, hash } from "bcrypt";
export const findUserByEmail = async(user_email)=>{
    return await prisma.user.findUnique({
        where:{ email: user_email},
    });
};

export const hashPassword = (password) => {
    return hash(password,10);
}

export const createUser = async(userdata)=>{
    try {
        return await prisma.user.create({
            data: userdata,
        })
    } catch (err) {
        console.log(err);
        
        throw new Error("USER_NOT_CREATED")
    }
}

export const verifyPassword = (password, hashedPassword)=>{
    return compare(password, hashedPassword);
}