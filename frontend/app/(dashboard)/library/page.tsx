"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { BookOpen, Scale, Wrench, ChevronRight, X, Clock, Lock, FileText, Shield, Handshake, ScrollText, ArrowRight } from "lucide-react";
import { safeAgreement } from "@/lib/docs/safe-agreement";
import { mergeAgreement } from "@/lib/docs/merge-agreement";
import { termsOfService } from "@/lib/docs/terms-of-service";
import { privacyPolicy } from "@/lib/docs/privacy-policy";
import { howWeWork, technicalGuides } from "@/lib/docs/library-content";
import { LEVEL_META } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocSection { title: string; content: string }
interface Document {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  notice?: string;
  sections: DocSection[];
}
interface Guide {
  id: string;
  title: string;
  level: number;
  readTime: string;
  tags: string[];
  summary: string;
  sections: DocSection[];
}

// ─── Document Viewer Modal ────────────────────────────────────────────────────

function DocumentViewer({ doc, onClose }: { doc: Document | null; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState(0);
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl h-screen bg-bg border-l border-white/[0.07] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-8 py-6 border-b border-white/[0.07] bg-surface flex-shrink-0">
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest text-ember mb-1">{doc.subtitle}</p>
            <h2 className="font-display text-2xl font-black text-text">{doc.title.toUpperCase()}</h2>
            <p className="text-xs text-faint mt-1">Version {doc.version} · Last updated {doc.lastUpdated}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors mt-1 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Beta notice */}
        {doc.notice && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5 flex-shrink-0">
            <p className="text-[0.65rem] text-amber-300 leading-relaxed">{doc.notice}</p>
          </div>
        )}

        {/* Section nav + content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Section nav */}
          <div className="w-48 flex-shrink-0 border-r border-white/[0.07] py-4 overflow-y-auto">
            {doc.sections.map((s, i) => (
              <button key={i} onClick={() => setActiveSection(i)}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-xs transition-colors",
                  activeSection === i
                    ? "text-ember bg-ember/10 border-r-2 border-ember"
                    : "text-faint hover:text-muted"
                )}>
                {s.title}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <h3 className="font-display text-lg font-bold text-text uppercase tracking-wide mb-4">
              {doc.sections[activeSection].title}
            </h3>
            <div className="prose prose-sm max-w-none">
              {doc.sections[activeSection].content.split('\n\n').map((para, i) => {
                // Bold markdown
                const rendered = para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text font-semibold">$1</strong>');
                return (
                  <p key={i} className="text-sm text-muted leading-relaxed mb-4 last:mb-0"
                    dangerouslySetInnerHTML={{ __html: rendered }} />
                );
              })}
            </div>
            {/* Prev / Next */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.07]">
              {activeSection > 0 ? (
                <button onClick={() => setActiveSection(s => s - 1)}
                  className="text-xs text-muted hover:text-ember transition-colors flex items-center gap-1">
                  ← {doc.sections[activeSection - 1].title}
                </button>
              ) : <span />}
              {activeSection < doc.sections.length - 1 ? (
                <button onClick={() => setActiveSection(s => s + 1)}
                  className="text-xs text-ember hover:text-gold transition-colors flex items-center gap-1">
                  {doc.sections[activeSection + 1].title} →
                </button>
              ) : (
                <button onClick={onClose} className="text-xs text-spark hover:text-gold transition-colors">
                  Done ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Guide Viewer Modal ───────────────────────────────────────────────────────

function GuideViewer({ guide, onClose }: { guide: Guide | null; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState(0);
  if (!guide) return null;
  const level = LEVEL_META[guide.level];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl h-screen bg-bg border-l border-white/[0.07] flex flex-col shadow-2xl overflow-hidden">

        <div className="flex items-start justify-between gap-4 px-8 py-6 border-b border-white/[0.07] bg-surface flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full border"
                style={{ color: level.color, borderColor: `${level.color}40`, backgroundColor: `${level.color}15` }}>
                LEVEL {guide.level}+
              </span>
              <span className="text-[0.6rem] text-faint flex items-center gap-1">
                <Clock size={9} /> {guide.readTime}
              </span>
            </div>
            <h2 className="font-display text-2xl font-black text-text">{guide.title.toUpperCase()}</h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">{guide.summary}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors mt-1 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 flex-shrink-0 border-r border-white/[0.07] py-4 overflow-y-auto">
            {guide.sections.map((s, i) => (
              <button key={i} onClick={() => setActiveSection(i)}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-xs transition-colors",
                  activeSection === i
                    ? "text-ember bg-ember/10 border-r-2 border-ember"
                    : "text-faint hover:text-muted"
                )}>
                {s.title}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <h3 className="font-display text-lg font-bold text-text uppercase tracking-wide mb-4">
              {guide.sections[activeSection].title}
            </h3>
            <div className="space-y-4">
              {guide.sections[activeSection].content.split('\n\n').map((para, i) => {
                if (para.startsWith('```')) {
                  const code = para.replace(/```[\w]*\n?/, '').replace(/```$/, '');
                  return (
                    <pre key={i} className="bg-black/40 border border-white/[0.07] rounded-lg px-4 py-3 text-xs text-spark font-mono overflow-x-auto">
                      {code}
                    </pre>
                  );
                }
                const rendered = para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text font-semibold">$1</strong>');
                return (
                  <p key={i} className="text-sm text-muted leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: rendered }} />
                );
              })}
            </div>
            <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.07]">
              {activeSection > 0 ? (
                <button onClick={() => setActiveSection(s => s - 1)}
                  className="text-xs text-muted hover:text-ember transition-colors">
                  ← {guide.sections[activeSection - 1].title}
                </button>
              ) : <span />}
              {activeSection < guide.sections.length - 1 ? (
                <button onClick={() => setActiveSection(s => s + 1)}
                  className="text-xs text-ember hover:text-gold transition-colors">
                  {guide.sections[activeSection + 1].title} →
                </button>
              ) : (
                <button onClick={onClose} className="text-xs text-spark hover:text-gold transition-colors">
                  Done ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Legal Doc Card ───────────────────────────────────────────────────────────

function LegalCard({ icon: Icon, doc, onClick }: {
  icon: React.ElementType;
  doc: Document;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="group text-left w-full p-5 bg-surface-2 border border-white/[0.07] rounded-xl hover:border-ember/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="w-9 h-9 rounded-lg bg-ember/10 flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-ember" />
        </div>
        <ChevronRight size={14} className="text-faint group-hover:text-ember transition-colors mt-1 flex-shrink-0" />
      </div>
      <p className="text-sm font-semibold text-text mt-3 mb-1 group-hover:text-ember transition-colors">
        {doc.title}
      </p>
      <p className="text-[0.65rem] text-faint">{doc.subtitle} · v{doc.version}</p>
    </button>
  );
}

// ─── Guide Card ───────────────────────────────────────────────────────────────

function GuideCard({ guide, onClick }: { guide: Guide; onClick: () => void }) {
  const level = LEVEL_META[guide.level];
  return (
    <button onClick={onClick}
      className="group text-left w-full p-5 bg-surface-2 border border-white/[0.07] rounded-xl hover:border-ember/30 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full border"
          style={{ color: level.color, borderColor: `${level.color}40`, backgroundColor: `${level.color}15` }}>
          LEVEL {guide.level}+
        </span>
        <span className="text-[0.6rem] text-faint flex items-center gap-1">
          <Clock size={9} /> {guide.readTime}
        </span>
      </div>
      <p className="text-sm font-semibold text-text mb-2 group-hover:text-ember transition-colors leading-snug">
        {guide.title}
      </p>
      <p className="text-xs text-faint leading-relaxed mb-3">{guide.summary}</p>
      <div className="flex flex-wrap gap-1">
        {guide.tags.map(t => (
          <span key={t} className="text-[0.6rem] text-faint border border-white/[0.07] px-2 py-0.5 rounded-full">
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}

// ─── How We Work Section ──────────────────────────────────────────────────────

function HowWeWorkSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {howWeWork.sections.map((s, i) => (
        <div key={i} className="border border-white/[0.07] rounded-xl overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
            <span className="text-sm font-semibold text-text">{s.title}</span>
            <ChevronRight size={14} className={cn(
              "text-faint transition-transform duration-200",
              open === i && "rotate-90 text-ember"
            )} />
          </button>
          {open === i && (
            <div className="px-5 pb-5 border-t border-white/[0.07]">
              <div className="pt-4 space-y-3">
                {s.content.split('\n\n').map((para, j) => {
                  const rendered = para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text font-semibold">$1</strong>');
                  return (
                    <p key={j} className="text-sm text-muted leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: rendered }} />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Coming Soon Card ─────────────────────────────────────────────────────────

function ComingSoonCard({ title, description, level }: { title: string; description: string; level?: number }) {
  const levelMeta = level !== undefined ? LEVEL_META[level] : null;
  return (
    <div className="p-5 bg-surface-2 border border-white/[0.04] rounded-xl opacity-50">
      <div className="flex items-center gap-2 mb-2">
        <Lock size={12} className="text-faint" />
        {levelMeta && (
          <span className="text-[0.6rem] font-bold" style={{ color: levelMeta.color }}>
            LEVEL {level}+
          </span>
        )}
        {!levelMeta && <span className="text-[0.6rem] text-faint uppercase tracking-widest">Coming soon</span>}
      </div>
      <p className="text-sm font-semibold text-muted mb-1">{title}</p>
      <p className="text-xs text-faint leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = 'how-it-works' | 'legal' | 'technical';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>('how-it-works');
  const [openDoc, setOpenDoc] = useState<Document | null>(null);
  const [openGuide, setOpenGuide] = useState<Guide | null>(null);

  const legalDocs = [
    { icon: ScrollText, doc: termsOfService },
    { icon: Shield,     doc: privacyPolicy },
    { icon: FileText,   doc: safeAgreement },
    { icon: Handshake,  doc: mergeAgreement },
  ];

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'how-it-works', label: 'How It Works',  icon: BookOpen },
    { id: 'legal',        label: 'Legal',          icon: Scale },
    { id: 'technical',    label: 'Technical',      icon: Wrench },
  ];

  return (
    <>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-ember mb-1">Library</p>
          <h1 className="font-display text-4xl font-black fire-text mb-2">LIBRARY</h1>
          <p className="text-sm text-muted">
            Everything you need to understand how Emoclew works, your legal rights, and how to run your company.
            More content is added regularly.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-surface border border-white/[0.07] rounded-xl p-1 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                tab === id ? "bg-ember text-bg" : "text-muted hover:text-text"
              )}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── How It Works ── */}
        {tab === 'how-it-works' && (
          <div className="space-y-6">
            <HowWeWorkSection />

            {/* Coming soon — level gated content */}
            <div>
              <p className="text-xs uppercase tracking-widest text-faint mb-3 mt-8">Unlocks at higher levels</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ComingSoonCard
                  title="Incorporation Guide"
                  description="Step-by-step walkthrough of the Delaware C-Corp formation process at Level 3."
                  level={3}
                />
                <ComingSoonCard
                  title="US Banking Setup"
                  description="How to open and operate your Mercury account after incorporation."
                  level={3}
                />
                <ComingSoonCard
                  title="Investor Relations"
                  description="How to manage investor communications, SAFE agreements, and equity reporting."
                  level={1}
                />
                <ComingSoonCard
                  title="Exit and M&A Guide"
                  description="Advisory resources for acquisition, fundraising, and exit planning."
                  level={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Legal ── */}
        {tab === 'legal' && (
          <div className="space-y-6">
            <div className="px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <p className="text-xs text-amber-300 leading-relaxed">
                <strong className="font-semibold">Beta notice:</strong> All legal documents in this library are prototype templates. They have not been reviewed by legal counsel and carry no legal weight during the beta period. Before the full platform launch, all documents will be reviewed by qualified US attorneys. More documents are being added.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-ember mb-4">Platform Documents</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {legalDocs.map(({ icon, doc }) => (
                  <LegalCard key={doc.title} icon={icon} doc={doc} onClick={() => setOpenDoc(doc)} />
                ))}
              </div>
            </div>

            {/* Coming soon legal */}
            <div>
              <p className="text-xs uppercase tracking-widest text-faint mb-3 mt-6">Coming soon</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ComingSoonCard
                  title="Investor SAFE — Template"
                  description="Customisable SAFE agreement template for investor conversations prior to platform-generated agreements."
                />
                <ComingSoonCard
                  title="Co-Founder Agreement"
                  description="Pre-incorporation co-founder agreement covering equity, vesting, and IP assignment."
                />
                <ComingSoonCard
                  title="NDA Template"
                  description="Mutual non-disclosure agreement for early conversations with potential partners and investors."
                />
                <ComingSoonCard
                  title="Advisor Agreement"
                  description="Equity compensation agreement for advisors joining at less than 5% founder equity."
                />
                <ComingSoonCard
                  title="IP Assignment Agreement"
                  description="Assigns all IP created by founders to the company — required by most investors."
                  level={2}
                />
                <ComingSoonCard
                  title="Delaware C-Corp Documents"
                  description="Certificate of Incorporation, Bylaws, and Stockholder Agreement templates."
                  level={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Technical ── */}
        {tab === 'technical' && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-ember mb-4">Guides</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {technicalGuides.map(guide => (
                  <GuideCard key={guide.id} guide={guide} onClick={() => setOpenGuide(guide as Guide)} />
                ))}
              </div>
            </div>

            {/* Coming soon technical */}
            <div>
              <p className="text-xs uppercase tracking-widest text-faint mb-3 mt-6">Coming soon</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ComingSoonCard
                  title="Setting Up CI/CD for Your Startup"
                  description="GitHub Actions, automated testing, and deployment pipelines — free tier options."
                />
                <ComingSoonCard
                  title="Free and Cheap Infrastructure Stack"
                  description="The best free tiers for hosting, databases, monitoring, and storage in 2026."
                />
                <ComingSoonCard
                  title="Privacy-First Analytics"
                  description="Track your users without violating GDPR or CCPA using open-source alternatives."
                />
                <ComingSoonCard
                  title="Setting Up Stripe for a SaaS"
                  description="Subscriptions, webhooks, and handling failed payments the right way."
                  level={1}
                />
                <ComingSoonCard
                  title="Cap Table Management"
                  description="How to manage equity, options, and SAFEs before and after incorporation."
                  level={2}
                />
                <ComingSoonCard
                  title="Registering Trademarks on a Budget"
                  description="US and international trademark basics, USPTO process, and what to protect first."
                  level={2}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document viewer */}
      {openDoc && <DocumentViewer doc={openDoc} onClose={() => setOpenDoc(null)} />}
      {openGuide && <GuideViewer guide={openGuide as Guide} onClose={() => setOpenGuide(null)} />}
    </>
  );
}
