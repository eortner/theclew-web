import Link from "next/link";

export const metadata = { title: "Beta Terms — Emoclew" };

export default function BetaTermsPage() {
  return (
    <div className="min-h-screen bg-bg text-text font-body">
      <div className="max-w-2xl mx-auto px-6 py-20">

        {/* Logo */}
        <Link href="/" className="inline-block mb-12">
          <span className="font-display text-2xl font-bold fire-text">EMOCLEW</span>
        </Link>

        <p className="text-xs uppercase tracking-widest text-ember mb-4">Legal</p>
        <h1 className="font-display text-5xl font-black text-text mb-3 leading-none">
          Beta Terms
        </h1>
        <p className="text-sm text-muted mb-12">Last updated: April 2026</p>

        <div className="space-y-8 text-sm text-muted leading-relaxed">

          <section>
            <h2 className="font-display text-xl font-bold text-text uppercase tracking-wide mb-3">
              This is a beta
            </h2>
            <p>
              Emoclew is currently operating as a technology preview (beta). The platform is functional
              but incomplete. Features may change, break, or be removed without notice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-text uppercase tracking-wide mb-3">
              No legal entity
            </h2>
            <p>
              Emoclew is not yet an incorporated legal entity. Nothing you do on this platform
              during the beta period creates a binding legal agreement, financial obligation,
              or enforceable contract of any kind. Merge agreements, equity records, and investor
              flows shown in the beta are simulations only and carry no legal weight.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-text uppercase tracking-wide mb-3">
              No financial transactions
            </h2>
            <p>
              No real money is collected, held, or processed during the beta. Any fee structures
              or subscription amounts shown are illustrative of the intended product design.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-text uppercase tracking-wide mb-3">
              Data
            </h2>
            <p>
              Beta data — including accounts, projects, threads, and equity records — may be reset
              at any point before the full platform launch. We will notify beta users before any
              reset occurs.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-text uppercase tracking-wide mb-3">
              Full launch
            </h2>
            <p>
              The full Emoclew platform, with legal incorporation, binding agreements, and real
              financial infrastructure, is targeted for 2026. Beta participants will receive
              early access.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-text uppercase tracking-wide mb-3">
              Contact
            </h2>
            <p>
              Questions or concerns:{" "}
              <a href="mailto:contact@emoclew.xyz"
                className="text-gold hover:text-spark transition-colors underline underline-offset-2">
                contact@emoclew.xyz
              </a>
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.07]">
          <Link href="/dashboard" className="text-xs text-muted hover:text-gold transition-colors">
            ← Back to dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}