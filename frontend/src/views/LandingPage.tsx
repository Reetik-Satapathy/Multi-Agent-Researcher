import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  FileSearch,
  GitCompareArrows,
  Menu,
  MessageCircle,
  MoveUpRight,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import "../landing.css";

interface LandingPageProps {
  onStartResearch: () => void;
}

const sourceNames = ["CROSSREF", "OPENALEX", "SEMANTIC SCHOLAR"];

const workflowSteps = [
  {
    number: "01",
    eyebrow: "DISCOVER",
    title: "Find the signal in the noise.",
    copy: "Search across trusted scholarly sources, then sort by relevance, citations, or recency. Save the papers that earn a closer look.",
    icon: Search,
    accent: "lime",
  },
  {
    number: "02",
    eyebrow: "UNDERSTAND",
    title: "Ask better questions of every paper.",
    copy: "Open a paper and move from abstract to insight with grounded Q&A for methods, findings, key points, and limitations.",
    icon: MessageCircle,
    accent: "paper",
  },
  {
    number: "03",
    eyebrow: "SYNTHESIZE",
    title: "Make the comparison impossible to miss.",
    copy: "Upload two PDFs to surface similarities, differences, gaps, and the context behind them in one structured view.",
    icon: GitCompareArrows,
    accent: "violet",
  },
];

const reportSections = [
  "Executive summary",
  "Research landscape",
  "Comparative analysis",
  "Research gaps",
  "Future opportunities",
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="#top" aria-label="REWORK Ai home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="brand-name">
        REWORK <b>Ai</b>
      </span>
    </a>
  );
}

function SectionKicker({ children, index }: { children: string; index?: string }) {
  return (
    <div className="section-kicker">
      {index && <span className="section-kicker__index">{index}</span>}
      <span className="signal-dot" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function LandingPage({ onStartResearch }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-page">
    <main id="top" className="site-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <Logo />
          <nav className={`nav-links ${menuOpen ? "nav-links--open" : ""}`} aria-label="Primary navigation">
            <a href="#workflow" onClick={closeMenu}>Workflow</a>
            <a href="#reports" onClick={closeMenu}>Reports</a>
            <a href="#about" onClick={closeMenu}>Why REWORK</a>
            <a href="#start" className="nav-links__mobile-cta" onClick={(event) => { event.preventDefault(); closeMenu(); onStartResearch(); }}>Start researching <ArrowUpRight size={15} /></a>
          </nav>
          <a className="button button--small button--outline nav-cta" href="#start" onClick={(event) => { event.preventDefault(); onStartResearch(); }}>Start researching <ArrowUpRight size={15} /></a>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <section className="hero section-pad">
        <div className="hero__copy">
          <div className="eyebrow"><span className="eyebrow__line" />RESEARCH OPERATING SYSTEM</div>
          <h1>Research, rebuilt <em>around</em> the question.</h1>
          <p className="hero__lede">REWORK Ai brings discovery, paper-level understanding, and synthesis into one focused workspace — so your next insight starts with a better question.</p>
          <div className="hero__actions">
            <a className="button button--primary" href="#start" onClick={(event) => { event.preventDefault(); onStartResearch(); }}>Start your research <ArrowUpRight size={17} /></a>
            <a className="text-link" href="#workflow">See how it works <ArrowDownRight size={16} /></a>
          </div>
          <div className="hero__note"><span className="pulse-dot" /> Built for students, researchers, and technical teams.</div>
        </div>

        <div className="hero-console" aria-label="REWORK Ai research workspace preview">
          <div className="console-glow" />
          <div className="console-topline">
            <div className="console-brand"><span className="console-brand__mark">R/</span> RESEARCH DESK</div>
            <div className="console-status"><span className="status-dot" /> LIVE WORKSPACE</div>
          </div>
          <div className="console-content">
            <div className="console-command"><span className="command-symbol">⌘</span><span className="command-text">{searched ? "attention is all you need" : "What are you trying to understand?"}</span><kbd>↵</kbd></div>
            <div className="console-label-row"><span>{searched ? "SIGNAL FOUND" : "RECENT RESEARCH SIGNALS"}</span><span>01 — 04</span></div>
            <div className={`console-result ${searched ? "console-result--active" : ""}`}>
              <div className="console-result__top"><span className="result-type">PAPER / 2024</span><span className="verified"><Check size={12} /> VERIFIED SIGNAL</span></div>
              <h2>{searched ? "Attention is all you need" : "Scaling laws for neural language models"}</h2>
              <p>{searched ? "A clear read on why transformer architecture changed the shape of modern research." : "Kaplan, McCandlish, Henighan et al. · OpenAI"}</p>
              <div className="result-meta"><span>RELEVANCE <b>{searched ? "98" : "94"}</b></span><span>CITATIONS <b>{searched ? "22.4K" : "8.9K"}</b></span><span>2020</span></div>
            </div>
            <div className="console-footer">
              <div className="source-stack"><span className="source-stack__label">SEARCHING</span>{sourceNames.map((source) => <span key={source} className="source-pill">{source}</span>)}</div>
              <button className="console-action" type="button" onClick={() => setSearched(true)}>{searched ? "Signal opened" : "Run a search"} <MoveUpRight size={14} /></button>
            </div>
          </div>
          <div className="console-scanline" aria-hidden="true" />
        </div>
      </section>

      <section className="source-band" aria-label="Scholarly source coverage">
        <div className="source-band__inner">
          <span className="source-band__lead">One question.<br /><b>More signal.</b></span>
          <div className="source-band__sources">{sourceNames.map((source, index) => <span key={source}><i>0{index + 1}</i>{source}</span>)}</div>
          <span className="source-band__caption">Cross-source discovery<br />without the tab sprawl.</span>
        </div>
      </section>

      <section id="workflow" className="workflow section-pad">
        <div className="workflow__intro">
          <SectionKicker index="01">THE WORKFLOW</SectionKicker>
          <h2>One focused path from<br /><span>question to clarity.</span></h2>
          <p>Stop stitching together five different tools. REWORK Ai keeps the research loop visible — and keeps you moving.</p>
        </div>
        <div className="workflow__steps">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return <article className={`workflow-card workflow-card--${step.accent}`} key={step.number}>
              <div className="workflow-card__top"><span className="workflow-card__number">{step.number}</span><Icon size={21} strokeWidth={1.6} /></div>
              <div className="workflow-card__body"><div className="card-eyebrow">{step.eyebrow}</div><h3>{step.title}</h3><p>{step.copy}</p></div>
              <a className="round-arrow" href="#start" aria-label={`Learn more about ${step.eyebrow.toLowerCase()}`}><ArrowUpRight size={18} /></a>
            </article>;
          })}
        </div>
      </section>

      <section id="about" className="evidence section-pad">
        <div className="evidence__visual">
          <div className="evidence-card evidence-card--back"><span>ABSTRACT</span><div className="skeleton-lines"><i /><i /><i /><i /></div></div>
          <div className="evidence-card evidence-card--front">
            <div className="evidence-card__header"><span className="evidence-card__icon"><FileSearch size={18} /></span><span>ASK THIS PAPER</span><span className="evidence-card__dots">•••</span></div>
            <div className="question-bubble">What is the central finding?</div>
            <div className="answer-bubble"><span className="answer-bubble__spark"><Sparkles size={14} /></span><div><b>The central finding</b><p>Transformer models scale predictably with compute, data, and parameters — revealing a reliable path to stronger performance.</p><cite>[p. 04] [p. 12]</cite></div></div>
            <div className="evidence-card__input">Ask a follow-up <ArrowUpRight size={15} /></div>
          </div>
          <div className="evidence__stamp"><span>GROUNDED</span><span>IN CONTEXT</span></div>
        </div>
        <div className="evidence__copy">
          <SectionKicker index="02">EVIDENCE, NOT ECHOES</SectionKicker>
          <h2>Go from “I found it”<br />to <span>“I understand it.”</span></h2>
          <p>Ask a paper what matters. REWORK Ai keeps answers close to the source, separates evidence from interpretation, and tells you when the context isn’t enough.</p>
          <ul className="check-list"><li><span><Check size={13} /></span>Paper-level question answering</li><li><span><Check size={13} /></span>Page-aware PDF citations</li><li><span><Check size={13} /></span>Fast prompts for methods, findings, and limits</li></ul>
          <a className="text-link text-link--dark" href="#start">Explore a paper <ArrowUpRight size={16} /></a>
        </div>
      </section>

      <section id="reports" className="reports section-pad">
        <div className="reports__header">
          <SectionKicker index="03">THE SYNTHESIS LAYER</SectionKicker>
          <h2>When the research gets<br /><span>messy, make it legible.</span></h2>
          <p>Compare two papers side by side. Generate a structured report. Refine the thinking until the next step is obvious.</p>
        </div>
        <div className="report-workspace">
          <div className="report-workspace__rail"><div className="rail-label">REPORT / DRAFT 04</div><div className="rail-title">The future of<br />human attention</div><div className="rail-divider" />{reportSections.map((section, index) => <div key={section} className={`rail-item ${index === 0 ? "rail-item--active" : ""}`}><span>0{index + 1}</span>{section}</div>)}<div className="rail-wordcount">2,840 words <span>saved just now</span></div></div>
          <div className="report-workspace__page"><div className="page-topline"><span>EXECUTIVE SUMMARY</span><span>EDIT WITH COPILOT <Sparkles size={13} /></span></div><h3>Attention is no longer a scarce resource.</h3><p className="page-intro">It is an environment — shaped by the systems we build, the interfaces we trust, and the questions we choose to ask.</p><p>Across the literature, a pattern emerges: the most effective research does not move faster by skipping context. It moves faster by making context easier to navigate.</p><div className="page-callout"><span className="page-callout__mark">“</span><div><b>RESEARCH GAP DETECTED</b><p>Existing work measures attention as an individual outcome. Few studies examine the interface as an active participant.</p></div></div><div className="page-cursor"><span /> REWORK COPILOT</div></div>
        </div>
      </section>

      <section id="start" className="final-cta section-pad">
        <div className="final-cta__halo" />
        <div className="final-cta__content"><div className="final-cta__mark">R/</div><SectionKicker>YOUR NEXT QUESTION</SectionKicker><h2>Find the signal.<br /><em>Then make something of it.</em></h2><p>Open a clearer path through the literature — and give your best questions somewhere to go.</p><a className="button button--dark" href="#top" onClick={(event) => { event.preventDefault(); onStartResearch(); }}>Start researching <ArrowUpRight size={17} /></a></div>
      </section>

      <footer className="footer"><div className="footer__top"><Logo compact /><div className="footer__meta"><span>RESEARCH DISCOVERY + SYNTHESIS</span><span>© 2024 REWORK Ai</span></div><a className="footer__back" href="#top">Back to top <ChevronDown size={15} /></a></div></footer>
    </main>
    </div>
  );
}

export default LandingPage;
