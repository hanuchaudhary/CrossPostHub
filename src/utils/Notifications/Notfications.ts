import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailTemplate = "POST_SUCCESS" | "POST_FAILED";

const DOMAIN = process.env.DOMAIN || "notifications@kushchaudhary.systems";

export async function sendEmailNotification(
  email: string,
  template: EmailTemplate,
  data: {
    postId?: string;
    platforms?: string[];
    error?: string;
  }
) {
  const templates = {
    POST_SUCCESS: {
      subject: "✅ Your post was published!",
      html: `<p>Successfully published to ${data.platforms?.join(", ")}</p>`,
    },
    POST_FAILED: {
      subject: "❌ Post failed to publish",
      html: `<p>Error: ${data.error || "Unknown error"}</p>`,
    },
  };

  try {
    const res = await resend.emails.send({
      from: `CrossPostHub <${DOMAIN}>`,
      to: email,
      ...templates[template],
    });

    if (res.error) {
      console.error("Failed to send email notification", res.error);
    }

    return res;
  } catch (error) {
    console.error("Failed to send email", error);
  }
}
