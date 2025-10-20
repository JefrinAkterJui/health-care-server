import jwt, { Secret } from "jsonwebtoken";

const generateToken = (paylod: any, secret: Secret, expiresIn: string)=>{
    const token = jwt.sign(paylod, secret, {
        algorithm:"HS256",
        expiresIn:"1h"
    });
    return token;
};

export const jwtHelper ={
    generateToken
}