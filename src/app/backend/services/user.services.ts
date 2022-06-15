import { Request, Response } from "express";
import UserModel, {User} from "../models/user.models";

export class UserServices {
    public async createUser(req: Request, res: Response) {
        const {
            firstName,
            lastname,
            email,
            password,
          } = req.body;
        
        

        return res.status(200).json({ message: "registered" });
    }

    public async loginUser(req: Request, res: Response) {
        const {
            email,
            password,
          } = req.body;


        const passwordroot = await User.findOne({email})

        if(passwordroot !== password) {
            return res.status(400).json({ message: "no access" });
        } else {
            return res.status(200).json({ message: "access" });
        }
    }
}