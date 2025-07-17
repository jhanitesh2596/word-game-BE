import cron from "node-cron";
import { emailQueue } from "../queue/emailQueue.js";
import { pool } from "../db.js";
import logger from "../logger.js";

const sendMail = async () => {
  const users = [
    {
      id: 1,
      email: "kn882127@gmail.com",
    },
    {
      id: 2,
      email: "reachtoniteshjha@gmail.com",
    },
  ];
  if (users?.length) {
    for (let user of users) {
      console.log(user)
      await emailQueue.add(
        "sendWordEmail",
        {
          userId: user.id,
          email: user.email,
        },
        {
          jobId: `daily-email-${user.id}`,
        }
      );
    }
  }
  logger.log({
    level: "info",
    message: `✅ Emails sent to ${users.length} users at 9 AM`
  })
};

sendMail();

