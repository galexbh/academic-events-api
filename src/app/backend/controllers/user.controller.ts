import { Request, Response } from "express";
import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyUserInput,
} from "../schemas/user.schema";
import { UserServices } from "../services/user.services";
import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import log from "../shared/logger";
import { RoleServices } from "../services/role.services";
import sendEmail from "../shared/mailer";
import { templateVerifyUser } from "../templates/verify";
import { templateResetPassword } from "../templates/resetPassword";
import { InstitutionServices } from "../services/institution.services";
import { assign } from "lodash";
import config from "config";

const mailCompany = config.get<string>("emailAddress");
const unexpectedRequest = config.get<string>("unexpected");

export class UserController {
  private readonly userServices: UserServices;
  private readonly roleServices: RoleServices;
  private readonly institutionServices: InstitutionServices;

  public async createUserHandler(
    _req: Request<{}, {}, CreateUserInput>,
    res: Response
  ) {
    const body = _req.body;

    try {
      if (!body.roles) {
        const role = await this.roleServices.findOneRoleByName();
        body.roles = [role?._id];
      } else {
        const foundRoles = await this.roleServices.findRoles(body.roles);
        body.roles = foundRoles.map((role: any) => role._id);
      }

      const domain = body.email.substring(
        body.email.indexOf("@") + 1,
        body.email.length
      );

      const Institution =
        await this.institutionServices.findInstitutionByDomain(domain);

      const payload = assign({ institution: Institution?._id }, body);

      const user = await this.userServices.createUser(payload);

      const template = templateVerifyUser(
        user.firstName,
        user._id,
        user.verificationCode
      );

      await sendEmail({
        to: user.email,
        from: mailCompany,
        subject: "Verify your email",
        html: template,
      });

      return res
        .status(StatusCodes.CREATED)
        .json({ message: "User successfully created" });
    } catch (e: any) {
      if (e.code === 11000) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "Account already exists" });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async verifyUserHandler(req: Request<VerifyUserInput>, res: Response) {
    try {
      const { id, verificationCode } = req.params;

      const user = await this.userServices.findUserById(id);

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User not found" });
      }

      if (user.verified) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User is already verified" });
      }

      if (user.verificationCode === verificationCode) {
        user.verified = true;

        await user.save();

        return res
          .status(StatusCodes.OK)
          .json({ message: "Successfully updated verified" });
      }
      return res.status(StatusCodes.REQUEST_TIMEOUT).json({
        message: "Could not verify user",
      });
    } catch (e: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: unexpectedRequest });
    }
  }

  public async forgotPasswordHandler(
    req: Request<{}, {}, ForgotPasswordInput>,
    res: Response
  ) {
    try {
      const message =
        "If a user with that email is registered you will receive a password reset email";

      const { email } = req.body;

      const user = await this.userServices.findUserByEmail(email);

      if (!user) {
        log.debug(`User with email ${email} does not exists`);
        return res.status(StatusCodes.NOT_FOUND).json({ message: message });
      }

      if (!user.verified) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User is not verified" });
      }

      const passwordResetCode = nanoid();

      user.passwordResetCode = passwordResetCode;

      await user.save();

      const template = templateResetPassword(
        user.firstName,
        user._id,
        user.passwordResetCode
      );

      await sendEmail({
        to: user.email,
        from: mailCompany,
        subject: "Reset your password",
        html: template,
      });

      log.debug(`Password reset email sent to ${email}`);

      return res.status(StatusCodes.OK).json({ message: message });
    } catch (e: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async resetPasswordHandler(
    req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
    res: Response
  ) {
    try {
      const { id, passwordResetCode } = req.params;

      const { password } = req.body;

      const user = await this.userServices.findUserById(id);

      if (
        !user ||
        !user.passwordResetCode ||
        user.passwordResetCode !== passwordResetCode
      ) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Could not reset user password" });
      }

      user.passwordResetCode = null;

      user.password = password;

      await user.save();

      return res
        .status(StatusCodes.OK)
        .json({ message: "Successfully updated password" });
    } catch (e: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public getCurrentUserHandler(_req: Request, res: Response) {
    return res.json(res.locals.user);
  }
}
