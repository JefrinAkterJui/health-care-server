import express from "express";
import { UserController } from "./user.controller";

const router = express.Router()

router.post("/create-paitent", UserController.createPatient)

export const UserRouter = router;