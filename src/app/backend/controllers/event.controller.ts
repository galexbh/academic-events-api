import { Request, Response } from 'express';
import { CreateEventInput, IdEventInput, UpdateEventInput } from '../schemas/event.schema';
import { StatusCodes } from 'http-status-codes';
import { createEvent, findEventByIdAndDelete, findEventByIdAndUpdate, findEventsPrivate, findEventsPublic } from '../services/event.sevices';
import { assign } from 'lodash';

export class EventController {
    public async createEventHandler(req: Request<{}, {}, CreateEventInput>, res: Response) {
        const user = res.locals.user;
        const payload = assign({ owner: user._id }, req.body)
        try {
            await createEvent(payload);

            return res.status(StatusCodes.CREATED).json({ message: "Event successfully created" })
        } catch (e: any) {
            return res.status(StatusCodes.CONFLICT).json({ message: "Conflicts when creating the event" });
        }
    }

    public async updateEventHandler(req: Request<UpdateEventInput["params"], {}, UpdateEventInput["body"]>, res: Response) {
        const { id } = req.params;

        try {
            await findEventByIdAndUpdate(id, { ...req.body });
            return res.status(StatusCodes.OK).json({ message: "Event successfully created" })
        } catch (e: any) {
            console.log(e);
            return res.status(StatusCodes.CONFLICT).json({ message: "Conflicts when creating the event" });
        }
    }

    public async deleteEventHandler(req: Request<IdEventInput>, res: Response) {
        const { id } = req.params;

        try {
            await findEventByIdAndDelete(id);
            return res.status(StatusCodes.OK).json({ message: "Event successfully created" })
        } catch (e: any) {
            console.log(e);
            return res.status(StatusCodes.CONFLICT).json({ message: "Conflicts when creating the event" });
        }
    }


    public async getPublicEventHandler(_req: Request, res: Response) {

        try {
            const publicEvents = await findEventsPublic();
            return res.status(StatusCodes.OK).json({ message: "Event successfully created", publicEvents })
        } catch (e: any) {
            console.log(e);
            return res.status(StatusCodes.CONFLICT).json({ message: "Conflicts when creating the event" });
        }
    }

    public async getPrivateEventHandler(_req: Request, res: Response) {

        try {
            const privateEvents = await findEventsPrivate();
            return res.status(StatusCodes.OK).json({ message: "Event successfully created", privateEvents })
        } catch (e: any) {
            console.log(e);
            return res.status(StatusCodes.CONFLICT).json({ message: "Conflicts when creating the event" });
        }
    }
}