import { Request, Response } from "express";
import { User, UserModel } from '../models/user.models';

export class UserServices {
    public async createUser(req: Request, res: Response) {
        try {
            const user: User = await UserModel.create({ ...req.body });
            return res.status(201).json({ message: "registered", user });
        } catch (err) {
            return res.status(400).json({ message: "Unable to register" });
        }
    }

    public async loginUser(req: Request, res: Response) {
        const { email, password } = req.body;
        const user: User | null = await UserModel.findOne({ email });

        if (password !== user?.password) {
            return res.status(400).json({ message: "not access" });
        }

        return res.status(201).json({ message: "login", user });

    }
}
