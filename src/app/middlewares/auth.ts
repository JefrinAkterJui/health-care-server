import { NextFunction, Request, Response } from "express"
import { jwtHelper } from "../helper/jwt";
import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload;
        }
    }
}

const auth = (...roles: string[])=>{
    return async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const token = req.cookies.accessToken;
            if(!token){
                throw new Error("You are not authorized!");
            }

            const verifyUser = jwtHelper.verifyToken(token, process.env.JWT_SECRET as string);

            req.user = verifyUser;

            if(roles.length && !roles.includes(verifyUser.role)){
                throw new Error("You are not authorized!");
            };

            next()

        } catch (error) {
            next(error);
        };
    };
};

export default auth;