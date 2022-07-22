import { Request, Response } from "express";
import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyUserInput,
} from "../schemas/user.schema";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../services/user.services";
import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import log from "../shared/logger";
import { findOneRoleByName, findRoles } from "../services/role.services";
import sendEmail from "../shared/mailer";
import config from "config";
import { templateVerifyUser } from "../templates/verify";
import { templateResetPassword } from "../templates/resetPassword";
import { findInstitutionByDomain } from "../services/institution.services";
import { assign } from "lodash";

const mailCompany = config.get<string>("emailAddress");

export class UserController {
  public async createUserHandler(
    _req: Request<{}, {}, CreateUserInput>,
    res: Response
  ) {
    const body = _req.body;

    try {
      if (!body.roles) {
        const role = await findOneRoleByName();
        body.roles = [role?._id];
      } else {
        const foundRoles = await findRoles(body.roles);
        body.roles = foundRoles.map((role) => role._id);
      }

      const domain = body.email.substring(
        body.email.indexOf("@") + 1,
        body.email.length
      );

      const Institution = await findInstitutionByDomain(domain);

      const payload = assign({ institution: Institution?._id }, body);

      const user = await createUser(payload);

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
        message:
          "The server encountered an unexpected condition that prevented it from fulfilling the request",
      });
    }
  }

  public async verifyUserHandler(req: Request<VerifyUserInput>, res: Response) {
    const { id, verificationCode } = req.params;

    const user = await findUserById(id);

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

      try {
        await user.save();

        return res
          .status(StatusCodes.ACCEPTED)
          .json({ message: "Successfully updated verified" });
      } catch (e: any) {
        return res.status(StatusCodes.REQUEST_TIMEOUT).json({
          message:
            "The server did not receive a complete request message within the time that it was prepared to wait",
        });
      }
    }

    return res
      .status(StatusCodes.CONFLICT)
      .json({ message: "Could not verify user" });
  }

  public async forgotPasswordHandler(
    req: Request<{}, {}, ForgotPasswordInput>,
    res: Response
  ) {
    try {
      const message =
        "If a user with that email is registered you will receive a password reset email";

      const { email } = req.body;

      const user = await findUserByEmail(email);

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
        user.verificationCode
      );

      await sendEmail({
        to: user.email,
        from: mailCompany,
        subject: "Reset your password",
        html: template,
      });

      log.debug(`Password reset email sent to ${email}`);

      return res.status(StatusCodes.ACCEPTED).json({ message: message });
    } catch (e: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message:
            "The server encountered an unexpected condition that prevented it from fulfilling the request",
        });
    }
  }

  public async resetPasswordHandler(
    req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
    res: Response
  ) {
    const { id, passwordResetCode } = req.params;

    const { password } = req.body;

    const user = await findUserById(id);

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

    try {
      await user.save();

      return res
        .status(StatusCodes.ACCEPTED)
        .json({ message: "Successfully updated password" });
    } catch (e: any) {
      return res.status(StatusCodes.REQUEST_TIMEOUT).json({
        message:
          "The server did not receive a complete request message within the time that it was prepared to wait",
      });
    }
  }

  public getCurrentUserHandler(_req: Request, res: Response) {
    return res.json(res.locals.user);
  }
}
