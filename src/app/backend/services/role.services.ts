import RoleModel from "../models/role.model";

export class RoleServices {
  public findRoles(name: string[]) {
    return RoleModel.find({ name });
  }

  public findOneRoleByName(name: string = "user") {
    return RoleModel.findOne({ name });
  }
}
