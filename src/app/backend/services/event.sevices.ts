import { EventModel, Event } from "../models/event.model";

export class EventServices {
  public createEvent(input: Partial<Event>) {
    return EventModel.create(input);
  }

  public findEventById(_id: string) {
    return EventModel.findById(_id);
  }

  public findEventByIdAndUpdate(_id: string, payload: Object) {
    return EventModel.findByIdAndUpdate({ _id }, payload);
  }

  public findEventByIdAndDelete(_id: string) {
    return EventModel.findByIdAndDelete(_id);
  }

  public searchMyRegisteredEvents(_id: string) {
    return EventModel.find({
      subscribers: { _id },
    }).populate("category", "-_id name");
  }

  public searchOwnEvents(_id: string) {
    return EventModel.find({
      owner: _id,
    }).populate("category", "-_id name");
  }

  public searchRegisteredUsers(_id: string, ownerID: string) {
    return EventModel.findOne(
      {
        _id: _id,
        owner: ownerID,
      },
      "subscribers"
    ).populate("subscribers", "-_id email firstName lastName");
  }

  public findEventsPublic() {
    return EventModel.find({
      type: "publico",
    }).populate("category", "-_id name");
  }

  public findEventsPrivate(userInstitution: string) {
    return EventModel.find({
      type: "privado",
      institution: userInstitution,
    })
      .populate("institution", "-_id name")
      .populate("category", "-_id name");
  }
}
