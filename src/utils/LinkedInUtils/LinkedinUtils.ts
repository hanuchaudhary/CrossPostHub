import axios from "axios";

interface registerAndUploadMediaProps {
  accessToken: string;
  personURN: string;
  image: any;
}

//Step 1: Register Media Upload
export async function registerAndUploadMedia({
  accessToken,
  personURN,
  image,
}: registerAndUploadMediaProps) {
  try {
    console.log("Registering Media Upload...");
    const registerResponse = await axios.post(
      "https://api.linkedin.com/v2/assets?action=registerUpload",
      {
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-video"],
          owner: `urn:li:person:${personURN}`,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const uploadUrl =
      registerResponse.data.value.uploadMechanism[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ].uploadUrl;
    const assetURN = registerResponse.data.value.asset;

    console.log("Media Upload Registered!");

    // Step 2: Upload Media
    console.log("Uploading Media...");
    await axios.put(uploadUrl, image, {
      headers: {
        "Content-Type": image.type || "video/mp4", // Set the correct Content-Type
      },
    });

    console.log("Media Uploaded!");
    return assetURN;
  } catch (error: any) {
    console.error("RegisterMediaUpload Error:", error.response?.data || error);
    throw error;
  }
}

/*
Expected Response:
{
    "value": {
        "mediaArtifact": "urn:li:digitalmediaMediaArtifact:(urn:li:digitalmediaAsset:D5622AQHAc3Ffx8fytQ,urn:li:digitalmediaMediaArtifactClass:uploaded-image)",
        "uploadMechanism": {
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": {
                "uploadUrl": "https://www.linkedin.com/dms-uploads/sp/v2/D5622AQHAc3Ffx8fytQ/uploaded-image/B56ZR_owJjHoAA-/0?ca=vector_feedshare&cn=uploads&iri=B01-86&sync=0&v=beta&ut=0y1hsdt1Q0QHA1",
                "headers": {
                    "media-type-family": "STILLIMAGE"
                }
            }
        },
        "asset": "urn:li:digitalmediaAsset:D5622AQHAc3Ffx8fytQ",
        "assetRealTimeTopic": "urn:li-realtime:digitalmediaAssetUpdatesTopic:urn:li:digitalmediaAsset:D5622AQHAc3Ffx8fytQ"
    }
}
*/

type createPostWithMediaProps = {
  accessToken: string;
  personURN: string;
  assetURNs: string[];
  text: string;
  mediaType: string;
};

//Step 3: Create Post with Media
export async function CreatePostWithMedia({
  accessToken,
  personURN,
  assetURNs,
  text,
  mediaType,
}: createPostWithMediaProps) {
  console.log("Creating Post...", {
    text,
    mediaType,
    personURN,
    assetURNs,
  });

  // Create Post Payload
  const payload = {
    author: `urn:li:person:${personURN}`, // Required: The author of the post
    commentary: text, // Required: The text content of the post
    visibility: "PUBLIC", // Required: Visibility of the post
    distribution: {
      feedDistribution: "MAIN_FEED", // Required: Distribution settings
      targetEntities: [], // Optional: Target specific entities
      thirdPartyDistributionChannels: [], // Optional: Third-party distribution channels
    },
    content: {
      media: {
        id: assetURNs[0], // Required: The asset URN (e.g., urn:li:video:D5610AQHabXWTQOa87w)
        title: "Video Title", // Optional: Title of the media
      },
    },
    lifecycleState: "PUBLISHED", // Required: Post lifecycle state
    isReshareDisabledByAuthor: false, // Optional: Disable resharing
  };

  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    console.log("Creating Post...");
    const response = await axios.post(
      "https://api.linkedin.com/rest/posts",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json",
          "LinkedIn-Version": "202501.01", // Ensure this matches the latest API version
        },
      }
    );

    console.log("Post Created! "+ response.data);
    return response.data;
  } catch (error: any) {
    console.error("CreatePost Error:", error);
    console.error("Error Response:", error.response?.data);
    throw error; // Re-throw the error to handle it in the calling function
  }
}
export async function CreateTextPost({
  accessToken,
  personURN,
  text,
}: {
  accessToken: string;
  personURN: string;
  text: string;
}) {
  try {
    console.log("Creating Post...");
    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        author: `urn:li:person:${personURN}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: text,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );
    console.log("Linkedin Post Created!");
    return response.data;
  } catch (error) {
    console.error("CreatePost Error:", error);
  }
}

export const getLinkedInProfile = async (
  accessToken: string,
  personID: string
) => {
  try {
    const response = await axios.get(
      `https://api.linkedin.com/v2/people/${personID}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Get LinkedIn Profile Error:", error);
  }
};
