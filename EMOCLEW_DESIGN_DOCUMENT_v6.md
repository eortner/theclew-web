# Emoclew — Platform Design Document

**Version:** 6.0 — Final working document including visual, technical, and legal design decisions  
**Status:** Internal — not for public distribution

---

## Concept

Emoclew is an open accelerator platform anyone in the world can join. Founders create a project, develop it through structured progression, and unlock progressively greater support, visibility, infrastructure, and economic opportunity. Designed for builders who have the capability to create real companies but lack the legal, financial, operational, and network scaffolding to do so alone.

---

## Public-Facing Positioning

The public landing page reveals:

- The mission and founder-first philosophy
- That projects progress through levels
- That collaboration and joining forces are part of the model
- That the platform helps global builders move toward real company formation
- That a community and tooling access are included
- A link to the manifesto/founding document

The public landing page does not reveal:

- Exact progression thresholds or scoring logic
- Anti-gaming mechanics
- Full economic formulas and pool distribution details
- Detailed merge mechanics
- Exact operational and legal partner stack
- Financial architecture internals
- Investor model specifics

---

## Core Value Proposition

**Public:** "Wherever you are in the world — submit your idea, grow it through a structured path, and unlock the infrastructure needed to turn it into a real company."

**Internal:** "Wherever you are in the world — submit your idea for $10, build in public, and by Level 3 you have a Delaware C-Corp, a US bank account, and a debit card delivered to your door."

---

## Audience

- Displaced software developers and digital builders
- Technically capable people without startup infrastructure or access
- First-time founders who need structure, not just inspiration
- Globally distributed builders who want a path into the US market
- Founders looking for collaborators, co-founders, or complementary projects

---

## Level Structure

| Level | Name | Fee / Income | Unlocks | Notes |
|-------|------|-------------|---------|-------|
| 0 | Ember | 30 days free, then $10/year | Platform exploration, project creation, controlled visibility, tag-driven discoverability, community entry, Slack access, co-founder matching | Entry point; founder chooses visibility mode |
| 1 | Spark | Starts at $250/month | Dev tools, testing tools, partner-provided AI credits, project management tools, investor access opens, controlled seat count | First meaningful advancement |
| 2 | Flame | Starts at $500/month | Domain/site support, company-building tools, partner-provided | Reachable quickly with strong traction |
| 3 | Blaze | Starts at $1,500/month | Delaware C-Corp incorporation, US banking setup, operational infrastructure | Serious traction required |
| 4 | Nova | TBD | Funding support, exit advisory, M&A guidance, advanced financial infrastructure | Hardest threshold |

Income values are starting values only and scale as the platform fund grows. Level 0 receives no income.

---

## Level 0 Onboarding

- 30-day free exploration period on entry
- No credit card required to begin
- After 30 days, continued participation requires $10/year
- Founder chooses their initial visibility mode at project creation
- Tag selection must be completed before the project is saved

---

## Project Visibility Model

- **Private** — Full project details hidden from the general community. Still discoverable by similarity through tag embeddings for merge suggestions, co-founder searches, and discovery flows.
- **Selective** — Founder shares full project details with specific chosen individuals. Supports controlled introductions, co-founder conversations, and merger discussions without broad exposure.
- **Public** — Fully visible to the broader community. Eligible for ranking, monthly progression cycles, and community voting.

Private does not mean absent from the network. Tag-based similarity matching is always active regardless of visibility mode.

---

## Tag System

Tags are the core discovery and similarity infrastructure of the platform. They are **platform-curated** — founders select from a fixed set, they do not invent free-text tags.

Each tag has:
- A **name** (e.g. `fintech`, `healthtech`, `legaltech`, `cleantech`)
- An optional **UI category** (`domain`, `tech`, `stage`, `model`, `geo`) — used for display grouping only
- A **768-dimension vector embedding** — pre-computed and stored in PostgreSQL via pgvector

Projects link to tags via a join table. A denormalized `tags[]` array on the project record enables fast reads without joins.

Similarity matching uses **pgvector HNSW cosine search** against tag embeddings. This powers:
- Similar project discovery
- Co-founder matching
- Merge suggestions
- Slackbot recommendations

**Legal boundary:** Tags are never used to algorithmically route investors to specific projects. Investor discovery is passive browsing only. Using tags to match investors to founders would constitute broker-dealer activity and is explicitly prohibited in the platform architecture.

---

## Community and Social Layer

**Slack Community** — All Level 0 and above founders receive access. Used for networking, technology discussion, idea sharing, and finding collaborators. Primary social environment of the platform.

**Slackbot: Project Discovery** — Purpose-built bot operating inside the community. Surfaces similar or complementary projects based on tag embeddings. Enables founders to signal openness to collaboration. Facilitates introductions between compatible founders. Acts as the conversational layer on top of the tag-matching system.

**Partner Tools** — From Level 1: AI assistant credits, development and testing tools, project management platform access. Exact partners subject to negotiation.

---

## Discovery and Networking

Emoclew is both a progression platform and a network engine. Core networking functions:

- Find complementary projects via tag similarity
- Discover potential co-founders
- Connect with teams with adjacent strengths
- Identify merger opportunities
- Move from solo building to structured company formation

---

## Merge System

Any two eligible projects can merge.

### Merge Flow

1. Initiator opens a merge thread on the platform
2. Both parties negotiate equity split within the thread
3. Both founding parties complete **TOTP re-verification** — mandatory before proceeding
4. Both founding parties give final confirmation
5. **Community ratification vote** is triggered
6. Vote passes → merge contract is generated, both founding parties sign digitally with TOTP verification
7. Merged entity inherits the higher of the two levels

### Community Ratification Vote

- **Eligible voters:** Any platform member holding ≥2% equity in either merging company
- **Pass condition:** Simple majority of eligible voters within a **72-hour window**
- **Quorum:** If fewer than 3 eligible voters exist across both companies, ratification is **automatic** — no vote required
- **Silence rule:** If eligible voters exist but none vote within 72 hours, ratification passes automatically — silence equals no objection
- **If vote fails:** 14-day cooling period before the same two projects can attempt to merge again
- **Voting is a platform governance action, not a legal contract** — eligible voters do not require TOTP to cast a ratification vote

### Who Signs Contracts with TOTP Verification

Only parties with direct legal stake in an action are required to sign:

| Action | Required Signatories |
|--------|---------------------|
| Merge agreement | Both founding parties |
| Equity split confirmation | Both founding parties |
| Investor SAFE | Investor + project founder |
| Level 3 incorporation docs | Project founder only |
| Ratification vote | No signature — platform action only |

### Equity Rules

- Merged entity inherits the higher of the two levels
- Platform equity stays at 15% — does not stack
- Remaining 85% freely negotiated between founders
- Contribution scorecard guides but does not dictate the split
- Community ratification confirms legitimacy; equity split stays private
- No co-founder receives less than 5% unless explicitly joining as advisor-only
- Fresh vesting period begins at merge
- Prior work can be recognised through up to 6 months of negotiated vesting credit

**Contribution scorecard inputs:** level difference, prior traction, capital invested, IP/code contributed, ongoing commitment, skill scarcity and complementarity

---

## Platform Equity and Loyalty Reduction Model

Base stake: 15% equity in every incorporated company, agreed at signup.

**Protection structure:**
- 10% protected floor — percentage-based anti-dilution mechanism
- 5% optional pro-rata maintenance rights

**Loyalty equity reduction:**

| Level Reached | Platform Equity Target | Protected Floor |
|--------------|----------------------|-----------------|
| 0–1 | 15% | 10% |
| 2 | 14% | 9% |
| 3 | 13% | 8% |
| 4 (Nova) | 12% | 7% |

Reductions are permanent once a level is reached.

---

## Investor Model

Entry point: Level 1 — after at least one verified monthly cycle.

Structure: Micro-equity with revenue-based monthly payments.

- Fixed monthly instalment returning original capital over time
- Small percentage of monthly revenue as ongoing return
- Monthly payment obligation ends after full term or repayment cap; equity stake remains

**Guardrails:**

| Parameter | Limit |
|-----------|-------|
| Max total investment per project at Level 1 | $10,000 combined |
| Max equity per individual investor | 3% per deal |
| Max revenue share to all investors combined | 5% of monthly revenue |
| Repayment multiple | 1.5× before payments cease |
| Investor accreditation | Declaration required at profile creation |

---

## Investment Infrastructure and Legal Position

Emoclew does not act as a Reg CF funding portal and does not facilitate, broker, or custody investment transactions. The platform generates standardised SAFE agreements (Simple Agreement for Future Equity) that founders sign digitally on-platform and port independently to registered intermediaries such as AngelList or Carta. All capital transactions occur entirely outside Emoclew. Reg CF portal registration remains an option for a future phase but is not part of the current model.

Before any financial features go live: engage US fintech/securities lawyer, confirm SAFE agreement templates with legal counsel, and have all platform agreements reviewed before launch.

---

## Contract Signing and Digital Agreements

All binding platform actions require a digitally verified signature. Signing is triggered only for parties with direct legal stake in the action — community voters and observers never sign.

**Signing flow:**
1. Platform generates the relevant agreement (SAFE, merge contract, incorporation docs)
2. Signatory receives the document for review within the platform
3. Signatory must complete **TOTP re-verification** before signature is accepted — regardless of current login 2FA status
4. Signed agreement is stored as a PDF with embedded signature metadata (timestamp, user ID, TOTP verification record)
5. PDF is portable and can be taken to AngelList, Carta, or legal counsel independently

Emoclew never holds, routes, or custodies money. The signed agreement is infrastructure — not a financial transaction.

---

## Investor Vesting and Abandonment Mechanism

Equity vests proportionally through completed payments — not transferred in full at commitment.

**Abandonment calculation example:** Investor commits 10% equity over 36 monthly payments, makes 5 payments:
- Earned equity: 5 ÷ 36 × 10% = 1.39%
- After abandonment penalty (e.g. 20%): ~1.11% final equity
- Remaining ~8.89% returns to founder pool automatically

**Technical implementation via Stripe webhooks:**

| Stripe Event | Platform Action |
|-------------|-----------------|
| invoice.paid | Vested units +1 in equity ledger |
| invoice.payment_failed | Warning issued |
| 2 consecutive failures | Formal abandonment warning |
| 3 consecutive failures | Abandonment confirmed, equity recalculated with penalty |
| All payments complete | Full equity confirmed, agreement closed |

Grace period: 2 missed payments = warning. 3 consecutive = abandonment. Stripe exhausts retry logic before platform acts.

---

## Financial Architecture

Core principle: Emoclew never holds, routes, or custodies money. All transactions flow through licensed third-party processors. Emoclew is the orchestration layer — not the financial layer.

**Revenue streams:**

| Stream | Mechanism | Classification |
|--------|-----------|----------------|
| Platform subscription | Direct Stripe charge ($10/year + level fees) | SaaS — no special licensing |
| Transaction fee | Stripe Connect automatic split | Platform cut via processor — no MTL required |
| Equity carry | Returns from exits and funding events | Equity income |
| Partner revenue shares | B2B commercial agreements | Standard commercial revenue |

---

## Auto-Incorporation at Level 3

- Delaware C-Corp formation
- US banking access
- Payment card or equivalent financial operating rail
- Standardised legal agreements tied to platform relationship
- All consented to in platform terms at Level 0 signup

---

## Banking Access

| Tier | Partner | Coverage |
|------|---------|----------|
| Primary | Mercury | ~50 countries |
| Secondary | Wise Business | 160+ countries, 40+ currencies |
| Tertiary | Payoneer | 190+ countries, 70 currencies |
| Overflow | Airwallex | 150+ countries, 60+ local accounts |

Covers 200+ countries. Excludes sanctioned nations. Money stays in founder's US company account — the card is the access mechanism only.

---

## Self-Reinforcing Model

- Founders build through the platform
- Some companies create meaningful enterprise value
- Emoclew participates through its equity stake
- Platform proceeds strengthen the common pool
- Stronger support improves outcomes for future founders

---

## Authentication and Security

**JWT Authentication**
- httpOnly cookies — not localStorage
- Cookie name uses `__Host-` prefix in production (enforces Secure + no Domain + path=/ at browser level)
- 7-day expiry
- Token blacklist on logout (in-memory; Redis upgrade planned for multi-instance scale)
- Algorithm pinned to HS256 on verification — prevents algorithm confusion attacks

**Two-Factor Authentication (TOTP)**
- Compatible with Google Authenticator, Authy, and any RFC 6238 app
- Optional on login — user-enabled in account settings
- Mandatory on every contract signing action — regardless of login 2FA status
- Email OTP planned as a second 2FA method in a future phase

**OAuth**
- Google and Facebook OAuth supported via Passport.js
- CSRF protection via state parameter validated against httpOnly cookie
- Session-less — JWT issued on OAuth callback

---

## Technical Stack

**Runtime & Framework**
- Node.js + Express + TypeScript
- Strict TypeScript — no implicit any
- ES2022 target, CommonJS modules

**Database**
- PostgreSQL 16 + pgvector extension (Docker: `pgvector/pgvector:pg16`)
- Prisma ORM with preview feature `postgresqlExtensions`
- HNSW index for cosine similarity search on tag embeddings (768 dimensions)
- Tag embeddings pre-computed and inserted via `scripts/insert-embeddings.ts`

**Auth**
- Passport.js — local, Google OAuth2, Facebook OAuth strategies
- JWT signed with HS256, expiry configurable via `JWT_EXPIRES_IN`
- bcryptjs for password hashing (cost factor 12)
- In-memory token blacklist on logout

**Testing**
- Jest + ts-jest + Supertest
- Separate test database (`emoclew_test`)
- `npm test` — local run with `.env.test`
- `npm run test:ci` — CI run, exits with code
- GitHub Actions CI: spins up `pgvector/pgvector:pg16`, runs migrations, runs full test suite on every push and pull request

**Setup Order**
1. `prisma migrate deploy` — applies schema
2. `db:seed` — inserts tag names
3. `scripts/insert-embeddings.ts` — fills vector embeddings
4. `db:init` — runs all three in sequence (development only, never against production)

**Error Handling**
Backend — response contract

    Every endpoint returns JSON, always. No empty bodies, no raw status-only responses. Even logout returns { message: '...' }

    All error responses follow a single shape: { error: string } for simple errors, { error: { fieldErrors, formErrors } } for validation errors (Zod flatten)

    HTTP status codes are meaningful: 400 bad input, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 500 internal. No 204 on mutation endpoints

Frontend proxy (route.ts)

    Always parses backend response as JSON — malformed or empty body normalises to {}

    Never throws on missing body — defensive try/catch around res.json()

    Always returns NextResponse.json(...) — never raw ArrayBuffer or NextResponse with ambiguous body

    503 returned if backend is unreachable

Frontend API client (lib/api.ts)

    401 always redirects to /login

    All other non-ok responses throw Error with body.error string — never exposes raw objects to the UI

    No err.message ?? "Something went wrong" with any type — always err instanceof Error ? err.message : "Something went wrong"

Frontend UI

    No unhandled promise rejections — every api.* call has try/catch

    Critical flows (logout, form submission) use finally to guarantee navigation/state reset regardless of error

    Error messages shown in a consistent UI pattern: red bordered box with body.error string — never [object Object]

---

## Landing Page — Visual Design System

### Concept

Warm dark 80s-influenced aesthetic. Serious, human, and distinctive. Not corporate. Not hustle culture. Not generic AI startup pastels. Not cold command-centre terminal. The fire gradient (Ember → Nova) is the visual spine of the brand.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| --bg | #0e0d0b | Page background — near-black with warm undertone |
| --surface | #141310 | Section backgrounds |
| --surface-2 | #1a1916 | Cards, elevated surfaces |
| --border | rgba(255,255,255,0.07) | All borders |
| --text | #e8e4dc | Primary text |
| --text-muted | #8a8680 | Secondary text, body copy |
| --text-faint | #4a4844 | Subtle labels, notes |
| --ember | #e85d04 | Level 0 colour, section labels, CTA accents |
| --gold | #f4a261 | Level 1 colour, nav CTA, link colours |
| --spark | #ffd166 | Level 2 colour, success states |
| --cyan | #48cae4 | Level 3 colour |
| --nova | #90e0ef | Level 4 colour |
| Fire gradient | #e85d04 → #f4a261 → #ffd166 → #48cae4 | Logo, headlines, CTA button, level line |

### Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / Headlines | Barlow Condensed | 800 | Bold, condensed, 80s character |
| Body / UI | Inter | 300–600 | Clean, modern, generous line height |
| Data / stats | Inter mono or default mono | — | Only where actual data appears |

### Visual Signatures

- **Perspective grid** — hero section only, amber-tinted, rotateX(20deg), fades via radial mask. Disappears below the fold
- **Ember glow** — pulsing amber halo on the Level 0 dot (box-shadow animation, 2.4s cycle)
- **Fire gradient line** — runs through the level progression track in the hero
- **Section labels** — small all-caps, letter-spaced, ember colour, no decorative elements
- **Card hover** — border shifts to ember-tinted on hover, no motion beyond that
- No glassmorphism
- No icon circles
- No gradient buttons except primary CTA

### Page Sections

- **Navigation** — fixed, transparent on load, frosted glass on scroll. Logo + About + Manifesto links + disabled Log in button + Join waitlist CTA
- **Hero** — full viewport, perspective grid, ember glow, fire gradient headline, level progression graphic
- **Three Pillars** — Build / Connect / Work
- **Five Levels** — named rows, colour-coded per level, one vague benefit line each
- **The Moment** — manifesto-adapted copy, fire gradient on key phrase
- **The Network** — four cards: information network, get discovered, join forces, early investment
- **Global by Design** — single statement section
- **Manifesto Block** — pull quote with link
- **Waitlist CTA** — email input, gradient button, in-page confirmation
- **Footer** — logo, tagline, manifesto link

### Level Colour Map

| Level | Name | Colour |
|-------|------|--------|
| 0 | Ember | #e85d04 — glowing, active |
| 1 | Spark | #f4a261 — 55% opacity (ahead) |
| 2 | Flame | #ffd166 — 45% opacity |
| 3 | Blaze | #48cae4 — 35% opacity |
| 4 | Nova | #90e0ef — 25% opacity |

Levels 1–4 progressively fade to communicate they are ahead on the path, not yet reached.

### Technical Implementation (Landing Page)

- Single self-contained HTML file
- No framework, no build step, no dependencies except Google Fonts via CDN
- Vanilla CSS with custom properties
- Vanilla JS — scroll reveal via IntersectionObserver, nav state, form submission
- Mobile-first, fully responsive
- Breakpoints at 768px and 480px
- `prefers-reduced-motion` respected — animations disabled for accessibility

---

## Open Items

- Emoclew's own legal and investor structure
- Exact level thresholds and performance metrics for advancement
- Final partner stack for tool access at Levels 1–2
- Exact abandonment penalty percentages
- Legal finalisation of the percentage-based anti-dilution mechanism
- Advanced credit mechanics at Nova level
- Country launch list and regional rollout sequence
- Slack community structure and Slackbot technical architecture
- Manifesto hosting URL (placeholder `#` in landing page — replace when live)
- SAFE agreement legal templates — requires US securities lawyer review before any investor features go live
- Email OTP as second 2FA method (next phase)
- AngelList / Carta integration for SAFE portability (future phase)
- Redis-backed token blacklist for multi-instance deployment (current: in-memory, sufficient for single instance launch)

---

*Established 2026. Built for builders. Built for now. Built to last.*
