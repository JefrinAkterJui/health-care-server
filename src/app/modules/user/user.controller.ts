import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import { fileUploder } from "../../helper/fileUploder";

const createPatient = catchAsync(async (req: Request, res: Response) => {

    const paylod = req.body; 
    
    if (req.file) {
        const UploadResult = await fileUploder.uploadToCloudinary(req.file);
        paylod.patient.profilePhoto = UploadResult.secure_url; 
    }
    const result = await UserService.createPatient(paylod);

    sendResponse(res,{
        statusCode: 201,
        success: true,
        message:"Patient created successfully",
        data: result
    })
});

export const UserController={
    createPatient
}