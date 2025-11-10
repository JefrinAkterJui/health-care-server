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
router.post(
    '/get-suggestions',
    // auth(ENUM_USER_ROLE.PATIENT),
    DoctorController.suggestDoctors
);

router.get('/:id', DoctorController.getByIdFromDB);

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


router.patch(
    "/:id",
    auth(UserRole.ADMIN, UserRole.DOCTOR),
    DoctorController.updateIntoDB
);

router.delete(
    '/:id',
    auth(UserRole.ADMIN),
    DoctorController.deleteFromDB
);

router.delete(
    '/soft/:id',
    auth(UserRole.ADMIN),
    DoctorController.softDelete);

export const DoctorRouter = router;