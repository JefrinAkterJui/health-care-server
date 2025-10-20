import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserValidation } from "./user.validation";


type TCreatePatientPayload = z.infer<typeof UserValidation.createPatientValidationSchema>;

const createPatient = async (paylod: TCreatePatientPayload) => {
    const { password, patient } = paylod;

    const hashPass = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND));

    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: {
                email: patient.email,
                password: hashPass
            }
        });
        
        const createdPatient = await tnx.patient.create({
            data: {
                name: patient.name,   
                email: patient.email,
                profilePhoto: patient.profilePhoto 
            }
        });
        return createdPatient;
    });
    return result;
};

export const UserService = {
    createPatient
}