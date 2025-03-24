import { Resend } from "resend";
import EmailTemplate from "@/components/Tools/EmailTemplate";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);
const DOMAIN = process.env.DOMAIN || "notifications@kushchaudhary.systems";

export async function sendEmailNotification(
  email: string,
  data: {
    username: string;
    type: "SUCCESS" | "FAILED";
    platform: string;
    postTitle: string;
    error?: string;
  }
) {
  const html = await render(
    EmailTemplate({
      username: data.username,
      type: data.type,
      platform: data.platform,
      postTitle: data.postTitle,
      error: data.error,
    })
  ).then((html) => html);

  try {
    const res = await resend.emails.send({
      from: `CrossPostHub <${DOMAIN}>`,
      to: email,
      subject: {
        SUCCESS: "🎉Your post was published | CrossPostHub",
        FAILED: "Post Failed to Publish | CrossPostHub",
      }[data.type],
      html,
    });

    if (res.error) {
      console.error("Failed to send email notification", res.error);
    }

    return res;
  } catch (error) {
    console.error("Failed to send email", error);
  }
}

export const sendSSEMessage = async (email: string, data: any) => {
  console.log("Sending SSE message to", email, data);
  
};
