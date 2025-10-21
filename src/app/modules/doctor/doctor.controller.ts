import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { fileUploder } from "../../helper/fileUploder";
import sendResponse from "../../shared/sendResponse";
import { DoctorService } from "./doctor.service";

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

export const DoctorController ={
    createDoctor
}