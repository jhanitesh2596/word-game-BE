import { pool } from "../db.js";
import cron from "node-cron";
import logger from "../logger.js";
import { connection } from "../redisClient.js";
let TODAYS_WORD = "";
let index = 0;

function getSecondsUntilNext855AM() {
  const now = new Date();

  const next855 = new Date();
  next855.setHours(8, 55, 0, 0);

  if (now >= next855) {
    next855.setDate(next855.getDate() + 1);
  }

  return Math.floor((next855 - now) / 1000);
}


const shuffleWord = async () => {
  const isInCache = await connection.hgetall("todayWord:1")
  if(isInCache?.word){
    TODAYS_WORD = isInCache
    return 
  }
  const [rows] = await pool.query(`SELECT * FROM wordlyWord.words`)
  if (rows?.length) {
    TODAYS_WORD = rows[index];
    const ttl = getSecondsUntilNext855AM()
    await connection.hset("todayWord:1", TODAYS_WORD)
    await connection.expire("todayWord:1", ttl)
  }
};

const updateWord = async () => {
  const [rows] = await pool.query(`SELECT * FROM wordlyWord.words`);
  if (index >= rows?.length - 1) {
    index = 0;
  } else {
    index++;
  }
};

export const getTodayWord = async (_, res) => {
  try {
    logger.log({
      level: 'info',
      message: 'Request for new word'
    })
    await shuffleWord();
    res.json({ word: TODAYS_WORD });
  } catch (error) {}
};

cron.schedule("0 9 * * *", () => {
  updateWord();
});
