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
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
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
        "Content-Type": image.type || "image/jpeg", // Set the correct Content-Type
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

//Step 3: Create Post
export async function CreatePostWithMedia({
  accessToken,
  personURN,
  assetURNs,
  text,
}: {
  accessToken: string;
  personURN: string;
  assetURNs: string[];
  text: string;
}) {
  const mediaArray = assetURNs.map((urn, index) => ({
    status: "READY",
    description: { text: `Image ${index + 1}` },
    media: urn,
    title: { text: `Image ${index + 1}` },
  }));

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
            shareMediaCategory: "IMAGE",
            media: mediaArray,
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

    console.log("Post Created!");
    return response.data;
  } catch (error) {
    console.error("CreatePost Error:", error);
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
) => {
  try {
    const response = await axios.get(
      `https://api.linkedin.com/v2/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("LinkedIn Profile Data:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("Get LinkedIn Profile Error:", error);
  }
};
