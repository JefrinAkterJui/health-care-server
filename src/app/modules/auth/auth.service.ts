import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { email } from "zod";
import { jwtHelper } from "../../helper/jwt";

const login = async(paylod:{email: string, password: string})=>{
    const user = await prisma.user.findUnique({
        where:{
            email: paylod.email,
            status: UserStatus.ACTIVE
        }
    });

    if (!user) {
        throw new Error("User not found or is not active!");
    }

    const isCorrectedPass = await bcrypt.compare(paylod.password, user.password);
    if(!isCorrectedPass){
        throw new Error("Password is incorrect!")
    }

    const accessToken = jwtHelper.generateToken({email: user.email, role: user.role}, process.env.JWT_SECRET as string,"1h");
    const refreshToken = jwtHelper.generateToken({email: user.email, role: user.role}, process.env.JWT_SECRET as string,"99d");


    return{
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange
    }
}

export const AuthService ={
    login
}