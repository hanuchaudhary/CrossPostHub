import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LandingFooter from "./LandingFooter";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-neutral-400 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        <h1 className="mb-8 text-4xl font-ClashDisplayMedium text-emerald-500 tracking-tight">
          Privacy Policy
        </h1>

        <div className="prose prose-invert prose-green max-w-none">
          <p className="text-neutral-400">Last updated: March 28, 2025</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            CrossPostHub ("we," "our," or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our platform, including
            any associated mobile applications, websites, and services
            (collectively, the "Service").
          </p>
          <p>
            By accessing or using the Service, you consent to the collection,
            use, and disclosure of your information as described in this Privacy
            Policy. If you do not agree with our policies and practices, please
            do not use our Service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">
            2. Information We Collect
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3">
            2.1 Information You Provide to Us
          </h3>
          <p>
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Account information: When you register for an account, we collect
              your name, email address, password, and other contact information.
            </li>
            <li>
              Profile information: Information you add to your profile, such as
              a profile picture, job title, and company name.
            </li>
            <li>
              Payment information: If you subscribe to a paid plan, we collect
              payment details, billing address, and other information necessary
              to process your payment.
            </li>
            <li>
              Communications: Information you provide when you contact us for
              support or communicate with us.
            </li>
            <li>
              Content: Information and content you post, upload, or otherwise
              share through the Service, including social media posts, images,
              and videos.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">
            2.2 Information We Collect Automatically
          </h3>
          <p>
            When you use our Service, we automatically collect certain
            information, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Device information: Information about the device you use to access
              the Service, including hardware model, operating system, unique
              device identifiers, and mobile network information.
            </li>
            <li>
              Log information: Information about your use of the Service, such
              as the pages you visit, the time and date of your visit, the time
              spent on those pages, and other statistics.
            </li>
            <li>
              Location information: Information about your approximate location
              as determined from your IP address.
            </li>
            <li>
              Cookies and similar technologies: We use cookies and similar
              tracking technologies to track activity on our Service and hold
              certain information. See our Cookie Policy for more information.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">
            2.3 Information from Third Parties
          </h3>
          <p>
            We may receive information about you from third parties, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Social media platforms: When you connect your social media
              accounts to our Service, we receive information from those
              platforms in accordance with their privacy policies and your
              privacy settings on those platforms.
            </li>
            <li>
              Analytics providers: We use analytics providers to help us
              understand how users interact with our Service.
            </li>
            <li>
              Marketing partners: We may receive information from marketing
              partners to enhance our marketing efforts.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">
            3. How We Use Your Information
          </h2>
          <p>
            We use the information we collect for various purposes, including
            to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve the Service</li>
            <li>
              Process transactions and send related information, including
              confirmations and invoices
            </li>
            <li>
              Send administrative messages, such as updates, security alerts,
              and support messages
            </li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Provide customer support</li>
            <li>
              Understand how users interact with our Service to improve it
            </li>
            <li>
              Personalize your experience and deliver content relevant to your
              interests
            </li>
            <li>
              Monitor and analyze trends, usage, and activities in connection
              with our Service
            </li>
            <li>
              Detect, prevent, and address technical issues, fraud, and other
              illegal activities
            </li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">
            4. How We Share Your Information
          </h2>
          <p>We may share your information in the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              With service providers who perform services on our behalf, such as
              hosting, payment processing, and customer support
            </li>
            <li>
              With social media platforms when you choose to share content
              through those platforms
            </li>
            <li>
              With other users of the Service in accordance with your settings
              and the functionality of the Service
            </li>
            <li>
              In response to a legal request if we believe disclosure is
              required by law
            </li>
            <li>
              To protect the rights, property, and safety of CrossPostHub, our
              users, and the public
            </li>
            <li>
              In connection with, or during negotiations of, any merger, sale of
              company assets, financing, or acquisition of all or a portion of
              our business
            </li>
            <li>With your consent or at your direction</li>
          </ul>
          <p>
            We may also share aggregated or de-identified information, which
            cannot reasonably be used to identify you.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">
            5. Data Retention
          </h2>
          <p>
            We retain your information for as long as necessary to provide the
            Service and fulfill the purposes outlined in this Privacy Policy,
            unless a longer retention period is required or permitted by law.
            When we no longer need to use your information, we will take
            reasonable steps to remove it from our systems and records or take
            steps to anonymize it.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your information from unauthorized access, loss, or
            alteration. However, no method of transmission over the Internet or
            electronic storage is 100% secure. Therefore, while we strive to use
            commercially acceptable means to protect your information, we cannot
            guarantee its absolute security.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">
            7. Your Rights and Choices
          </h2>
          <p>
            Depending on your location, you may have certain rights regarding
            your personal information, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Access: You can request access to the personal information we hold
              about you.
            </li>
            <li>
              Correction: You can request that we correct inaccurate or
              incomplete information.
            </li>
            <li>
              Deletion: You can request that we delete your personal information
              in certain circumstances.
            </li>
            <li>
              Restriction: You can request that we restrict the processing of
              your information in certain circumstances.
            </li>
            <li>
              Data portability: You can request a copy of your personal
              information in a structured, commonly used, and machine-readable
              format.
            </li>
            <li>
              Objection: You can object to our processing of your personal
              information in certain circumstances.
            </li>
          </ul>
          <p>
            To exercise these rights, please contact us using the information
            provided in the "Contact Us" section below.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">
            8. Children's Privacy
          </h2>
          <p>
            Our Service is not directed to children under the age of 13, and we
            do not knowingly collect personal information from children under
            13. If we learn that we have collected personal information from a
            child under 13, we will take steps to delete that information as
            quickly as possible. If you believe that we might have any
            information from or about a child under 13, please contact us.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">
            9. International Data Transfers
          </h2>
          <p>
            We may transfer your information to countries other than the one in
            which you live. We deploy appropriate safeguards, such as standard
            contractual clauses, to protect your information when it is
            transferred internationally.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">
            10. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date. You are advised to review this
            Privacy Policy periodically for any changes. Changes to this Privacy
            Policy are effective when they are posted on this page.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <p>
            Email: kush@kushchaudhary.com
          </p>
        </div>
      </div>

      <LandingFooter/>
    </div>
  );
}
