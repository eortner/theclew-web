export const privacyPolicy = {
  title: 'Privacy Policy',
  subtitle: 'How Emoclew handles your data',
  version: '1.0-beta',
  lastUpdated: 'April 2026',
  notice: 'This privacy policy describes how Emoclew collects, uses, and protects your personal information. It will be updated before the full platform launch.',
  sections: [
    {
      title: 'Information We Collect',
      content: `**Account Information:** When you register, we collect your name, email address, and password (stored as a bcrypt hash — we never store your plain-text password). If you register via Google or Facebook OAuth, we receive your name, email, and profile picture from those providers.

**Project Information:** We collect the information you provide about your projects including name, description, tagline, website, monthly revenue, team size, and tags you select.

**Two-Factor Authentication:** If you enable TOTP, we store an encrypted version of your TOTP secret. We also record the timestamp of your most recent TOTP verification for security purposes.

**Platform Activity:** We collect information about your use of the platform including threads, messages, merge proposals, votes, notifications, and investment records.

**Technical Data:** We collect standard technical data including IP addresses, browser type, and access timestamps for security and operational purposes.`
    },
    {
      title: 'How We Use Your Information',
      content: `We use your information to:

(a) Provide and operate the Emoclew platform.
(b) Authenticate your identity and secure your account.
(c) Generate tag embeddings for similarity matching and project discovery.
(d) Send notifications about platform activity relevant to your account.
(e) Process merge proposals, investment records, and equity calculations.
(f) Communicate with you about the platform, including updates and important notices.
(g) Improve and develop the platform based on usage patterns.
(h) Comply with applicable legal obligations.

**We do not:**
- Sell your personal data to third parties.
- Use your data to display advertising.
- Allow advertisers to pay to influence platform content or recommendations.
- Use your data to route investors to specific projects algorithmically.`
    },
    {
      title: 'Tag Embeddings and Similarity Matching',
      content: `The tag system is a core feature of the Emoclew platform. When you select tags for your project, the platform uses pre-computed 768-dimension vector embeddings (stored via PostgreSQL pgvector) to:

- Surface similar projects for potential co-founder matching
- Generate merge suggestions
- Power the Slackbot discovery recommendations
- Enable project discovery for the community

This processing is fundamental to the platform's operation and cannot be disabled. Your project tags and their embeddings are used for these matching purposes only. They are never used to algorithmically route investors to your project — investor discovery is passive browsing only.`
    },
    {
      title: 'Data Sharing',
      content: `**With Other Users:** Project information you mark as PUBLIC or SELECTIVE is visible to other platform users as described in the visibility settings. Private project details are not visible to other users, though tag-based similarity matching remains active.

**With Service Providers:** We use the following third-party services to operate the platform:
- **Stripe:** Payment processing for subscriptions and level fees
- **PostgreSQL / Neon:** Database hosting
- **Deployment Infrastructure:** [TO BE CONFIRMED]

We do not share your personal data with any third party beyond what is necessary to operate the platform.

**Legal Requirements:** We may disclose your information if required by law, court order, or to protect the rights and safety of our users or the public.

**Business Transfers:** If Emoclew is acquired or merges with another company, your information may be transferred as part of that transaction. We will notify you before your information becomes subject to a different privacy policy.`
    },
    {
      title: 'Data Security',
      content: `We implement the following security measures to protect your data:

**Authentication Security:**
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens stored in httpOnly cookies — not localStorage
- Cookie name uses __Host- prefix in production (enforces Secure + no Domain + path=/ at browser level)
- 7-day session expiry with token blacklist on logout
- Algorithm pinned to HS256 to prevent algorithm confusion attacks

**Two-Factor Authentication:**
- TOTP secrets encrypted with AES-256-GCM before storage
- TOTP verification required for all contract signing actions
- 5-minute re-verification window for sensitive actions

**Transport Security:**
- All data transmitted over HTTPS
- CORS configured to allow only authorised origins

No security system is perfect. In the event of a data breach, we will notify affected users as required by applicable law.`
    },
    {
      title: 'Data Retention',
      content: `**Beta Period:** Beta data — including accounts, projects, threads, and equity records — may be reset at any point before the full platform launch. We will notify beta users before any reset occurs.

**Account Data:** We retain your account data for as long as your account is active. If you delete your account, we will delete your personal information within [RETENTION PERIOD — TO BE CONFIRMED] days, subject to legal retention requirements.

**Equity Records:** Equity records pertaining to other users' projects are retained even after account deletion, as they affect third-party rights.

**Legal Holds:** We may retain data longer than our standard retention periods if required by law or in connection with legal proceedings.`
    },
    {
      title: 'Your Rights',
      content: `Depending on your location, you may have the following rights regarding your personal data:

**Access:** You may request a copy of the personal data we hold about you.

**Correction:** You may request correction of inaccurate personal data.

**Deletion:** You may request deletion of your personal data, subject to legal retention requirements and the equity records exception noted above.

**Portability:** You may request your data in a machine-readable format.

**Objection:** You may object to certain processing of your data.

To exercise these rights, contact us at privacy@emoclew.xyz. We will respond within 30 days.

**GDPR:** If you are located in the European Economic Area, you have additional rights under the General Data Protection Regulation. [FULL GDPR COMPLIANCE STATEMENT — TO BE COMPLETED WITH LEGAL COUNSEL]

**CCPA:** If you are a California resident, you have additional rights under the California Consumer Privacy Act. [FULL CCPA COMPLIANCE STATEMENT — TO BE COMPLETED WITH LEGAL COUNSEL]`
    },
    {
      title: 'Cookies',
      content: `Emoclew uses a single authentication cookie to maintain your session:

- **Name:** __Host-emoclew_token (production) / emoclew_token (development)
- **Purpose:** Authentication — maintains your login session
- **Type:** httpOnly, Secure, SameSite=Strict
- **Expiry:** 7 days
- **Third-party cookies:** None

We do not use tracking cookies, analytics cookies, or advertising cookies. We do not use any third-party analytics services that set cookies.`
    },
    {
      title: 'Contact',
      content: `For any privacy-related questions or requests, contact us at:

Email: privacy@emoclew.xyz

**Data Controller:** [EMOCLEW LEGAL ENTITY NAME — TO BE CONFIRMED AT INCORPORATION]
Address: [ADDRESS — TO BE CONFIRMED]

This privacy policy was last updated in April 2026. We will notify you of material changes by email or through a platform announcement.`
    }
  ]
};
