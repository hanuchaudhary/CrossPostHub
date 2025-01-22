import { CreatePostWithMedia, CreateTextPost, registerAndUploadMedia } from '@/utils/LinkedInUtils/LinkedinUtils';
import { createTweet, uploadMediaToTwiiter } from '@/utils/TwitterUtils/TwitterUtils';
import { Queue, Worker, Job } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };
export const postQueue = new Queue('postQueue', { connection });

// Worker to process jobs
const worker = new Worker(
    'postQueue',
    async (job: Job) => {
        try {
            const { provider, postText, images, loggedUser } = job.data;

            // Log the incoming job
            console.log(`Processing job: ${job.id}`, {
                provider,
                postText,
                images,
            });

            if (provider === 'linkedin') {
                const linkedinAccount = loggedUser.accounts.find((acc: any) => acc.provider === 'linkedin');
                if (!linkedinAccount) {
                    throw new Error('LinkedIn account not found for the logged user.');
                }
                console.log('LinkedIn account found:', linkedinAccount);


                if (!images || images.length === 0) {
                    console.log('No images provided, creating a text-only LinkedIn post.');
                    const result = await CreateTextPost({
                        accessToken: linkedinAccount.access_token!,
                        personURN: linkedinAccount.providerAccountId!,
                        text: postText,
                    });
                    console.log('LinkedIn Text Post created:', result);
                    return result;
                }

                console.log('Uploading images to LinkedIn...');
                const assetURNs = await Promise.all(
                    images.map((image: any) =>
                        registerAndUploadMedia({
                            accessToken: linkedinAccount.access_token!,
                            personURN: linkedinAccount.providerAccountId!,
                            image,
                        })
                    )
                );

                console.log('Asset URNs obtained:', assetURNs);

                const result = await CreatePostWithMedia({
                    accessToken: linkedinAccount.access_token!,
                    personURN: linkedinAccount.providerAccountId!,
                    assetURNs,
                    text: postText,
                });
                console.log('LinkedIn Post with Media created:', result);
                return result;
            }

            if (provider === 'twitter') {
                const twitterAccount = loggedUser.accounts.find((acc: any) => acc.provider === 'twitter');
                if (!twitterAccount) {
                    throw new Error('Twitter account not found for the logged user.');
                }

                console.log('Uploading images to Twitter...');
                const mediaIds = await Promise.all(
                    images.map((image: File) =>
                        uploadMediaToTwiiter({
                            media: image,
                            oauth_token: twitterAccount.access_token!,
                            oauth_token_secret: twitterAccount.access_token_secret!,
                        })
                    )
                );

                console.log('Media IDs obtained for Twitter:', mediaIds);

                console.log('Creating Tweet with Media...');
                const result = await createTweet({
                    text: postText,
                    mediaIds,
                    oauth_token: twitterAccount.access_token!,
                    oauth_token_secret: twitterAccount.access_token_secret!,
                });
                console.log('Tweet with Media created:', result);
                return result;
            }

            throw new Error(`Unknown provider: ${provider}`);
        } catch (error) {
            console.error(`Job ${job.id} failed with error:`, error);
            throw error;
        }
    },
    { connection }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed. Error:`, err.message);
    // Handle failure gracefully, e.g., retry logic, notifying the user

});

worker.on('error', (err) => {
    console.error('Worker error:', err);
});
