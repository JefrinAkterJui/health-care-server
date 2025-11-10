import { z } from "zod";

const createAppointmentValidationSchema = z.object({
    doctorId: z.string({
        error: "Doctor ID is required!"
    }),
    scheduleId: z.string({
        error: "Schedule ID is required!"
    })
});

export const AppointmentValidation = {
    createAppointmentValidationSchema
}