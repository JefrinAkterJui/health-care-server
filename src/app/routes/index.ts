import express from 'express';
import { UserRouter } from '../modules/user/user.routes';
import { AuthRouter } from '../modules/auth/auth.routes';
import { DoctorRouter } from '../modules/doctor/doctor.routes';
import { AdminRouter } from '../modules/admin/admin.routes';
import { ScheduleRouter } from '../modules/schedule/schedule.route';
import { DoctorScheduleRoutes } from '../modules/doctorSchedule/doctorSchedule.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRouter,
  },
  {
    path:"/auth",
    route: AuthRouter
  },
  {
    path:"/doctor",
    route: DoctorRouter
  },
  {
    path:"/admin",
    route: AdminRouter
  },
  {
    path:"/schedule",
    route: ScheduleRouter
  },
  {
    path:"/doctorSchedule",
    route: DoctorScheduleRoutes
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;