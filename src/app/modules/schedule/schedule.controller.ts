import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ScheduleService } from "./schedule.service";

const createSchedule = catchAsync(async (req: Request, res: Response) => {

    const paylod = req.body; 
    const result = await ScheduleService.insertIntoDB(paylod)

    sendResponse(res,{
        statusCode: 201,
        success: true,
        message:"Schedule created successfully",
        data: result
    })
});

export const ScheduleController = {
    createSchedule
}