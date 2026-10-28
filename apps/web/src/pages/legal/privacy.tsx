import { InfoLayout } from "@/components/info-layout";
export default function PrivacyPage() {
  return (
    <InfoLayout title="Your privacy matters.">
      <p>
        This privacy notice is a draft for this frontend preview and must be
        reviewed by the service operator before launch.
      </p>
      <h2 className="font-medium text-foreground">Your account and content</h2>
      <p>
        CrossPostHub uses your account details, linked social accounts, and
        submitted posts to provide publishing and scheduling features. Your
        connected platforms also process content according to their own
        policies.
      </p>
      <h2 className="font-medium text-foreground">Questions and requests</h2>
      <p>
        Contact your service administrator for data access, deletion requests,
        retention details, and questions about connected accounts.
      </p>
    </InfoLayout>
  );
}
