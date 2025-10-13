import { prisma } from "../../shared/prisma";
import { createPatient } from "./user.interface";
import bcrypt from "bcryptjs"

const createPatient = async(paylod: createPatient)=>{
    const hashPass = await bcrypt.hash(paylod.password, Number(process.env.BCRYPT_SALTROUND));

    const result = await prisma.$transaction(async(tnx)=>{
        await tnx.user.create({
            data:{
                email: paylod.email,
                password: hashPass
            }
        })
        return await tnx.patient.create({
            data:{
                name: paylod.name,
                email: paylod.email
            }
        })
    });
    return result;
};

export const UserService = {
    createPatient
}