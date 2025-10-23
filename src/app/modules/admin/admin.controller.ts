import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { fileUploder } from "../../helper/fileUploder";
import { AdminService } from "./admin.service";
import { pick } from "../../helper/pick";
import { userFilterableFields } from "./admin.constans";

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

const getAllUser = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, userFilterableFields);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) as any;
    
    const result = await AdminService.getAllUser(filters, options);

    sendResponse(res,{
        statusCode: 200,
        success: true,
        message:"User retrieved successfully!",
        meta: result.meta,
        data: result.data
    })
});

export const AdminController={
    createAdmin,
    getAllUser
}