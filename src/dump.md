```tsx
//V1 Twitter Post Publish

import {
  CreatePostWithMedia,
  CreateTextPost,
  registerAndUploadMedia,
} from "@/utils/LinkedInUtils/LinkedinUtils";

let mediaIds: string[] = [];
if (mediaBuffers.length > 0) {
  console.log(`Uploading ${imageBuffers.length} media files to Twitter...`);
  mediaIds = await Promise.all(
    imageBuffers.map(async (imageBuffer: Buffer) => {
      const mediaId = await uploadMediaToTwitter({
        media: imageBuffer,
        oauth_token: twitterAccount.access_token!,
        oauth_token_secret: twitterAccount.access_token_secret!,
      });
      console.log(`Media uploaded: ${mediaId}`);
      return mediaId;
    })
  );
}

if (!mediaIds) {
  throw new Error("Failed to upload media to Twitter.");
}

const twitterUtils = new TwitterUtilsV2(
  twitterAccount.access_token!,
  twitterAccount.access_token_secret!
);

for (let i = 0; i < mediaIds.length; i++) {
  const mediaId = mediaIds[i];
  await twitterUtils.pollMediaStatus(mediaId);
}

console.log("Media IDs:", mediaIds);

const tweetResponse = await createTweet({
  text: postText,
  mediaIds,
  oauth_token: twitterAccount.access_token!,
  oauth_token_secret: twitterAccount.access_token_secret!,
});
```

```tsx
 //Without Queue Logic

 const results = await Promise.all(
     providers.map(async (provider) => {
         if (provider === "linkedin") {

             const linkedinAccount = loggedUser.accounts.find((acc) => acc.provider === "linkedin");
             if (!linkedinAccount) {
                 return NextResponse.json({ error: "LinkedIn account not found" }, { status: 400 });
             }

             if (medias.length !== 0) {
                 const assetURNs: string[] = [];

                 for (const image of medias) {
                     const assetURN = await registerAndUploadMedia({
                         accessToken: linkedinAccount.access_token!,
                         personURN: linkedinAccount.providerAccountId!,
                         image
                     });
                     assetURNs.push(assetURN);
                 }

                 const postResponse = await CreatePostWithMedia({
                     accessToken: linkedinAccount.access_token!,
                     personURN: linkedinAccount.providerAccountId!,
                     assetURNs,
                     text: postText
                 });

                 if (postResponse.error) {
                     return { provider: "linkedin", error: postResponse.error };
                 }

                 const postSave = await postSaveToDB({ postText, userId: loggedUser.id, provider: "linkedin" });
                 console.log("Post saved to DB:", postSave.id);

                 return { provider: "linkedin", response: postResponse };
             } else {
                 const postResponse = await CreateTextPost({
                     accessToken: linkedinAccount.access_token!,
                     personURN: linkedinAccount.providerAccountId!,
                     text: postText
                 });

                 const postSave = await postSaveToDB({ postText, userId: loggedUser.id, provider: "linkedin" });
                 console.log("Post saved to DB:", postSave.id);

                 return { provider: "linkedin", response: postResponse };
             }
         }
         if (provider === "twitter") {
             const twitterAccount = loggedUser.accounts.find((acc) => acc.provider === "twitter");
             if (!twitterAccount) {
                 return NextResponse.json({ error: "Twitter account not found" }, { status: 400 });
             }

             try {
                 let mediaIds: string[] = [];
                 if (medias.length > 0) {
                     mediaIds = await Promise.all(
                         medias.map(image =>
                             uploadMediaToTwiiter({ media: image, oauth_token: twitterAccount.access_token!, oauth_token_secret: twitterAccount.access_token_secret! })
                         )
                     );
                 }

                 console.log({
                     text: postText,
                     mediaIds,
                     oauth_token: twitterAccount.access_token!,
                     oauth_token_secret: twitterAccount.access_token_secret!
                 });

                  Create the Twitter post
                 const postResponse = await createTweet({ text: postText, mediaIds, oauth_token: twitterAccount.access_token!, oauth_token_secret: twitterAccount.access_token_secret! });
                 console.log("PostResponse:", postResponse);

                 if (postResponse.error) {
                     return { provider: "twitter", error: postResponse.error };
                 }

                 const postSave = await postSaveToDB({ postText, userId: loggedUser.id, provider: "twitter" });
                 console.log("Post saved to DB:", postSave);

                 return { provider: "twitter", response: postResponse };
             } catch (error: any) {
                 console.error("Twitter posting error:", error);
                 return { provider: "twitter", error: error.message || "An error occurred" };

             }
         }
         if (provider === "instagram") {
              Create the Instagram post
             return { provider, response: null };
         }
         if (provider === "threads") {
              Create the Threads post
             return { provider, response: null };
         }
         return { provider, response: null };
     })
 );
 return NextResponse.json({ success: true, results });
```
