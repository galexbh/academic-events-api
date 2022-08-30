import { DocumentType } from "@typegoose/typegoose";
import { omit } from "lodash";
import SessionModel from "../models/session.model";
import { privateFields, User } from "../models/user.model";
import { signJwt } from "../shared/jwt";

export class AuthServices {

  private async createSession({ userId }: { userId: string }) {
    return SessionModel.create({ user: userId });
  }
  
  public async findSessionById(id: string) {
    return SessionModel.findById(id);
  }
  
  public async signRefreshToken({ userId }: { userId: string }) {
    const session = await this.createSession({
      userId,
    });
  
    const refreshToken = signJwt(
      {
        session: session._id,
      },
      "refreshTokenPrivateKey",
      {
        expiresIn: "30d",
      }
    );
  
    return refreshToken;
  }
  
  public signAccessToken(user: DocumentType<User>) {
    const payload = omit(user.toJSON(), privateFields);
  
    const accessToken = signJwt(payload, "accessTokenPrivateKey", {
      expiresIn: "5m",
    });
  
    return accessToken;
  }
  
}