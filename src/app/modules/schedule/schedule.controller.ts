import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ScheduleService } from "./schedule.service";
import { pick } from "../../helper/pick";
import { IJWTPayload } from "../../types/common";
import { IOptions } from "../../helper/paginationHelper";

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


const schedulesForDoctor = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) as IOptions;
    const fillters = pick(req.query, ["startDateTime", "endDateTime"])

    const user = (req as any).user;

    if (!user) {
        throw new Error("User not authenticated!"); 
    }
    const result = await ScheduleService.schedulesForDoctor(user as IJWTPayload, fillters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Schedule fetched successfully!",
        meta: result.meta,
        data: result.data
    })
})

const deleteScheduleFromDB = catchAsync(async (req: Request, res: Response) => {
    const result = await ScheduleService.deleteScheduleFromDB(req.params.id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Schedule deleted successfully!",
        data: result
    })
})

export const ScheduleController = {
    createSchedule,
    schedulesForDoctor,
    deleteScheduleFromDB
}