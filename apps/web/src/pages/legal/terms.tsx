import { Link } from "react-router";

import { InfoLayout } from "@/components/info-layout";

import {
  ContactLink,
  EFFECTIVE_DATE,
  LegalList,
  LegalSection,
} from "./legal-section";

export default function TermsPage() {
  return (
    <InfoLayout title="Terms of service">
      <p>Effective {EFFECTIVE_DATE}.</p>
      <p>
        These terms cover your use of CrossPostHub. By creating an account or
        using the service, you agree to them. Our{" "}
        <Link to="/privacy" className="text-foreground underline underline-offset-4">
          privacy policy
        </Link>{" "}
        explains how we handle your data.
      </p>

      <LegalSection title="Your account">
        <p>
          You must be at least 13, or 16 in the European Economic Area and the
          UK, and able to agree to these terms. Keep your password safe: you're
          responsible for activity on your account. Tell us at <ContactLink /> if
          you think someone else has access.
        </p>
      </LegalSection>

      <LegalSection title="Connected accounts">
        <p>
          Only connect social accounts, Pages and channels you own or are
          authorized to manage. When you publish through CrossPostHub you must
          also follow each platform's own terms and rules, including those of
          X, LinkedIn, Meta (Instagram, Threads and Facebook), Bluesky, your
          Mastodon server, Pinterest, TikTok and Telegram. Platforms can limit
          or refuse posts, change their APIs, or suspend access at any time,
          and we can't control that.
        </p>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          You keep ownership of everything you create. You give us permission
          to store, process and send your content only as needed to publish and
          schedule it where you ask. You're responsible for having the rights to
          what you post.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>Don't use CrossPostHub to:</p>
        <LegalList
          items={[
            "post spam, scams, malware or misleading content,",
            "harass, threaten or impersonate anyone,",
            "share content that is illegal or infringes someone else's rights,",
            "get around a platform's limits or rules, or automate fake engagement,",
            "probe, overload or try to break into the service.",
          ]}
        />
        <p>
          We may remove content or suspend accounts that break these rules.
        </p>
      </LegalSection>

      <LegalSection title="Plans and billing">
        <p>
          CrossPostHub has a Free plan and paid monthly plans (Pro at $10 and
          Premium at $20), each with its own monthly post and scheduling
          limits, shown on the{" "}
          <Link to="/pricing" className="text-foreground underline underline-offset-4">
            pricing page
          </Link>
          . Payments are processed by Dodo Payments. Paid plans renew each month
          until you cancel; cancelling stops the next renewal and you keep your
          plan until the end of the period you paid for. Prices may change, and
          we'll tell you before a change affects you.
        </p>
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          We work to keep CrossPostHub running and your posts on time, but we
          can't guarantee that every post publishes, or publishes exactly when
          scheduled. Some platforms add their own limits; for example, TikTok
          posts stay private until TikTok approves our app.
        </p>
      </LegalSection>

      <LegalSection title="Ending your use">
        <p>
          You can stop using CrossPostHub at any time and ask us to delete your
          account. We may suspend or close accounts that break these terms or
          put the service or other people at risk.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimers and liability">
        <p>
          The service is provided "as is", without warranties of any kind. As
          far as the law allows, we aren't liable for indirect or consequential
          losses, such as lost profits, lost data or missed posts, and our total
          liability is limited to what you paid us in the 12 months before the
          claim.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          We may update these terms. We'll change the date above and tell you
          about significant changes before they take effect. Questions:{" "}
          <ContactLink />.
        </p>
      </LegalSection>
    </InfoLayout>
  );
}
