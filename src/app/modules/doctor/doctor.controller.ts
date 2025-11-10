import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { fileUploder } from "../../helper/fileUploder";
import sendResponse from "../../shared/sendResponse";
import { DoctorService } from "./doctor.service";
import { pick } from "../../helper/pick";
import { doctorFilterableFields } from "./doctor.constant";
import { IOptions } from "../../helper/paginationHelper";
import { StatusCodes } from "http-status-codes";

const createDoctor = catchAsync(async(req: Request, res: Response)=>{
    const paylod = req.body;

    if(req.file){
        const UploadResult = await fileUploder.uploadToCloudinary(req.file);
        paylod.doctor.profilePhoto = UploadResult.secure_url;
    }
    const result = await DoctorService.createDoctor(paylod)

    sendResponse(res,{
        statusCode: 201,
        success: true,
        message:"Doctor created successfully",
        data: result
    })
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) as IOptions;
    const fillters = pick(req.query, doctorFilterableFields)

    const result = await DoctorService.getAllFromDB(fillters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor fetched successfully!",
        meta: result.meta,
        data: result.data
    })
})

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await DoctorService.updateIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor updated successfully!",
        data: result
    })
})

const suggestDoctors = catchAsync(async (req: Request, res: Response) => {

    const result = await DoctorService.getAISuggestions(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Successfully retrieved doctor suggestions!',
        data: result,
    });
});

export const DoctorController ={
    createDoctor,
    getAllFromDB,
    updateIntoDB,
    suggestDoctors
}