import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const generateToken = (paylod: any, secret: Secret, expiresIn: string)=>{
    const token = jwt.sign(paylod, secret, {
        algorithm:"HS256",
        expiresIn:"1h"
    });
    return token;
};

const verifyToken = (token: string, secret: Secret)=>{
    return jwt.verify(token, secret) as JwtPayload
}

export const jwtHelper ={
    generateToken,
    verifyToken
}