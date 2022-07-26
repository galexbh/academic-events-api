import { Request, Response } from "express";
import {
  CreateEventInput,
  IdEventInput,
  UpdateEventInput,
} from "../schemas/event.schema";
import { StatusCodes } from "http-status-codes";
import {
  createEvent,
  findEventByIdAndDelete,
  findEventByIdAndUpdate,
  findEventsPrivate,
  findEventsPublic,
  findOneEvent,
  searchMyRegisteredEvents,
  searchOwnEvents,
} from "../services/event.sevices";
import { assign } from "lodash";
import sendEmail from "../shared/mailer";
import config from "config";
import { templateEventSubscription } from "../templates/eventSubscription";
import { UploadedFile } from "express-fileupload";
import { deleteImage, uploadImage } from "../shared/cloudinary";
import fs from "fs-extra";

const mailCompany = config.get<string>("emailAddress");
const unexpectedRequest = config.get<string>("unexpected");

export class EventController {
  public async createEventHandler(
    req: Request<{}, {}, CreateEventInput>,
    res: Response
  ) {
    const user = res.locals.user;
    const payload = assign(
      { owner: user._id, institution: user.institution },
      req.body
    );
    const { tempFilePath } = req.files?.image as UploadedFile;
    console.log(req.files?.image as UploadedFile);
    try {
      const event = await createEvent(payload);

      if (tempFilePath) {
        const result = await uploadImage(tempFilePath);
        event.image = {
          publicId: result.public_id,
          secureUrl: result.secure_url,
        };
        await fs.unlink(tempFilePath);
      }

      await event.save();

      return res
        .status(StatusCodes.CREATED)
        .json({ message: "Event successfully created" });
    } catch (e: any) {
      if (tempFilePath) {
        await fs.unlink(tempFilePath);
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
    const { id } = req.params;

    try {
      await findEventByIdAndUpdate(id, { ...req.body });
      return res
        .status(StatusCodes.OK)
        .json({ message: "Event successfully updated" });
    } catch (e: any) {
      console.log(e);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async deleteEventHandler(req: Request<IdEventInput>, res: Response) {
    const { id } = req.params;

    try {
      const deleteEvent = await findEventByIdAndDelete(id);

      if (!deleteEvent) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "There are no public events" });
      }

      await deleteImage(deleteEvent.image.publicId);

      return res
        .status(StatusCodes.OK)
        .json({ message: "Event successfully deleted" });
    } catch (e: any) {
      console.log(e);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async getPublicEventHandler(_req: Request, res: Response) {
    try {
      const publicEvents = await findEventsPublic();

      if (!publicEvents) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "There are no public events" });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "Successful public events", publicEvents });
    } catch (e: any) {
      console.log(e);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: unexpectedRequest,
      });
    }
  }

  public async getPrivateEventHandler(_req: Request, res: Response) {
    const user = res.locals.user;
    try {
      const privateEvents = await findEventsPrivate(user.institution);

      if (!privateEvents) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "There are no private events" });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "Successful private events", privateEvents });
    } catch (e: any) {
      console.log(e);
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
      const event = await findOneEvent(id);

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

      for (const subscribedUsers of event.subscribers) {
        if (String(subscribedUsers) === String(user._id)) {
          return res
            .status(StatusCodes.NOT_ACCEPTABLE)
            .json({ message: "Already registered for the event" });
        }
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

  public async myEventRegistrationHandler(_req: Request, res: Response) {
    const user = res.locals.user;

    try {
      const events = await searchMyRegisteredEvents(user._id);

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
      const events = await searchOwnEvents(user._id);

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
