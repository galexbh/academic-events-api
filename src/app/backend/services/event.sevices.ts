import { EventModel, Event } from "../models/event.model";

export function createEvent(input: Partial<Event>) {
  return EventModel.create(input);
}

export function findOneEvent(_id: string) {
  return EventModel.findOne({ _id });
}

export function findEventByIdAndUpdate(_id: string, payload: Object) {
  return EventModel.findByIdAndUpdate({ _id }, payload);
}

export function findEventByIdAndDelete(_id: string) {
  return EventModel.findByIdAndDelete(_id);
}

export function searchMyRegisteredEvents(_id: string) {
  return EventModel.find({
    subscribers: { _id },
  }).populate("category", "-_id name");
}

export function searchOwnEvents(_id: string) {
  return EventModel.find({
    owner: _id,
  }).populate("category", "-_id name");
}

export function findEventsPublic() {
  return EventModel.find({
    type: "publico",
  }).populate("category", "-_id name");
}

export function findEventsPrivate(userInstitution: string) {
  return EventModel.find({
    type: "privado",
    institution: userInstitution,
  })
    .populate("institution", "-_id name")
    .populate("category", "-_id name");
}
