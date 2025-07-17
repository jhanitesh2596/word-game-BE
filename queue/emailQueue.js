import Queue  from 'bull';
import { connection } from '../redisClient.js';


export const emailQueue = new Queue('emailQueue', { connection });