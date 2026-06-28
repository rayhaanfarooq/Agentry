import { useState } from "react";
import { ArrowRight } from "lucide-react";

import {
  ControlCanvas,
  HeroCanvas,
  IntegrationCanvas,
  ReviewCanvas,
} from "@/components/landing/ProductCanvases";

const navigation = [
  { label: "Features", href: "#features" },
  { label: "Docs", href: "#docs" },
  { label: "GitHub", href: "https://github.com/rayhaanfarooq/Agentry" },
  { label: "Pricing", href: "#pricing" },
];

const footerLinks = [
  { label: "Company", href: "#hero" },
  { label: "Docs", href: "#docs" },
  { label: "GitHub", href: "https://github.com/rayhaanfarooq/Agentry" },
  { label: "Privacy", href: "#pricing" },
  { label: "Terms", href: "#pricing" },
  { label: "Contact", href: "#footer" },
];

const inspectionPath = [
  "Trace Explorer",
  "Timeline",
  "Prompt",
  "Tool Calls",
  "Memory",
  "Evaluations",
];

const reviewPrinciples = [
  {
    title: "Follow the execution, not just the answer.",
    body: "Inspect the entire path from incoming request to final completion, including latency, nested steps, and tool decisions.",
  },
  {
    title: "Keep prompt and context review first-class.",
    body: "Prompt construction, retrieved memory, and completion details should be visible in the same place as status and timing.",
  },
  {
    title: "Make regressions obvious before production.",
    body: "Evaluation state, tool reliability, and runtime drift should stay adjacent to the trace rather than hidden in separate systems.",
  },
];

const systemNotes = [
  "Python SDK emits traces and spans with minimal code changes.",
  "FastAPI validates payloads and owns business logic.",
  "SQLAlchemy persists data to Supabase PostgreSQL.",
  "The dashboard turns raw execution data into an inspectable workflow.",
];

const trustNotes = [
  {
    label: "Application boundary",
    value: "FastAPI owns routing, validation, services, and repositories.",
  },
  {
    label: "Infrastructure boundary",
    value:
      "Supabase provides PostgreSQL, migrations, and future Auth or Storage support.",
  },
  {
    label: "Instrumentation boundary",
    value:
      "The Python SDK batches traces, retries uploads, and stays lightweight in application code.",
  },
  {
    label: "Validation boundary",
    value:
      "The dummy agent and dashboard exist to exercise real product workflows, not fake marketing concepts.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    note: "For early local validation and product evaluation.",
    details: [
      "Single workspace",
      "Core trace review",
      "Local development flow",
    ],
  },
  {
    name: "Pro",
    price: "$99",
    note: "For teams instrumenting agents across environments.",
    details: [
      "Longer trace retention",
      "Evaluation workflows",
      "Team collaboration",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "For engineering organizations that need control and scale.",
    details: [
      "Advanced governance",
      "Security review support",
      "Environment controls",
    ],
  },
];

const faqs = [
  {
    question: "What models are supported?",
    answer:
      "Agentry is being designed as provider-agnostic developer infrastructure, so the architecture is meant to support multiple model vendors rather than only one.",
  },
  {
    question: "Does Agentry work with OpenAI?",
    answer:
      "Yes. The platform direction is to instrument agent systems regardless of the model provider behind them.",
  },
  {
    question: "Can I self-host?",
    answer:
      "Self-hosting belongs to the broader roadmap. The current repository focuses on a strong hosted and local development foundation first.",
  },
  {
    question: "What does the first integration look like?",
    answer:
      "The intended first step is lightweight instrumentation with the SDK, followed by trace ingestion into the backend and review through the dashboard.",
  },
];

const codeExamples = {
  python: `from agentry import monitor

def answer(message: str) -> str:
    with monitor.trace("support-router"):
        with monitor.span(
            "retrieve_context",
            metadata={"source": "policy-index"},
        ):
            context = load_context(message)

        with monitor.span(
            "generate_response",
            metadata={"model": "gpt-4o-mini"},
        ):
            return run_agent(message, context)`,
  http: `from datetime import UTC, datetime
from uuid import uuid4

import httpx

now = datetime.now(UTC).isoformat()

payload = {
    "sdk": {"name": "agentry-python", "version": "0.1.0"},
    "traces": [
        {
            "trace_id": str(uuid4()),
            "name": "support-router",
            "service_name": "support-api",
            "environment": "production",
            "status": "ok",
            "started_at": now,
            "ended_at": now,
            "metadata": {"project": "support"},
            "spans": [],
            "tool_calls": [],
            "events": [],
        }
    ],
}

httpx.post(f"{AGENTRY_API_URL}/v1/traces", json=payload, timeout=5)`,
};

export function HomePage() {
  const [activeCode, setActiveCode] =
    useState<keyof typeof codeExamples>("python");

  return (
    <main className="landing-page">
      <header className="site-header">
        <div className="page-shell site-header__inner">
          <a className="brand" href="#hero" aria-label="Agentry home">
            <span className="brand__mark">A</span>
            <span className="brand__lockup">
              <strong>Agentry</strong>
              <span>AI agent infrastructure</span>
            </span>
          </a>

          <nav className="site-nav" aria-label="Primary navigation">
            {navigation.map((item) => {
              const isExternal = item.href.startsWith("http");

              return (
                <a
                  key={item.label}
                  className="site-nav__link"
                  href={item.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="site-header__actions">
            <a
              className="button button--primary button--compact"
              href="#pricing"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      <section className="hero" id="hero">
        <div className="page-shell hero__layout">
          <div className="hero__copy">
            <p className="eyebrow">Developer infrastructure for AI agents</p>
            <h1>
              Inspect every execution
              <br />
              before it becomes a
              <br />
              production problem.
            </h1>
            <p className="hero__lede">
              Trace, evaluate, benchmark, and improve AI agents with the kind of
              review surface engineering teams expect from real infrastructure.
            </p>

            <div className="hero__actions">
              <a className="button button--primary" href="#pricing">
                Get Started
                <ArrowRight className="button__icon" />
              </a>
              <a className="button button--secondary" href="#docs">
                View Documentation
              </a>
            </div>

            <div className="hero__notes">
              <p>Built for teams shipping agent systems into production.</p>
              <ul>
                <li>Trace Explorer</li>
                <li>Evaluation review</li>
                <li>Memory inspection</li>
                <li>Python instrumentation</li>
              </ul>
            </div>
          </div>

          <div className="hero__visual">
            <HeroCanvas />
          </div>
        </div>
      </section>

      <section className="path-strip" id="features">
        <div className="page-shell">
          <div className="path-strip__panel">
            <div className="section-rail">
              <span />
              <p>What the product makes legible</p>
            </div>
            <div className="path-strip__flow">
              {inspectionPath.map((item, index) => (
                <div key={item} className="path-strip__node">
                  <strong>{item}</strong>
                  {index < inspectionPath.length - 1 ? <span>→</span> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="page-shell section-block__intro">
          <div className="section-block__heading">
            <p className="eyebrow">Why engineers care</p>
            <h2>The final answer is the least interesting part of the run.</h2>
          </div>
          <div className="section-block__body">
            <p>
              Agentry is built so teams can understand how the response was
              produced, what context shaped it, which tool calls influenced it,
              and whether it met the bar required to ship.
            </p>
          </div>
        </div>

        <div className="page-shell">
          <ReviewCanvas />
        </div>

        <div className="page-shell">
          <div className="editorial-list">
            {reviewPrinciples.map((item, index) => (
              <article key={item.title} className="editorial-list__item">
                <span className="editorial-list__index">0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block section-block--tinted" id="docs">
        <div className="page-shell section-block__intro">
          <div className="section-block__heading">
            <p className="eyebrow">How it works</p>
            <h2>Instrument the application you already have.</h2>
          </div>
          <div className="section-block__body">
            <p>
              The SDK emits traces. The backend validates and stores them. The
              dashboard turns the result into a workflow your team can actually
              use during debugging, releases, and operational review.
            </p>
          </div>
        </div>

        <div className="page-shell integration-layout">
          <div className="integration-layout__notes">
            <div className="section-rail">
              <span />
              <p>System path</p>
            </div>
            <div className="system-ledger">
              {systemNotes.map((item) => (
                <div key={item} className="system-ledger__row">
                  <span className="system-ledger__dot" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="code-switcher">
            <div className="code-switcher__tabs" role="tablist">
              {(
                Object.keys(codeExamples) as Array<keyof typeof codeExamples>
              ).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeCode === key}
                  className={`code-switcher__tab ${activeCode === key ? "is-active" : ""}`}
                  onClick={() => setActiveCode(key)}
                >
                  {key === "python" ? "Python SDK" : "HTTP Batch"}
                </button>
              ))}
            </div>
            <pre className="code-switcher__panel">
              <code>{codeExamples[activeCode]}</code>
            </pre>
          </div>
        </div>

        <div className="page-shell">
          <IntegrationCanvas />
        </div>
      </section>

      <section className="section-block">
        <div className="page-shell trust-layout">
          <div className="trust-layout__visual">
            <ControlCanvas />
          </div>

          <div className="trust-layout__content">
            <p className="eyebrow">Why teams can trust it</p>
            <h2>Built like infrastructure, not a launch page.</h2>
            <p>
              Agentry keeps vendor tooling in the infrastructure layer and keeps
              application decisions in code. That separation is what makes the
              product durable as the platform grows.
            </p>

            <div className="trust-ledger">
              {trustNotes.map((item) => (
                <div key={item.label} className="trust-ledger__row">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-block section-block--tight" id="pricing">
        <div className="page-shell section-block__intro">
          <div className="section-block__heading">
            <p className="eyebrow">How to start</p>
            <h2>
              Start with traces. Grow into evaluations and context review.
            </h2>
          </div>
          <div className="section-block__body">
            <p>
              The pricing structure can stay simple while the product matures.
              What matters first is that the platform reads as credible and
              immediately useful.
            </p>
          </div>
        </div>

        <div className="page-shell">
          <div className="pricing-band">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`pricing-band__plan ${plan.featured ? "is-featured" : ""}`}
              >
                <p className="pricing-band__name">{plan.name}</p>
                <h3>{plan.price}</h3>
                <p className="pricing-band__note">{plan.note}</p>
                <ul>
                  {plan.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block section-block--tight">
        <div className="page-shell faq-layout">
          <div className="faq-layout__intro">
            <p className="eyebrow">FAQ</p>
            <h2>Short answers for the first serious questions.</h2>
          </div>

          <div className="faq-list">
            {faqs.map((item) => (
              <article key={item.question} className="faq-list__item">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer" id="footer">
        <div className="page-shell site-footer__inner">
          <div className="site-footer__brand">
            <a className="brand" href="#hero" aria-label="Agentry home">
              <span className="brand__mark">A</span>
              <span className="brand__lockup">
                <strong>Agentry</strong>
                <span>Developer infrastructure for AI agents</span>
              </span>
            </a>
            <p>
              Trace, evaluate, benchmark, and improve AI agents with confidence.
            </p>
          </div>

          <div className="site-footer__links">
            {footerLinks.map((link) => {
              const isExternal = link.href.startsWith("http");

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      </footer>
    </main>
  );
}
