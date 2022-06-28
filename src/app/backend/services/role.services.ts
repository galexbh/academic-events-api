import RoleModel from "../models/role.model";

export function findRoles(name: string[]) {
    return RoleModel.find({ name });
}

export function findOneRoleByName(name: string) {
    return RoleModel.findOne({ name });
}