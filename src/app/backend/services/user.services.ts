import UserModel, { User } from "../models/user.model";

export class UserServices {
  public createUser(input: Partial<User>) {
    return UserModel.create(input);
  }

  public findUserById(id: string) {
    return UserModel.findById(id);
  }

  public findUserByEmail(email: string) {
    return UserModel.findOne({ email })
      .populate("roles", "-_id name")
      .populate("institution", "name");
  }
}
