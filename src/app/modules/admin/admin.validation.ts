import z from "zod";

const createAdminValidationSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    admin: z.object({
        name: z.string().nonempty("Name is required!"),
        email: z.string().email("Invalid email address!"),
        profilePhoto: z.string().url("Invalid photo URL!").optional(),
        contactNumber: z.string().nonempty("Contact number is required!")
    })
});

export const AdminValidation = {
    createAdminValidationSchema
}