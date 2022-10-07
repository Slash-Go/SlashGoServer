"use strict";
import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import fs from "fs";
import path from "path";

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../../config/config.json")[env]["email"];

let transporter: Transporter;

interface EmailOptions {
  to: string | Array<string>;
  template: string;
  dynVars?: Object;
  from?: {
    name: string;
    address: string;
    replyTo?: string;
  };
}

export const sendMail = (options: EmailOptions) => {
  if (!config.enabled) {
    console.log("Skipping Email Sending because email is not enabled!");
  }

  if (transporter == null) {
    initializeTransporter();
  }

  console.log(__dirname);
  console.log(
    path.join(__dirname, "..", "templates", `${options.template}.json`)
  );
  fs.readFile(
    path.join(__dirname, "..", "templates", `${options.template}.json`),
    (err: NodeJS.ErrnoException | null, data: Buffer) => {
      if (err) {
        console.error(`Unable to find template ${options.template}`);
        return;
      }
      let jsonData = JSON.parse(data.toString());
      transporter
        .sendMail({
          from: {
            name: options.from?.name
              ? options.from?.name
              : config.defaultFrom.name,
            address: options.from?.address
              ? options.from?.address
              : config.defaultFrom.address,
          },
          to: options.to,
          subject: ejs.render(jsonData.subject, options.dynVars),
          replyTo: options.from?.replyTo
            ? options.from?.replyTo
            : config.defaultFrom.replyTo,
          text: ejs.render(jsonData.plaintext, options.dynVars),
          html: ejs.render(jsonData.html, options.dynVars),
        })
        .then((info) => {
          console.log("Email sent: %s", info.messageId);
        })
        .catch((e) => {
          console.log("Could not send email: ", e);
        });
    }
  );
};

const initializeTransporter = () => {
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    ignoreTLS: config.ignoreTLS,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  transporter.verify((error, _) => {
    if (error) {
      console.log("Error setting uup Transport");
      console.log(error);
    } else {
      console.log("Email Server is ready to take our messages");
    }
  });
};