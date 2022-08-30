import { Institution, InstitutionModel } from "../models/institution.model";

export class InstitutionServices {
  public createInstitution(input: Partial<Institution>) {
    return InstitutionModel.create(input);
  }
  
  public findInstitutions() {
    return InstitutionModel.find();
  }
  
  public findInstitutionByDomain(domain: string) {
    return InstitutionModel.findOne({ domain });
  }
  
}
