import { addHours, format, addMinutes, addDays } from "date-fns";
import { prisma } from "../../shared/prisma";
import { Prisma } from "@prisma/client";
import { calculatePagination, IOptions } from "../../helper/paginationHelper";
import { IJWTPayload } from "../../types/common";

const insertIntoDB = async (payload: any) => {

    const { startTime, endTime, startDate, endDate } = payload;

    const intervalTime = 30;
    const schedules = [];

    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
        let startDateTime = new Date(
            addMinutes(
                addHours(
                    new Date(format(currentDate, "yyyy-MM-dd")),
                    Number(startTime.split(":")[0])
                ),
                Number(startTime.split(":")[1])
            )
        )

        const endDateTime = new Date(
            addMinutes(
                addHours(
                    new Date(format(currentDate, "yyyy-MM-dd")), 
                    Number(endTime.split(":")[0])
                ),
                Number(endTime.split(":")[1])
            )
        )

        while (startDateTime < endDateTime) {
            const slotEndDateTime = addMinutes(startDateTime, intervalTime);

            const scheduleData = {
                startDateTime: startDateTime,
                endDateTime: slotEndDateTime
            }

            const existingSchedule = await prisma.schedule.findFirst({
                where: scheduleData
            })

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData
                });
                schedules.push(result)
            }
            startDateTime = slotEndDateTime; 
        }
        currentDate = addDays(currentDate, 1);
    }

    return schedules;
}

const schedulesForDoctor = async (
    user: IJWTPayload,
    fillters: any,
    options: IOptions
) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
    const { startDateTime: filterStartDateTime, endDateTime: filterEndDateTime } = fillters;

    const andConditions: Prisma.ScheduleWhereInput[] = [];

    if (filterStartDateTime && filterEndDateTime) {
        andConditions.push({
            AND: [
                {
                    startDateTime: {
                        gte: filterStartDateTime
                    }
                },
                {
                    endDateTime: {
                        lte: filterEndDateTime
                    }
                }
            ]
        })
    }

    const whereConditions: Prisma.ScheduleWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}


    const doctorSchedules = await prisma.doctorSchedules.findMany({
        where: {
            doctor: {
                email: user.email
            }
        },
        select: {
            scheduleId: true
        }
    });

    const doctorScheduleIds = doctorSchedules.map(schedule => schedule.scheduleId);

    const result = await prisma.schedule.findMany({
        where: {
            ...whereConditions,
            id: {
                in: doctorScheduleIds 
            }
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.schedule.count({
        where: {
            ...whereConditions,
            id: {
                in: doctorScheduleIds 
            }
        }
    });

    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
}

export const ScheduleService = {
    insertIntoDB,
    schedulesForDoctor
}