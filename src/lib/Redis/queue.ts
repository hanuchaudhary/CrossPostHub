import { Queue } from 'bullmq';
import { redis } from './redis';
import dayjs from 'dayjs';

interface PostJobData {
    platforms: string[];
    postContent: string;
    mediaUrls: string[];
}

const postQueue = new Queue('postQueue', { connection: { host: '127.0.0.1', port: 6379 } });

// Add tasks
// postQueue.add('postTask', { postId, userId, platform }, { delay: scheduleTime });
