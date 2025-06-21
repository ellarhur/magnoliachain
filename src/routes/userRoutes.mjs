import express from 'express';
import { addUser, listUsers, getWallet } from '../controllers/userController.mjs';
import { protect } from '../controllers/authController.mjs';

const router = express.Router();

router.route('/').get(listUsers).post(addUser);
router.route('/wallet').get(protect, getWallet);

export default router;