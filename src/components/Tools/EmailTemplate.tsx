import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Tailwind,
} from "@react-email/components";

interface emailTemplateProps {
  username?: string;
  type: "SUCCESS" | "FAILED";
  platform: string
  postTitle?: string;
  error?: string;
}

export default function EmailTemplate({
  username = "User",
  type = "SUCCESS",
  platform = "Twitter",
  postTitle = "My Awesome Post",
  error = "Unknown error",
}: emailTemplateProps ) {
  const { heading, buttonText, buttonColor } = {
    SUCCESS: {
      heading: `🎉Post published successfully on ${platform}`,
      content: `Your post "${postTitle}" is now live on ${platform}. Share it with your audience!`,
      buttonText: "Post More",
      buttonColor: "bg-emerald-500",
    },
    FAILED: {
      heading: `Failed to publish post on ${platform}`,
      content: `We encountered an issue publishing your post to ${platform}: ${error}. Please try again.`,
      buttonText: "Try Again",
      buttonColor: "bg-red-500",
    },
  }[type];

  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className="bg-neutral-900 text-white font-sans">
          <Container className="mx-auto p-8 max-w-2xl rounded-lg shadow-lg border border-neutral-800">
            {/* App Name */}
            <Section className="text-center py-6 font-ClashDisplayMedium">
              <Heading className="text-4xl text-emerald-500 pt-4">
                CrossPostHub
              </Heading>
              <Text className="text-lg text-neutral-400">
                Share your content everywhere with a single click
              </Text>
            </Section>

            {/* Header Section */}
            <Section className="p-8 text-center">
              <Heading className="text-white md:text-lg text-sm bg-neutral-800 font-ClashDisplayRegular p-4 border-2 border-neutral-700 my-5 rounded-3xl inline-block">
                {heading}
              </Heading>
            </Section>

            {/* Content Section */}
            <Section className="border border-neutral-700 rounded-b-lg p-8 bg-neutral-800">
              <div className="text-center my-6">
                <Button
                  href={"https://crossposthub.kushchaudhary.com/dashboard"}
                  className={`${buttonColor} text-black bg-white font-ClashDisplayMedium px-6 py-2 rounded-full font-medium text-lg shadow-lg hover:opacity-90 transition`}
                >
                  {buttonText}
                </Button>
              </div>

              {/* Footer Section */}
              <Text className="text-sm text-neutral-400 border-t-2 pt-4 border-neutral-700 text-center">
                Need help? Reply to this email or visit our{" "}
                <a
                  href="https://crossposthub.kushchaudhary.com/support"
                  className="text-emerald-400 underline"
                >
                  support page
                </a>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
