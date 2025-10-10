import express from 'express';
import { UserRouter } from '../modules/user/user.routes';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: UserRouter
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;