import express from "express";
import { pool } from "./db.js";
import router from "./routes/wordly.js";
import { emailQueue } from "./queue/emailQueue.js";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import 'dotenv/config'




const PORT = 3005;

const app = express();
app.use(express.json());

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");
const queus = [emailQueue]?.map((qs) => new BullAdapter(qs))
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: queus,
  serverAdapter: serverAdapter,
});

app.use("/api", router);
app.use("/admin/queues", serverAdapter.getRouter());

app.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({ serverTime: rows[0].now });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/fill", async (req, res) => {
  const body = {
    words: ["table", "order", "flame"],
  };
  const values = body?.words.map((word) => [word]);
  await pool.query(`
        CREATE TABLE IF NOT EXISTS words (
          id INT AUTO_INCREMENT PRIMARY KEY,
          word VARCHAR(10) NOT NULL
        );
      `);
  const [result] = await pool.query("INSERT INTO words (word) VALUES ?", [
    values,
  ]);
  res.json({ message: "User inserted" });
});

app.listen(PORT, () => {
  console.log(`server started on ${PORT}`);
});
