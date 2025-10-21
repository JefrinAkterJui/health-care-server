import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AdminValidation } from "./admin.validation";
import { UserRole } from "@prisma/client";


type TCreateAdminPayload = z.infer<typeof AdminValidation.createAdminValidationSchema>;

const createAdmin = async (paylod: TCreateAdminPayload) => {
    const { password, admin } = paylod;

    const hashPass = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND));

    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: {
                email: admin.email,
                password: hashPass,
                role: UserRole.ADMIN
            }
        });
        
        const createdAdmin = await tnx.admin.create({
            data: {
                name: admin.name,   
                email: admin.email,
                profilePhoto: admin.profilePhoto,
                contactNumber: admin.contactNumber
            }
        });
        return createdAdmin;
    });
    return result;
};

export const AdminService = {
    createAdmin
}