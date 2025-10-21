import express, { NextFunction, Request, Response }  from "express"
import { fileUploder } from "../../helper/fileUploder";
import { AdminValidation } from "./admin.validation";
import { AdminController } from "./admin.controller";


const router = express.Router();

router.post("/create-admin", 
    fileUploder.upload.single("file"),
    async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const parsedData = AdminValidation.createAdminValidationSchema.parse(JSON.parse(req.body.data));
            req.body = parsedData;
            next();
        } catch (error) {
            next(error);
        }
    },
    AdminController.createAdmin
);

export const AdminRouter = router;