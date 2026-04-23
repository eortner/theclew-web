export const howWeWork = {
  title: 'How Emoclew Works',
  subtitle: 'The complete guide to building on the platform',
  sections: [
    {
      title: 'What is Emoclew?',
      content: `Emoclew is a project collaboration and networking platform for builders. You create a project, develop it through structured progression, and unlock progressively greater support — from community tools to legal documentation on equity status for later incorporation through SAFE contracts (Simple Agreement for Future Equity: Y Combinator agreements that convert to equity upon priced funding rounds).

We help solo founders discover other solo founders working on similar projects, provide a legal safety net before incorporation, and take a percentage equity stake in exchange for platform access and future funding/tools support. If you can build it, we help you make it real.`
    },
    {
      title: 'The Five Levels',
      content: `Every project starts at Level 0 — Ember. Advancement is earned through demonstrated traction, not time.

**Level 0 — Ember ($11.99/year after 30 days free)**
Platform access, project creation, tag-driven discovery, Slack community, co-founder matching. This is your entry point. You choose your initial visibility mode and set your tags.

**Level 1 — Spark ($11.99/year)**
Developer tools, AI credits, project management tools, and investor access opens. This is the first meaningful advancement — it signals you have something real.

**Level 2 — Flame (we pay $250/month)**
Domain and site support, company-building tools, and partner infrastructure. Reachable quickly with strong traction.

**Level 3 — Blaze (we pay $1,500/month)**
Delaware C-Corp incorporation, US banking setup, and a debit card delivered to your door. This is where your idea becomes a legal company.

**Level 4 — Nova (TBD)**
Funding support, exit advisory, M&A guidance, and advanced financial infrastructure. The hardest threshold — reserved for founders who have built something significant.`
    },
    {
      title: 'Platform Equity',
      content: `Emoclew retains equity in every company incorporated through the platform. This is how the platform sustains itself and how it aligns with your success.

**Base stake: 10%** — agreed at Level 0 signup as a condition of accessing incorporation features.

As your company reaches higher levels, the platform equity reduces permanently — this is the loyalty reduction model:

- Level 0–1: Platform retains 10%, you keep 90%
- Level 2: Platform retains 9%, you keep 91%
- Level 3: Platform retains 8%, you keep 92%
- Level 4 (Nova): Platform retains 7%, you keep 93%

The 7% floor is guaranteed. Emoclew will never hold more than 10% and will never hold less than 7%.

This equity is protected by an anti-dilution mechanism. As you raise money or add co-founders, the platform's stake is maintained at or above the protected floor.`
    },
    {
      title: 'Project Visibility',
      content: `You control how discoverable your project is. There are three modes:

**Private:** Your project details are hidden from the general community. However, your tags are always active — the similarity engine can still find you for merge suggestions, co-founder matching, and investor discovery. Private does not mean invisible.

**Selective:** You share full project details with specific chosen individuals. Good for controlled introductions and co-founder conversations without broad exposure.

**Public:** Fully visible to the community. Eligible for ranking, community voting, and the discovery feed.

Changing to Public or Selective requires 2FA to be enabled on your account. This protects you from accidental exposure and ensures you consciously control your visibility.`
    },
    {
      title: 'The Merge System',
      content: `Any two eligible projects on the platform can merge. The merge system is designed to be transparent, protected, and community-validated.

**The merge flow:**
1. Initiator opens a merge thread and proposes an equity split
2. Recipient reviews and either Rejects (thread closes immediately) or Accepts by signing with 2FA
3. Initiator also signs with 2FA — two signatures total, one per party
4. Both confirmed → community ratification vote is triggered
5. Vote passes → merge is finalised

**Community ratification:** Any platform member holding ≥2% equity in either merging company can vote. A simple majority is required within 72 hours. If fewer than 3 eligible voters exist, ratification is automatic. If voters exist but don't vote within 72 hours, silence counts as approval.

**Equity in a merge:** The merged entity inherits the higher of the two projects' levels. Platform equity is determined by the higher level and does not stack. Founders freely negotiate the remaining equity split, guided by a contribution scorecard. No founder receives less than 5% unless explicitly joining as advisor-only.

**Merge is irreversible.** Once finalised, the initiating company is archived. Think carefully before confirming.

**Important:** Emoclew generates SAFE agreements for your use but does not act as a broker-dealer or funding portal. All capital transactions happen outside the platform. You are responsible for porting your SAFE to AngelList, Carta, or independent legal counsel.`
    },
    {
      title: 'Two-Factor Authentication',
      content: `2FA (TOTP) is optional for basic platform use but required for several important actions:

- Making your project publicly discoverable
- Initiating or confirming a merge proposal
- Signing any agreement on the platform

Use any RFC 6238-compatible app: Google Authenticator, Authy, 1Password, or similar. Set it up in Settings → Security.

When you sign an agreement, the platform records your TOTP verification timestamp as part of the digital signature. This is your identity verification on the platform — treat your authenticator app like a legal signing device.`
    }
  ]
};

export const technicalGuides = [
  {
    id: 'company-email',
    title: 'Set Up a Company Email for Free',
    level: 0,
    readTime: '5 min',
    tags: ['email', 'google workspace', 'domain'],
    summary: 'Get a professional @yourcompany.com email forwarded to your personal inbox — without paying for Google Workspace.',
    sections: [
      {
        title: 'What you need',
        content: `- A domain name (e.g. yourcompany.com) — see our domain guide if you don't have one yet
- A Gmail or any personal email account to receive forwarded mail
- About 10 minutes

**The goal:** hello@yourcompany.com forwards to you@gmail.com. You reply from Gmail but it appears to come from hello@yourcompany.com. Professional, free, takes 10 minutes.`
      },
      {
        title: 'Step 1 — Set up email forwarding at your registrar',
        content: `Most domain registrars (Namecheap, Cloudflare, Porkbun) include free email forwarding.

**On Namecheap:**
1. Log in → Domain List → Manage your domain
2. Click "Email" in the left menu
3. Under "Email Forwarding", add a new record:
   - Alias: hello (or founders, team, contact — whatever you want)
   - Forward to: your-personal@gmail.com
4. Save

**On Cloudflare:**
1. Select your domain → Email → Email Routing
2. Enable Email Routing
3. Add a Custom Address: hello@yourcompany.com → your-personal@gmail.com
4. Verify your personal email when prompted

**On Porkbun:**
1. Domain Management → Email Forwarding
2. Add forward: hello → your-personal@gmail.com

Allow up to 30 minutes for DNS propagation.`
      },
      {
        title: 'Step 2 — Send mail from Gmail as your company address',
        content: `This makes your replies appear to come from hello@yourcompany.com.

1. In Gmail, go to Settings (gear) → See all settings → Accounts and Import
2. Under "Send mail as", click "Add another email address"
3. Enter your name and hello@yourcompany.com
4. Uncheck "Treat as an alias"
5. Click Next → set SMTP server as smtp.gmail.com, port 587, TLS
6. Username: your-personal@gmail.com, Password: your Gmail app password*
7. Gmail sends a verification code to hello@yourcompany.com — it will forward to your personal inbox
8. Enter the code to verify

*To create a Gmail App Password: Google Account → Security → 2-Step Verification → App passwords → Generate one for "Mail"

Now when composing in Gmail, you can choose which address to send from using the "From" dropdown.`
      },
      {
        title: 'Step 3 — Set as default send address (optional)',
        content: `If you want all replies from Gmail to use your company address by default:

Settings → Accounts and Import → "Send mail as" → set hello@yourcompany.com as default.

**For a team:** Create multiple forwards — founders@, hello@, legal@, investors@ — all routing to different personal inboxes. Free, instant, professional.

**When you outgrow this:** Google Workspace starts at $6/user/month and gives you full @yourcompany.com inboxes with 30GB storage, shared drives, and Meet. Worth it once you have a real team.`
      }
    ]
  },
  {
    id: 'cheap-domain',
    title: 'Register a Domain for Under $10/year',
    level: 0,
    readTime: '5 min',
    tags: ['domain', 'dns', 'namecheap', 'cloudflare'],
    summary: 'Find, register, and configure a domain for your startup without overpaying.',
    sections: [
      {
        title: 'Choosing a domain',
        content: `**The best domain is the one you can afford and remember.** Don't spend weeks agonising over a .com when a .io, .dev, or .xyz gets you moving today.

**Practical priorities:**
1. Short (under 15 characters ideally)
2. Easy to spell when heard aloud
3. No hyphens
4. .com is best but .io, .dev, .app, .xyz are all professional in tech

**Finding availability:** Use [namecheap.com/domains/](https://namecheap.com) or [porkbun.com](https://porkbun.com) — both show alternatives if your first choice is taken.

**Cheap TLDs to consider:**
- .xyz — often $1–2/year for first year
- .dev — $10–12/year, great for developer tools
- .io — $25–35/year, premium but widely trusted in tech
- .com — $10–15/year, the standard
- .app — $14/year, enforces HTTPS by default`
      },
      {
        title: 'Where to register',
        content: `**Porkbun** — Best prices, clean interface, free WHOIS privacy included. Recommended for most founders.

**Namecheap** — Reliable, slightly higher prices than Porkbun but excellent reputation. Good email forwarding tools built in.

**Cloudflare Registrar** — Sells domains at wholesale cost (no markup). Requires a Cloudflare account. Best option if you're already using Cloudflare for DNS (you should be).

**Avoid:** GoDaddy (expensive, dark patterns), Google Domains (discontinued, transferred to Squarespace).

**Always include WHOIS privacy** — this hides your personal address from the public domain registry. Most registrars include it free. Never register without it.`
      },
      {
        title: 'Pointing your domain to your app',
        content: `Once registered, you need DNS records to point your domain to your hosting.

**For most hosting providers (Vercel, Netlify, Railway):**
1. Your host gives you a CNAME value (e.g. cname.vercel-dns.com)
2. In your registrar's DNS settings, add:
   - Type: CNAME
   - Host: www
   - Value: [what your host gave you]
3. For the root domain (yourcompany.com without www), use an ALIAS or ANAME record if your registrar supports it, or an A record pointing to your host's IP

**Move DNS to Cloudflare (strongly recommended):**
1. Create a free Cloudflare account
2. Add your domain → it scans existing DNS records
3. Update your registrar's nameservers to Cloudflare's (ns1.cloudflare.com, ns2.cloudflare.com)
4. Manage all DNS from Cloudflare — faster propagation, free SSL, DDoS protection, analytics

DNS changes can take up to 48 hours to propagate globally, but usually under 1 hour with Cloudflare.`
      },
      {
        title: 'SSL Certificate (HTTPS)',
        content: `Your site must use HTTPS. There are several free options:

**Cloudflare (easiest):** If you're using Cloudflare DNS, enable "Full (strict)" SSL mode in the SSL/TLS settings. Cloudflare handles the certificate automatically.

**Let's Encrypt:** Free certificates, auto-renewing, supported by almost every hosting provider. If you deploy to Vercel, Netlify, or Railway — SSL is automatic and you don't need to do anything.

**Self-hosted:** Use Certbot with Let's Encrypt. Run:
\`\`\`
sudo certbot --nginx -d yourcompany.com -d www.yourcompany.com
\`\`\`

Renews automatically every 90 days with a cron job.

Never use HTTP only. Browsers show security warnings, email providers are more likely to mark your emails as spam, and it signals to users that you don't care about security.`
      }
    ]
  },
  {
    id: 'us-business-address',
    title: 'Get a US Business Address Before Incorporation',
    level: 0,
    readTime: '4 min',
    tags: ['legal', 'incorporation', 'address', 'us'],
    summary: 'How to get a legitimate US business address for your startup before you have a Level 3 Delaware C-Corp.',
    sections: [
      {
        title: 'Why you need a US address',
        content: `Before Emoclew incorporates your company at Level 3, you may need a US address for:

- Registering with US-based payment processors (Stripe, PayPal)
- Creating a US bank account preview (Mercury, Wise)
- Receiving official correspondence and legal notices
- Building trust with US-based customers and investors
- Signing up for services that require a US address

A PO Box is not sufficient for most of these purposes. You need a real street address.`
      },
      {
        title: 'Virtual mailbox services',
        content: `A virtual mailbox gives you a real US street address. Mail sent there is scanned and forwarded to your email digitally. Physical packages can be forwarded internationally.

**Recommended services:**

**Anytime Mailbox** — Starting at $5–10/month. 1,000+ address locations across the US. You pick your address (choose a state with no state income tax — Delaware, Wyoming, or Nevada for business purposes). Mail is scanned within hours.

**Stable** — Starting at $9/month. Clean interface, good for startups. Addresses in multiple states.

**PostScan Mail** — Starting at $10/month. Good reputation for business use.

**Earth Class Mail** — More expensive ($19–49/month) but established and trusted by investors.

**For most Level 0–2 founders:** Anytime Mailbox at a Delaware address is sufficient and costs less than $15/month.`
      },
      {
        title: 'Choosing your state',
        content: `When picking a virtual address state, consider:

**Delaware** — The standard for US startups. Most investor-friendly corporate laws, Court of Chancery (specialised business court), no state corporate income tax if you don't operate there. This is where Emoclew will incorporate your company at Level 3.

**Wyoming** — Very low fees, strong LLC protections, no state income tax, privacy-friendly (directors not listed publicly). Good alternative if Delaware feels premature.

**Nevada** — No state income tax, strong liability protection. Slightly higher fees than Wyoming.

**Avoid** for your registered address: California (high fees, franchise tax), New York (expensive), any state where you actually live unless you have a specific reason.

**Note:** Your virtual mailbox address is your mailing address. Your registered agent address (required for incorporating) can be separate — services like Northwest Registered Agent provide this for $39–125/year.`
      },
      {
        title: 'Next steps toward incorporation',
        content: `Having a US address is a stepping stone. The full Level 3 incorporation package that Emoclew provides includes:

- Delaware C-Corp formation
- Registered agent service
- US banking setup (Mercury as primary, with Wise and Payoneer as fallbacks covering 200+ countries)
- Payment card or equivalent financial operating rail
- Standardised legal agreements tied to the platform relationship

Until you reach Level 3, your virtual mailbox address is sufficient for most practical purposes. Keep your mail forwarding active — official notices from the IRS, state agencies, and banking partners will come by post.`
      }
    ]
  },
  {
    id: 'stripe-atlas-alternative',
    title: 'Open a US Bank Account as a Foreign Founder',
    level: 1,
    readTime: '6 min',
    tags: ['banking', 'mercury', 'wise', 'us'],
    summary: 'How to open a US business bank account before you have a US company — and what changes when you do.',
    sections: [
      {
        title: 'The challenge',
        content: `US banks traditionally require you to be physically present and have a Social Security Number (SSN) to open an account. As a foreign founder, neither of these is usually possible.

The good news: a new generation of US-based neobanks and fintech platforms have removed most of these barriers. You can have a functional US business bank account operational within days — sometimes hours — without stepping foot in the US.

**What you need before applying:**
- A registered US business entity (LLC or C-Corp) — OR a foreign company with US operations
- A US address (virtual mailbox is fine for most providers)
- Government-issued ID (passport)
- EIN (Employer Identification Number) from the IRS — free, takes 1–4 weeks to obtain online`
      },
      {
        title: 'Mercury — the recommended option',
        content: `Mercury (mercury.com) is the go-to US bank for startups. Purpose-built for tech companies, loved by YC founders, supports international teams.

**What Mercury offers:**
- Free business checking and savings
- No minimum balance, no monthly fees
- USD wire and ACH transfers
- Physical and virtual debit cards
- API access for programmatic banking
- Covered by FDIC insurance up to $250,000 (up to $5M through sweep accounts)

**For foreign founders:** Mercury accepts non-US founders if your company is incorporated in the US. You don't need an SSN — your EIN and passport are sufficient.

**Timeline:** Application takes 10–15 minutes online. Approval typically within 1–3 business days.

**Note:** Mercury is Emoclew's primary banking partner. At Level 3, your Mercury account setup is part of the incorporation package.`
      },
      {
        title: 'Wise Business — for multi-currency',
        content: `Wise Business (wise.com/business) is excellent if you receive payments in multiple currencies or need to pay contractors internationally.

**What Wise offers:**
- Hold and convert 40+ currencies
- Local bank details in USD, EUR, GBP, AUD, CAD, and more
- Low conversion fees (mid-market rate)
- Physical and virtual debit cards
- Batch payments for payroll

**For foreign founders:** Wise Business does not require US incorporation. You can open an account as a foreign company or sole trader. This makes it useful before you have a Delaware C-Corp.

**Best use:** Use Mercury as your primary US USD account and Wise for international payments and multi-currency.

**Limits:** Wise is not a bank (it's an e-money institution). FDIC insurance does not apply. Keep large balances in Mercury.`
      },
      {
        title: 'Getting your EIN',
        content: `An EIN (Employer Identification Number) is your company's US tax ID. You need it to open a US bank account, hire US employees, and file US taxes.

**If you have a US company:**
Apply online at irs.gov/ein. Free. If you have a US phone number or SSN, you get it instantly. Without a US phone number, you apply by fax or mail (takes 4–6 weeks).

**Faster option:** Use a registered agent service (Northwest Registered Agent, Stripe Atlas) — they can obtain an EIN on your behalf as part of their incorporation service.

**If you don't have a US company yet:**
You cannot get an EIN for a foreign company easily. Focus on reaching Level 3 on Emoclew or using Wise Business (which doesn't require an EIN) as a bridge.

**Keep your EIN private** — it's equivalent to a Social Security Number for your company. Don't share it publicly.`
      }
    ]
  }
];
