import express, { NextFunction, Request, Response }  from "express"
import { fileUploder } from "../../helper/fileUploder";
import { DoctorValidation } from "./doctor.validation";
import { DoctorController } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
    "/",
    DoctorController.getAllFromDB
);
router.post("/create-doctor", 
    auth(UserRole.ADMIN),
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

router.post(
    '/get-suggestions',
    // auth(ENUM_USER_ROLE.PATIENT),
    DoctorController.suggestDoctors
);

router.patch(
    "/:id",
    auth(UserRole.ADMIN, UserRole.DOCTOR),
    DoctorController.updateIntoDB
);

export const DoctorRouter = router;