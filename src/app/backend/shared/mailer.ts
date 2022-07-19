import sgMail from "@sendgrid/mail";
import config from "config";
import log from "./logger";

const sgKey = config.get<string>("sendGridKey");
sgMail.setApiKey(sgKey);

async function sendEmail(payload: sgMail.MailDataRequired) {
  try {
    sgMail.send(payload);
    console.log("enviado");
  } catch (e: any) {
    log.error(e);

    if (e.response) {
      log.error(e.response.body);
    }
  }
}

export default sendEmail;
