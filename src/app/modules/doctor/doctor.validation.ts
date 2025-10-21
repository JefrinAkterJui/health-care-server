import { Gender } from "@prisma/client";
import z from "zod";


const createDoctorValidationSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    
    doctor: z.object({
        name: z.string().nonempty("Name is required!"),
        
        email: z.string().email("Invalid email address!"),
        
        profilePhoto: z.string().url("Invalid photo URL!").optional(),
        
        contactNumber: z.string().nonempty("Contact number is required!"),
        
        address: z.string().nonempty("Address is required!"),
        
        registrationNumber: z.string().nonempty("Registration number is required!"),
        
        experience: z.number().int().positive("Experience must be a positive number").optional().default(0),
        
        gender: z.nativeEnum(Gender),
        
        appointmentFee: z.number().int().positive("Appointment fee must be a positive number"),
        
        qualification: z.string().nonempty("Qualification is required!"),
        
        currentWorkingPlace: z.string().nonempty("Current working place is required!"),
        
        designation: z.string().nonempty("Designation is required!")
    })
});

export const DoctorValidation = {
    createDoctorValidationSchema
}