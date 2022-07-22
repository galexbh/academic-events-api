import { EventModel, Event } from "../models/event.model";

export function createEvent(input: Partial<Event>) {
  return EventModel.create(input);
}

export function findEventByIdAndUpdate(_id: string, payload: Object) {
  return EventModel.findByIdAndUpdate({ _id }, payload);
}

export function findEventByIdAndDelete(_id: string) {
  return EventModel.findByIdAndDelete(_id);
}

export function findEventsPublic() {
  return EventModel.find({
    type: "publico",
  }).populate("category");
}

export function findEventsPrivate() {
  return EventModel.find({
    type: "privado",
  }).populate("owner");
}
