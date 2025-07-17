import nodemailer from "nodemailer";
import { Worker } from "bullmq";
import { connection } from "../redisClient.js";
import logger from "../logger.js";
const account = await nodemailer.createTestAccount();
console.log(account);
const transpoter = nodemailer.createTransport({
  host: account.smtp.host,
  port: account.smtp.port,
  secure: account.smtp.secure,
  auth: {
    user: account.user,
    pass: account.pass,
  },
});

const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { userId, email } = job.data;
    const info = await transpoter.sendMail({
      from: "Wordly App",
      to: email,
      subject: "Worddly word",
      text: `Hello! Today’s word is added`,
    });
    console.log('📬 Preview URL:', nodemailer.getTestMessageUrl(info));
  },
  { connection }
);

worker.on("completed", (job) => {
  logger.log({
    level: "info",
    message: `✅ Job ${job.id} completed`,
  });
});

worker.on("failed", (job, err) => {
  console.log("failed", err);
  logger.log({
    level: "error",
    message: `❌ Job ${job.id} failed ${JSON.stringify(err)}`,
  });
});

worker.on("error", (err) => {
  console.log("err", err);
  logger.log({
    level: "error",
    message: `💥 Worker error: ${JSON.stringify(err)}`,
  });
});
