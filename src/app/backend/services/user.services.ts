import UserModel, { User } from "../models/user.models";

export function createUser(input: Partial<User>) {
    return UserModel.create(input);
}

export function findUserById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
    }
    return UserModel.findById(id);
}

export function findUserByEmail(email: string) {
    return UserModel.findOne({ email });
}
