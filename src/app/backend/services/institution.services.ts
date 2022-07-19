import { Institution, InstitutionModel } from "../models/institution.model";

export function createInstitution(input: Partial<Institution>) {
  return InstitutionModel.create(input);
}

export function findInstitutions() {
  return InstitutionModel.find();
}

export function findInstitutionByDomain(domain: string) {
  return InstitutionModel.findOne({ domain });
}
