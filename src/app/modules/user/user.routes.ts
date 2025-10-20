import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import { fileUploder } from "../../helper/fileUploder";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.post(
    "/create-paitent",
    fileUploder.upload.single('file'), 
    async (req: Request, res: Response, next: NextFunction) => { 
        try {
            const parsedData = UserValidation.createPatientValidationSchema.parse(JSON.parse(req.body.data));
            req.body = parsedData;
            next();
        } catch (err) {
            next(err);
        }
    },
    UserController.createPatient 
);

export const UserRouter = router;