import { catchErrorAsync } from '../middleware/catchErrorAsync.mjs';
import UserRepository from '../repositories/users-repository.mjs';


export const addUser = catchErrorAsync(async (req, res, next) => {
  const user = await new UserRepository().add(req.body);

  res
    .status(201)
    .json({ success: true, statusCode: 201, data: { user: user } });
});
