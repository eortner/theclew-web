export const termsOfService = {
  title: 'Terms of Service',
  subtitle: 'Emoclew Platform Agreement',
  version: '1.0-beta',
  lastUpdated: 'April 2026',
  notice: 'These terms govern your use of the Emoclew platform during the beta period. They will be updated before the full platform launch. By creating an account you agree to these terms.',
  sections: [
    {
      title: 'Acceptance of Terms',
      content: `By creating an account on the Emoclew platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the platform.

These Terms apply to all users of the platform including founders, investors, and administrators. We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated Terms.

**Beta Notice:** Emoclew is currently operating as a technology preview. The platform is functional but incomplete. Features may change, break, or be removed without notice. Nothing you do on this platform during the beta period creates a binding legal agreement, financial obligation, or enforceable contract of any kind.`
    },
    {
      title: 'Account Registration',
      content: `To use the Emoclew platform you must:

(a) Create an account with a valid email address and a password meeting the minimum security requirements.

(b) Provide accurate, current and complete information about yourself.

(c) Maintain the security of your account credentials. You are responsible for all activity under your account.

(d) Enable two-factor authentication (TOTP) before accessing certain platform features including making projects publicly discoverable, initiating merge proposals, and signing agreements.

(e) Not create accounts for others, impersonate any person, or use false information.

You may authenticate via email and password, Google OAuth, or Facebook OAuth. Session-less JWT authentication is used — your session token is stored in a secure httpOnly cookie.`
    },
    {
      title: 'Platform Subscription and Fees',
      content: `**Level 0 — Ember:** 30-day free exploration period. After 30 days, continued participation requires $11.99/year. No credit card required to begin.

**Level 1 — Spark:** Starts at $11.99/year. Unlocks developer tools, AI credits, investor access, and project management tools.

**Level 2 — Flame:** We pay $250/month. Unlocks domain and site support, company-building tools, and partner infrastructure.

**Level 3 — Blaze:** We pay $1,500/month. Unlocks Delaware C-Corp incorporation, US banking, and a debit card delivered to your address.

**Level 4 — Nova:** TBD. Unlocks funding support, exit advisory, M&A guidance, and advanced financial infrastructure.

All fees are collected via Stripe. Emoclew does not hold, route, or custody money beyond subscription payments. Income values are starting values and scale as the platform fund grows.

**Beta Period:** No real money is collected during the beta. Fee structures shown are illustrative of the intended product design.`
    },
    {
      title: 'Platform Equity',
      content: `By registering on the Emoclew platform and creating a project, you agree to Emoclew's equity stake in any company incorporated through the platform:

**Base equity stake:** 10% in every incorporated company.

**Loyalty reduction:** The platform equity reduces permanently as your company reaches higher levels:
- Level 0–1: 10%
- Level 2: 9%
- Level 3: 8%
- Level 4 (Nova): 7%

**Protected floor:** 7% is the guaranteed minimum. This floor cannot be reduced below 7% under any circumstance.

**Protection structure:** The platform equity is protected by a percentage-based anti-dilution mechanism. You may not issue equity to any third party in a way that dilutes the platform's protected stake below the floor.

This equity agreement is consented to at Level 0 signup and is a condition of accessing the incorporation and company-building features of the platform.`
    },
    {
      title: 'Project Ownership and Mergers',
      content: `**Project Ownership:** All project ownership is tracked on the platform via the ProjectOwnership system. Each owner's equity percentage and role (FOUNDER, MERGED_FOUNDER) is recorded. Only the original FOUNDER may edit project information, archive a project, or initiate platform actions on behalf of the project.

**Merge System:** Two eligible projects may merge through the platform's structured merge flow. All mergers require:
(i) Equity proposal submitted by the initiating founder;
(ii) Acceptance and digital signature (TOTP) by both founding parties;
(iii) Community ratification vote (or automatic ratification where quorum is not met).

**Merger is irreversible.** Once a merger is finalised on the platform, the initiating company is archived and ownership records are updated permanently.

**Cooling Period:** After a declined merger vote, a 14-day cooling period applies before the same two projects may attempt to merge again.

**Minimum Founder Equity:** No co-founder may receive less than 5% equity unless explicitly joining as advisor-only, agreed in writing by both parties.`
    },
    {
      title: 'User Conduct',
      content: `You agree not to use the platform to:

(a) Violate any applicable law or regulation.
(b) Misrepresent your identity, company, or financial information.
(c) Manipulate the level progression system or gaming mechanics.
(d) Harass, intimidate, or harm other users.
(e) Upload or transmit malicious code, viruses, or harmful content.
(f) Scrape, crawl, or extract data from the platform without authorisation.
(g) Use the platform for any purpose other than building and growing your startup.

The tag and similarity system is never to be used to route investors to specific projects algorithmically. Investor discovery is passive browsing only. Using the tag system to match investors to founders constitutes broker-dealer activity and is explicitly prohibited.`
    },
    {
      title: 'Data and Privacy',
      content: `Your use of the platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference.

**Data Ownership:** You retain ownership of your project data, descriptions, and content. By using the platform you grant Emoclew a licence to use this data to operate and improve the platform.

**Tag Embeddings:** Your project tags are used to generate vector embeddings for similarity matching. This is a core platform feature and cannot be disabled. Tag embeddings are never used to route investors to specific projects.

**Beta Data:** Beta data — including accounts, projects, threads, and equity records — may be reset at any point before the full platform launch. We will notify beta users before any reset.

**No Advertising:** Emoclew does not display advertisements and does not allow advertisers to pay to have their products promoted in conversations or on the platform.`
    },
    {
      title: 'Disclaimers and Limitation of Liability',
      content: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.

EMOCLEW DOES NOT WARRANT THAT:
(a) The platform will be uninterrupted or error-free;
(b) Any defects will be corrected;
(c) The platform is free of viruses or other harmful components;
(d) The results of using the platform will meet your requirements.

TO THE FULLEST EXTENT PERMITTED BY LAW, EMOCLEW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.

**Legal Documents:** Agreement templates provided by the platform (SAFE, Merger Agreement) are prototype documents only and have not been reviewed by legal counsel. You are solely responsible for obtaining qualified legal advice before executing any binding agreement.`
    },
    {
      title: 'Termination',
      content: `**By You:** You may terminate your account at any time by deleting your account through the platform settings.

**By Emoclew:** We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our sole discretion.

**Effect of Termination:** Upon termination, your access to the platform will cease. Your project data may be retained for the period required by applicable law. Equity records pertaining to other users' projects will be retained.

**Platform Equity on Termination:** Emoclew's equity stake in any incorporated company is not affected by termination of your platform account. The equity agreement survives termination.`
    },
    {
      title: 'Governing Law',
      content: `These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws provisions.

Any dispute arising from these Terms or your use of the platform shall be resolved by binding arbitration in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive relief in any court of competent jurisdiction.

**Contact:** For any questions about these Terms, contact us at legal@emoclew.xyz.`
    }
  ]
};
