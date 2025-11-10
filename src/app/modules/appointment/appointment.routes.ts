import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { AppointmentValidation } from "./appointment.validation";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();

router.post(
    "/",
    auth(UserRole.PATIENT),
    // validateRequest(AppointmentValidation.createAppointmentValidationSchema),
    AppointmentController.createAppointment
);

export const AppointmentRoutes = router;