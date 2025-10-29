import { addHours, format, addMinutes, addDays } from "date-fns";
import { prisma } from "../../shared/prisma";

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

export const ScheduleService = {
    insertIntoDB
}