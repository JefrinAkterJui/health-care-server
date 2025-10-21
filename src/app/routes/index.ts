import express from 'express';
import { UserRouter } from '../modules/user/user.routes';
import { AuthRouter } from '../modules/auth/auth.routes';
import { DoctorRouter } from '../modules/doctor/doctor.routes';
import { AdminRouter } from '../modules/admin/admin.routes';

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
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;