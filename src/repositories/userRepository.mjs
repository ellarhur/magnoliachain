import User from '../models/User.mjs';

export default class UserRepository {
  async add(user) {
    const userData = { ...user };
    return await User.create(userData);
  }

  async find(email, login) {
    return login === true
      ? await User.findOne({ email: email }).select('+password')
      : await User.findOne({ email: email });
  }

  async findById(id) {
    return await User.findById(id);
  }

  async list() {
    return await User.find();
  }
}