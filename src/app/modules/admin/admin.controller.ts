import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { fileUploder } from "../../helper/fileUploder";
import { AdminService } from "./admin.service";

const createAdmin = catchAsync(async (req: Request, res: Response) => {

    const paylod = req.body; 
    
    if (req.file) {
        const UploadResult = await fileUploder.uploadToCloudinary(req.file);
        paylod.admin.profilePhoto = UploadResult.secure_url; 
    }
    const result = await AdminService.createAdmin(paylod);

    sendResponse(res,{
        statusCode: 201,
        success: true,
        message:"Admin created successfully",
        data: result
    })
});

export const AdminController={
    createAdmin
}