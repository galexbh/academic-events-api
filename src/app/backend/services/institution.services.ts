import { Institution, InstitutionModel } from '../models/institution.model';

export function createUser(input: Partial<Institution>) {
    return InstitutionModel.create(input);
}

export function findInstitutionByDomain(domain: string) {
    return InstitutionModel.findOne({ domain })
}