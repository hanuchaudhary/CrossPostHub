import { InfoLayout } from "@/components/info-layout";

import { ContactLink } from "../legal/legal-section";

export default function ContactPage() {
  return (
    <InfoLayout title="Let’s get in touch.">
      <p>
        For help with your account, billing or publishing, email{" "}
        <ContactLink />. Include the platform involved and roughly when the
        problem happened, and we'll get back to you.
      </p>
      <p>
        To ask for a copy of your data or to delete your account, email the
        same address from the email you sign in with.
      </p>
    </InfoLayout>
  );
}
