import z from "zod";
import { DoctorValidation } from "./doctor.validation";
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { Prisma, UserRole } from "@prisma/client";
import { doctorSearchableFields } from "./doctor.constant";
import { calculatePagination, IOptions } from "../../helper/paginationHelper";
import { IDoctorUpdateInput } from "./doctor.interface";

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

const getAllFromDB = async (filters: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filters;

    const andConditions: Prisma.DoctorWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    // "", "medicine"
    if (specialties && specialties.length > 0) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialities: {
                        title: {
                            contains: specialties,
                            mode: "insensitive"
                        }
                    }
                }
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))

        andConditions.push(...filterConditions)
    }

    const whereConditions: Prisma.DoctorWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        }
    });

    const total = await prisma.doctor.count({
        where: whereConditions
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }
}

const updateIntoDB = async (id: string, payload: Partial<IDoctorUpdateInput>) => {
    const doctorInfo = await prisma.doctor.findUniqueOrThrow({
        where: {
            id
        }
    });

    const { specialties, ...doctorData } = payload;

    return await prisma.$transaction(async (tnx) => {
        if (specialties && specialties.length > 0) {
            const deleteSpecialtyIds = specialties.filter((specialty) => specialty.isDeleted);

            for (const specialty of deleteSpecialtyIds) {
                await tnx.doctorSpecialties.deleteMany({
                    where: {
                        doctorId: id,
                        specialitiesId: specialty.specialtyId
                    }
                })
            }

            const createSpecialtyIds = specialties.filter((specialty) => !specialty.isDeleted);

            for (const specialty of createSpecialtyIds) {
                await tnx.doctorSpecialties.create({
                    data: {
                        doctorId: id,
                        specialitiesId: specialty.specialtyId
                    }
                })
            }

        }

        const updatedData = await tnx.doctor.update({
            where: {
                id: doctorInfo.id
            },
            data: doctorData,
            include: {
                doctorSpecialties: {
                    include: {
                        specialities: true
                    }
                }
            }
        })

        return updatedData
    })


}


export const DoctorService={
    createDoctor,
    getAllFromDB,
    updateIntoDB
}