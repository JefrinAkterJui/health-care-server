import express, { NextFunction, Request, Response }  from "express"
import { fileUploder } from "../../helper/fileUploder";
import { DoctorValidation } from "./doctor.validation";
import { DoctorController } from "./doctor.controller";

const router = express.Router();

router.post("/create-doctor", 
    fileUploder.upload.single("file"),
    async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const parsedData = DoctorValidation.createDoctorValidationSchema.parse(JSON.parse(req.body.data));
            req.body = parsedData;
            next();
        } catch (error) {
            next(error);
        }
    },
    DoctorController.createDoctor
);

export const DoctorRouter = router;