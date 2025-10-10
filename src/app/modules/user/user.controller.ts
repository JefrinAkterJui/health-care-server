import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

const createPatient = catchAsync(async (req: Request, res: Response) => {
    console.log("paitent", req.body)
});

export const UserController={
    createPatient
}