import User from '../models/blockchain/User.mjs';

export default class UserRepository {
  async add(user) {
    const { username, email, password } = user;
    return await User.create({ username, email, password });
  }

  async find(email, login = false) {
    return login === true
      ? await User.findOne({ email }).select('+password')
      : await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id);
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  async list() {
    return await User.find();
  }
}