import { InfoLayout } from "@/components/info-layout";
export default function TermsPage() {
  return (
    <InfoLayout title="A few shared understandings.">
      <p>
        This terms page is a draft for this frontend preview and must be
        reviewed by the service operator before launch.
      </p>
      <h2 className="font-medium text-foreground">Using your space</h2>
      <p>
        Only connect accounts you are authorized to manage, and only publish
        content you have permission to share. Platform rules and publishing
        limits apply.
      </p>
      <h2 className="font-medium text-foreground">
        Subscriptions and availability
      </h2>
      <p>
        The displayed landing page pricing is illustrative. Service availability
        and third-party integrations depend on the deployment configuration.
      </p>
    </InfoLayout>
  );
}
