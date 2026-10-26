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
  platform: string;
  postTitle?: string;
  error?: string;
}

export default function EmailTemplate({
  username = "User",
  type = "SUCCESS",
  platform = "Twitter",
  postTitle = "My Awesome Post",
  error = "Unknown error",
}: emailTemplateProps) {
  const iconSrcMap: Record<string, string> = {
    twitter: `${process.env.NEXT_PUBLIC_BASE_URL}/twitter-light.svg`,
    instagram: `${process.env.NEXT_PUBLIC_BASE_URL}/instagramIcon.svg`,
    linkedin: `${process.env.NEXT_PUBLIC_BASE_URL}/linkedin.svg`,
  };

  const iconSrc = iconSrcMap[platform.toLowerCase()] || "";

  const platformHeading = (
    <div
      className="text-2xl md:text-5xl lg:text-5xl"
      style={{ fontFamily: "font-ClashDisplayRegular" }}
    >
      <p>
        We{" "}
        <span
          className={type === "SUCCESS" ? "text-green-400" : "text-pink-500"}
        >
          {type === "SUCCESS" ? "successfully" : "weren't able"}
        </span>{" "}
        publish your post to:
      </p>
      <div className="flex justify-center items-center my-5 space-x-2">
        <img className="h-8 md:h-10" src={iconSrc} alt={`${platform} logo`} />
        <span className="font-medium">{platform}</span>
      </div>
    </div>
  );

  const { heading, buttonText, buttonColor } = {
    SUCCESS: {
      heading: platformHeading,
      content: `Your post "${postTitle}" is now live on ${platform}. Share it with your audience!`,
      buttonText: "Publish More",
      buttonColor: "bg-emerald-500",
    },
    FAILED: {
      heading: platformHeading,
      content: `We encountered an issue publishing your post to ${platform}: ${error}. Please try again.`,
      buttonText: "Retry Now",
      buttonColor: "bg-red-500",
    },
  }[type];

  return (
    <Tailwind>
      <Html>
        <Head>
          <style>
            {`
              @font-face {
                font-family: "ClashDisplaySemibold";
                src: url("http://localhost:3000/fonts/ClashDisplay-Semibold.otf") format("opentype");
              }

              @font-face {
                font-family: "ClashDisplayRegular";
                src: url("http://localhost:3000/fonts/ClashDisplay-Regular.otf") format("opentype");
              }

              @font-face {
                font-family: "ClashDisplayMedium";
                src: url("http://localhost:3000/fonts/ClashDisplay-Medium.otf") format("opentype");
              }

              @font-face {
                font-family: "ClashDisplayBold";
                src: url("http://localhost:3000/fonts/ClashDisplay-Bold.otf") format("opentype");
              }

              .font-ClashDisplayMedium {
                font-family: 'ClashDisplayMedium', sans-serif;
              }
              .font-ClashDisplayRegular {
                font-family: 'ClashDisplayRegular', sans-serif;
              }
            `}
          </style>
        </Head>
        <Body className="bg-neutral-900 text-white font-sans">
          <Container className="mx-auto p-8 max-w-2xl rounded-lg shadow-lg border border-neutral-800">
            {/* App Name */}
            <Section className="text-center py-6 mt-11">
              <Heading
                className="text-4xl text-emerald-500 pt-4"
                style={{ fontFamily: "font-ClashDisplayMedium" }}
              >
                CrossPostHub
              </Heading>
              <Text className="text-2xl text-neutral-100">
                Share your content everywhere with a single click
              </Text>
            </Section>

            {/* Header Section */}
            <Section className="p-8 text-center sm:my-10 md:my-28 lg:my-28 xl:my-28 2xl:my-28">
              <Heading className="text-white md:px-10 lg:px-10 sm:px-2 xl:px-10 2xl:px-10">
                {heading}
              </Heading>
            </Section>

            {/* Content Section */}
            <Section
              className="border p-8 "
              style={{ borderTop: "1px solid #404040" }}
            >
              <div className="text-center my-6">
                <Button
                  href={"https://crossposthub.kushchaudhary.com/dashboard"}
                  className={`${buttonColor} text-black bg-white px-6 py-2 rounded-full font-bold text-lg shadow-lg hover:opacity-90 transition`}
                >
                  {buttonText}
                </Button>
              </div>

              {/* Footer Section */}
              <Text className="text-sm text-neutral-400 text-center">
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
