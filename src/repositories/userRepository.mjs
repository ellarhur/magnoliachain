import User from '../models/User.mjs';

export default class UserRepository {
  async add(user) {
    const { firstName, lastName, email, password } = user;
    return await User.create({ firstName, lastName, email, password });
  }

  async find(email, login) {
    return login === true
      ? await User.findOne({ email: email }).select('+password')
      : await User.findOne({ email: email });
  }

  async list() {
    return await User.find();
  }
}