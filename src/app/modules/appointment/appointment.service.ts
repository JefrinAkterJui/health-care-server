import { v4 as uuidv4 } from 'uuid';
import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import ApiError from '../../error/ApiError'; 
import httpStatus from 'http-status'; 


const createAppointment = async (user: IJWTPayload, payload: { doctorId: string, scheduleId: string }) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    });

    const isBookedOrNot = await prisma.doctorSchedules.findFirst({
        where: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked: false
        }
    })
    if (!isBookedOrNot) {
        throw new ApiError(httpStatus.BAD_REQUEST, "This appointment slot is not available or has already been booked!");
    }

    const videoCallingId = uuidv4();

    const result = await prisma.$transaction(async (tnx) => {
        const appointmentData = await tnx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            }
        })

        await tnx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId
                }
            },
            data: {
                isBooked: true
            }
        })

        const transactionId = uuidv4();

        await tnx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        return appointmentData;
    })

    return result;
};

export const AppointmentService = {
    createAppointment,
};