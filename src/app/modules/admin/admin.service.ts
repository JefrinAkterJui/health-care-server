import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AdminValidation } from "./admin.validation";
import { Prisma, UserRole } from "@prisma/client";
import { userSearchableFields } from "./admin.constans";
import { calculatePagination, IOptions } from "../../helper/paginationHelper";


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

const getAllUser = async(params: any, options: IOptions)=>{
    const {page, limit, skip, sortBy, sortOrder} = calculatePagination(options);
    const { searchTerm, ...filterData} = params;

    const andConditions: Prisma.UserWhereInput[]=[];

    if(searchTerm){
        andConditions.push({
            OR: userSearchableFields.map(field =>({
                [field] :{
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    };
    if(Object.keys(filterData).length >0){
        andConditions.push({
            AND: Object.keys(filterData).map(key =>({
                [key] :{
                    equals: (filterData as any) [key]
                }
            }))
        })
    };
    
    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}

    const result = await prisma.user.findMany({
        skip,
        take: limit,
        where:{
            AND: whereConditions
        },
        orderBy:{
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.user.count({
        where: whereConditions
    })
    return{
        meta:{
            page,
            limit,
            total
        },
        data: result
    }
}

export const AdminService = {
    createAdmin,
    getAllUser
}