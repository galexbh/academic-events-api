import { Request, Response } from "express";
import {
  CreateEventInput,
  IdEventInput,
  UpdateEventInput,
} from "../schemas/event.schema";
import { templateEventSubscription } from "../templates/eventSubscription";
import { deleteImage, uploadImage } from "../shared/cloudinary";
import { EventServices } from "../services/event.sevices";
import sendEmail from "../shared/mailer";
import { UploadedFile } from "express-fileupload";
import { StatusCodes } from "http-status-codes";
import { assign } from "lodash";
import config from "config";
import fs from "fs-extra";

const mailCompany = config.get<string>("emailAddress");
const unexpectedRequest = config.get<string>("unexpected");
const publicIdDefault = config.get<string>("public_id");
const secureUrlDefault = config.get<string>("secure_url");

export class EventController {
  private readonly eventServices: EventServices;
  
  public async createEventHandler(
    req: Request<{}, {}, CreateEventInput>,
    res: Response
  ) {
    const user = res.locals.user;
    const payload = assign(
      { owner: user._id, institution: user.institution },
      req.body
    );
    const image = req.files?.image as UploadedFile;

    try {
      const event = await this.eventServices.createEvent(payload);

      if (image) {
        const result = await uploadImage(image.tempFilePath);
        event.image = {
          publicId: result.public_id,
          secureUrl: result.secure_url,
        };
        await fs.unlink(image.tempFilePath);
        await event.save();
        return res
          .status(StatusCodes.CREATED)
          .json({ message: "Event successfully created" });
      }

      event.image = {
        publicId: publicIdDefault,
        secureUrl: secureUrlDefault,
      };

      await event.save();

      return res
        .status(StatusCodes.CREATED)
        .json({ message: "Event successfully created" });
    } catch (e: any) {
      if (image) {
        await fs.unlink(image.tempFilePath);
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async updateEventHandler(
    req: Request<UpdateEventInput["params"], {}, UpdateEventInput["body"]>,
    res: Response
  ) {
    try {
      const { id } = req.params;
      const event = await this.eventServices.findEventByIdAndUpdate(id, {
        ...req.body,
      });

      if (!event) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "There are no public events" });
      }

      const image = req.files?.image as UploadedFile;

      if (image) {
        if (event.image.publicId !== publicIdDefault) {
          await deleteImage(event.image.publicId);
        }
        const result = await uploadImage(image.tempFilePath);
        event.image = {
          publicId: result.public_id,
          secureUrl: result.secure_url,
        };
        await event.save();
        return res
          .status(StatusCodes.OK)
          .json({ message: "Event successfully updated" });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "Event successfully updated" });
    } catch (e: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async deleteEventHandler(req: Request<IdEventInput>, res: Response) {
    try {
      const { id } = req.params;
      const deleteEvent = await this.eventServices.findEventByIdAndDelete(id);

      if (!deleteEvent) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "There are no public events" });
      }

      if (deleteEvent.image.publicId !== publicIdDefault) {
        await deleteImage(deleteEvent.image.publicId);
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "Event successfully deleted" });
    } catch (e: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async getPublicEventHandler(_req: Request, res: Response) {
    try {
      const publicEvents = await this.eventServices.findEventsPublic();

      if (!publicEvents) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "There are no public events" });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "Successful public events", publicEvents });
    } catch (e: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async getPrivateEventHandler(_req: Request, res: Response) {
    const user = res.locals.user;
    try {
      const privateEvents = await this.eventServices.findEventsPrivate(
        user.institution
      );

      if (!privateEvents) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "There are no private events" });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "Successful private events", privateEvents });
    } catch (e: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async eventSubscriptionHandler(
    req: Request<IdEventInput>,
    res: Response
  ) {
    const user = res.locals.user;
    try {
      const { id } = req.params;
      const event = await this.eventServices.findEventById(id);

      if (!event) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No event found" });
      }

      if (event.registeredParticipants >= event.limitParticipants) {
        return res
          .status(StatusCodes.ACCEPTED)
          .json({ message: "No more quotas" });
      }

      const subscriberIndex = event.subscribers.indexOf(user._id);
      if (subscriberIndex !== -1) {
        return res
          .status(StatusCodes.NOT_ACCEPTABLE)
          .json({ message: "Already registered for the event" });
      }

      event.registeredParticipants++;
      event.subscribers.push(user._id);
      event.save();

      const template = templateEventSubscription(user.firstName, event.title);

      await sendEmail({
        to: user.email,
        from: mailCompany,
        subject: "Thank you for registering",
        html: template,
      });

      return res
        .status(StatusCodes.OK)
        .json({ message: "User has registered to the event" });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async unsubscribeEventHandler(
    req: Request<IdEventInput>,
    res: Response
  ) {
    const user = res.locals.user;
    try {
      const { id } = req.params;
      const event = await this.eventServices.findEventById(id);

      if (!event) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No event found" });
      }

      const subscriberIndex = event.subscribers.indexOf(user._id);
      if (subscriberIndex !== -1 && event.registeredParticipants > 0) {
        event.subscribers.splice(subscriberIndex, 1);
        event.registeredParticipants--;

        event.save();

        return res
          .status(StatusCodes.OK)
          .json({ message: "Unsubscribed from the event" });
      }

      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "You are not subscribed to the event" });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async showRegisteredUsersHandler(
    req: Request<IdEventInput>,
    res: Response
  ) {
    const user = res.locals.user;

    try {
      const { id } = req.params;
      const events = await this.eventServices.searchRegisteredUsers(
        id,
        user._id
      );

      if (!events) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "no events found" });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "Registered users found", events });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async myEventRegistrationHandler(_req: Request, res: Response) {
    const user = res.locals.user;

    try {
      const events = await this.eventServices.searchMyRegisteredEvents(
        user._id
      );

      if (!events) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "no events found" });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "Found events", events });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async myOwnEventsHandler(_req: Request, res: Response) {
    const user = res.locals.user;

    try {
      const events = await this.eventServices.searchOwnEvents(user._id);

      if (!events) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "no events found" });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "Found events", events });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }
}
