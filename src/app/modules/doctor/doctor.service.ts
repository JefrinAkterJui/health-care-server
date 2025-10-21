import z from "zod";
import { DoctorValidation } from "./doctor.validation";
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { UserRole } from "@prisma/client";

type TCreateDoctorPayload = z.infer<typeof DoctorValidation.createDoctorValidationSchema>;

const createDoctor = async(paylod: TCreateDoctorPayload)=>{
    const {password , doctor} = paylod;

    const hashPass = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND));

    const result = await prisma.$transaction(async (tnx) => {
            await tnx.user.create({
                data: {
                    email: doctor.email,
                    password: hashPass,
                    role: UserRole.DOCTOR
                }
            });
            
            const createdDoctor = await tnx.doctor.create({
                data: {
                    ...doctor
                }
            });
            return createdDoctor;
    });
    return result;
}

export const DoctorService={
    createDoctor
}