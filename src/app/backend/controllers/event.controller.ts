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

const mailCompany = config.get<string>("emailAddress");

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
    try {
      await createEvent(payload);

      return res
        .status(StatusCodes.CREATED)
        .json({ message: "Event successfully created" });
    } catch (e: any) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Conflicts when creating the event" });
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
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Conflicts when updating the event" });
    }
  }

  public async deleteEventHandler(req: Request<IdEventInput>, res: Response) {
    const { id } = req.params;

    try {
      await findEventByIdAndDelete(id);
      return res
        .status(StatusCodes.OK)
        .json({ message: "Event successfully deleted" });
    } catch (e: any) {
      console.log(e);
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Conflicts when deleting the event" });
    }
  }

  public async getPublicEventHandler(_req: Request, res: Response) {
    try {
      const publicEvents = await findEventsPublic();
      return res
        .status(StatusCodes.OK)
        .json({ message: "Successful public events", publicEvents });
    } catch (e: any) {
      console.log(e);
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Conflicts in obtaining events" });
    }
  }

  public async getPrivateEventHandler(_req: Request, res: Response) {
    const user = res.locals.user;
    try {
      const privateEvents = await findEventsPrivate(user.institution);
      return res
        .status(StatusCodes.OK)
        .json({ message: "Successful private events", privateEvents });
    } catch (e: any) {
      console.log(e);
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Conflicts in obtaining events" });
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
        message:
          "The server encountered an unexpected condition that prevented it from fulfilling the request",
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
        message:
          "The server encountered an unexpected condition that prevented it from fulfilling the request",
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
        message:
          "The server encountered an unexpected condition that prevented it from fulfilling the request",
      });
    }
  }
}
