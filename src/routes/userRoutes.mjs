import express from 'express';
import { addUser, listUsers } from '../controllers/userController.mjs';

const router = express.Router();

router.route('/').get(listUsers).post(addUser);

export default router;