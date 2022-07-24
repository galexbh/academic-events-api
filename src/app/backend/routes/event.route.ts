import { Application } from "express";
import { EventController } from "../controllers/event.controller";
import {
  createEventSchema,
  idEventSchema,
  updateEventSchema,
} from "../schemas/event.schema";
import { schemaValition } from "../middlewares/schemaValidator.middleware";
import verifyUser from "../middlewares/verifyUser.middleware";

export class EventRoute {
  private eventcontroller: EventController;

  constructor(private app: Application) {
    this.eventcontroller = new EventController();
    this.routes();
  }

  public routes() {
    this.app.post(
      "/api/v1/events",
      [verifyUser, schemaValition(createEventSchema)],
      this.eventcontroller.createEventHandler
    );

    this.app.post(
      "/api/v1/events/subscribed/:id",
      [verifyUser, schemaValition(idEventSchema)],
      this.eventcontroller.eventSubscriptionHandler
    );

    this.app.put(
      "/api/v1/events/:id",
      [verifyUser, schemaValition(updateEventSchema)],
      this.eventcontroller.updateEventHandler
    );

    this.app.delete(
      "/api/v1/events/:id",
      [verifyUser, schemaValition(idEventSchema)],
      this.eventcontroller.deleteEventHandler
    );

    this.app.get(
      "/api/v1/events/public",
      verifyUser,
      this.eventcontroller.getPublicEventHandler
    );

    this.app.get(
      "/api/v1/events/private",
      verifyUser,
      this.eventcontroller.getPrivateEventHandler
    );

    this.app.get(
      "/api/v1/events/own",
      verifyUser,
      this.eventcontroller.myOwnEventsHandler
    );

    this.app.get(
      "/api/v1/events/me",
      verifyUser,
      this.eventcontroller.myEventRegistrationHandler
    );
  }
}
