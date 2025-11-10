import z from "zod";
import { DoctorValidation } from "./doctor.validation";
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { Doctor, Prisma, UserRole, UserStatus } from "@prisma/client";
import { doctorSearchableFields } from "./doctor.constant";
import { calculatePagination, IOptions } from "../../helper/paginationHelper";
import { IDoctorUpdateInput } from "./doctor.interface";
import ApiError from "../../error/ApiError";
import { StatusCodes } from "http-status-codes";
import { getSpecialtiesFromSymptoms } from "../../helper/aiService";

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

const getAISuggestions = async (payload: { symptoms: string }) => {
    if (!(payload && payload.symptoms)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "symptoms is required!");
    }
    const relevantSpecialties = await getSpecialtiesFromSymptoms(payload.symptoms);

    if (!relevantSpecialties || relevantSpecialties.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Could not determine any relevant specialty for these symptoms.");
    }
    
    console.log(`AI suggested specialties: ${relevantSpecialties.join(', ')}`);

    const doctors = await prisma.doctor.findMany({
        where: {
            isDeleted: false,
            doctorSpecialties: {
                some: { 
                    specialities: {
                        title: {
                            in: relevantSpecialties, 
                            mode: 'insensitive' 
                        }
                    }
                }
            }
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        },
        orderBy: {
            experience: 'desc' 
        },
        take: 10
    });

    if (!doctors || doctors.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No doctors found matching the suggested specialties.");
    }
    return doctors;
}

const getByIdFromDB = async (id: string): Promise<Doctor | null> => {
    const result = await prisma.doctor.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true,
                },
            },
            doctorSchedules: {
                include: {
                    schedule: true
                }
            }
        },
    });
    return result;
};

const deleteFromDB = async (id: string): Promise<Doctor> => {
    return await prisma.$transaction(async (transactionClient) => {
        const deleteDoctor = await transactionClient.doctor.delete({
            where: {
                id,
            },
        });

        await transactionClient.user.delete({
            where: {
                email: deleteDoctor.email,
            },
        });

        return deleteDoctor;
    });
};

const softDelete = async (id: string): Promise<Doctor> => {
    return await prisma.$transaction(async (transactionClient) => {
        const deleteDoctor = await transactionClient.doctor.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: deleteDoctor.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return deleteDoctor;
    });
};




export const DoctorService={
    createDoctor,
    getAllFromDB,
    updateIntoDB,
    getAISuggestions,
    getByIdFromDB,
    deleteFromDB,
    softDelete
}