import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { AppointmentService } from "./appointment.service";
import httpStatus from "http-status";

const createAppointment = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user as IJWTPayload;
    
    const payload = req.body;

    const result = await AppointmentService.createAppointment(user, payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Appointment created successfully!",
        data: result
    });
});

export const AppointmentController = {
    createAppointment
}