import express, { NextFunction, Request, Response }  from "express"
import { fileUploder } from "../../helper/fileUploder";
import { AdminValidation } from "./admin.validation";
import { AdminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";


const router = express.Router();

router.get("/all-user", auth(UserRole.ADMIN), AdminController.getAllUser);
router.post("/create-admin", 
    auth(UserRole.ADMIN),
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