import { InfoLayout } from "@/components/info-layout";

import {
  ContactLink,
  EFFECTIVE_DATE,
  LegalList,
  LegalSection,
} from "./legal-section";

export default function PrivacyPage() {
  return (
    <InfoLayout title="Privacy policy">
      <p>Effective {EFFECTIVE_DATE}.</p>
      <p>
        CrossPostHub lets you write a post once and publish or schedule it to
        the social accounts you connect. This policy explains what we collect to
        do that, who we share it with, and the choices you have. We don't sell
        your data and we don't show ads.
      </p>

      <LegalSection title="What we collect">
        <LegalList
          items={[
            <>
              <strong className="text-foreground">Account details:</strong>{" "}
              your name, email address, profile picture and a securely hashed
              password. If you sign in with Google, we receive your name, email
              and profile picture from Google.
            </>,
            <>
              <strong className="text-foreground">Sign-in sessions:</strong> a
              session record with your IP address and browser details, kept to
              keep you signed in and to protect your account.
            </>,
            <>
              <strong className="text-foreground">Connected accounts:</strong>{" "}
              for each social account you connect (X, LinkedIn, Instagram,
              Threads, Facebook Pages, Bluesky, Mastodon, Pinterest, TikTok or
              Telegram), we store its account ID, display name, profile picture
              and the access tokens the platform gives us. Tokens are encrypted
              with AES-256-GCM before they are stored. For Bluesky we store an
              app-password session, never your main password. For Mastodon we
              store your server address, and for Pinterest the board we post
              to.
            </>,
            <>
              <strong className="text-foreground">Your posts:</strong> the text,
              photos and videos you create, the platforms you choose, schedule
              times and publishing results.
            </>,
            <>
              <strong className="text-foreground">Billing:</strong> your plan,
              subscription status and transaction records. Card details are
              handled by our payment provider, Dodo Payments, and never reach
              our servers.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="How we use it">
        <LegalList
          items={[
            "To publish and schedule your posts to the accounts you choose, and to tell you whether each one succeeded.",
            "To keep connections working, for example by refreshing access tokens before they expire.",
            "To run your account, enforce plan limits and process payments.",
            "To keep the service secure, prevent abuse and fix problems.",
          ]}
        />
        <p>
          We only act on a connected account when you ask us to: posting what
          you write, at the time you choose. We don't read your feeds, messages
          or followers.
        </p>
      </LegalSection>

      <LegalSection title="Who we share it with">
        <LegalList
          items={[
            "The social platforms you connect, which receive the content you publish to them and process it under their own privacy policies.",
            "Cloudflare, which hosts the app, its database and your uploaded media.",
            "Dodo Payments, which processes subscriptions and payments.",
            "Google, if you choose Google sign-in.",
            "Authorities, when the law requires it.",
          ]}
        />
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep your account data while your account exists. When you
          disconnect a social account we delete its stored tokens and, where the
          platform supports it, revoke our access. Uploaded media stays stored
          while it belongs to your posts. When you ask us to delete your
          account, we delete your account, connections, posts and media within
          30 days, except records we must keep for tax or legal reasons.
        </p>
      </LegalSection>

      <LegalSection title="Your choices and rights">
        <LegalList
          items={[
            "Disconnect any social account at any time from the Social accounts page.",
            "Update your name, picture and password in your account settings.",
            <>
              Ask for a copy of your data, a correction, or deletion of your
              account by emailing <ContactLink />. We reply within 30 days.
            </>,
            "You can also remove CrossPostHub's access from each platform's own settings. For Meta platforms, removing the app sends us a deletion request that we act on automatically.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Cookies and local storage">
        <p>
          We use one essential cookie to keep you signed in. Your browser also
          stores small preferences, such as theme and sound settings. We don't
          use advertising or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Data travels over HTTPS, access tokens are encrypted at rest, and
          passwords are hashed. No system is perfectly secure, so please use a
          strong password and tell us right away if you suspect a problem.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          CrossPostHub isn't meant for anyone under 13, or under 16 in the
          European Economic Area and the UK. We don't knowingly collect their
          data, and we delete it if we learn we have.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          If we change this policy, we'll update the date above and tell you
          about significant changes by email or in the app. Questions or
          requests: <ContactLink />.
        </p>
      </LegalSection>
    </InfoLayout>
  );
}
