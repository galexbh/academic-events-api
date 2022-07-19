import { Request, Response } from "express";

export class MainController {
  public welcome(_req: Request, res: Response) {
    return res.send({ message: "Hello World" });
  }
}
