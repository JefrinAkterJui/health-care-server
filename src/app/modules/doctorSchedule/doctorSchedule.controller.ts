import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync"; 
import sendResponse from "../../shared/sendResponse"; 
import { DoctorScheduleService } from "./doctorSchedule.service";
import { IJWTPayload } from "../../types/common";


const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;

    if (!user) {
        throw new Error("User not authenticated!");
    }
    const data = req.body;
    const result = await DoctorScheduleService.insertIntoDB(user as IJWTPayload, data);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor Schedule created successfully",
        data: result
    });
});

export const DoctorScheduleController = {
    insertIntoDB
}