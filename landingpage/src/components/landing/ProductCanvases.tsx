import type { ReactNode } from "react";

type ProductShellProps = {
  label: string;
  title: string;
  status: string;
  children: ReactNode;
  className?: string;
};

function ProductShell({
  label,
  title,
  status,
  children,
  className = "",
}: ProductShellProps) {
  return (
    <article className={`product-shell ${className}`.trim()}>
      <div className="product-shell__bar">
        <div className="product-shell__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="product-shell__heading">
          <p>{label}</p>
          <h3>{title}</h3>
        </div>
        <span className="product-shell__status">{status}</span>
      </div>
      <div className="product-shell__body">{children}</div>
    </article>
  );
}

function Panel({
  label,
  title,
  children,
  tone = "default",
}: {
  label: string;
  title: string;
  children: ReactNode;
  tone?: "default" | "dark" | "soft";
}) {
  return (
    <section className={`panel panel--${tone}`}>
      <header className="panel__header">
        <div>
          <p className="panel__label">{label}</p>
          <h4>{title}</h4>
        </div>
      </header>
      <div className="panel__body">{children}</div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="mini-stat">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{delta}</span>
    </div>
  );
}

export function HeroCanvas() {
  return (
    <ProductShell
      label="Product overview"
      title="Agentry / production workspace"
      status="Live"
      className="product-shell--hero"
    >
      <div className="hero-canvas">
        <div className="hero-canvas__metrics">
          <MiniStat label="Traces today" value="18.4K" delta="+12.6%" />
          <MiniStat label="P95 latency" value="842 ms" delta="-96 ms" />
          <MiniStat label="Eval pass rate" value="98.7%" delta="+1.9%" />
          <MiniStat label="Projects" value="14" delta="+2 new" />
        </div>

        <div className="hero-canvas__grid">
          <Panel label="Trace Explorer" title="Recent executions">
            <div className="trace-table">
              {[
                ["support-router", "refund escalation", "842 ms", "ok"],
                ["policy-agent", "policy answer", "378 ms", "ok"],
                ["billing-orchestrator", "invoice lookup", "1.22 s", "error"],
                ["onboarding-agent", "access request", "491 ms", "ok"],
              ].map(([service, trace, latency, status], index) => (
                <div
                  key={`${service}-${trace}`}
                  className={`trace-table__row ${index === 0 ? "is-selected" : ""}`}
                >
                  <div>
                    <strong>{service}</strong>
                    <span>{trace}</span>
                  </div>
                  <div className="trace-table__meta">
                    <span>{latency}</span>
                    <em className={`state-pill state-pill--${status}`}>
                      {status}
                    </em>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Trace Detail" title="Execution review" tone="dark">
            <div className="timeline-list">
              {[
                ["receive request", "12 ms"],
                ["retrieve context", "84 ms"],
                ["tool.call.refund_policy", "129 ms"],
                ["generate response", "561 ms"],
                ["run evaluation", "46 ms"],
              ].map(([step, value], index) => (
                <div
                  key={step}
                  className={`timeline-list__row ${index === 2 ? "is-emphasized" : ""}`}
                >
                  <div className="timeline-list__step">
                    <span className="timeline-list__dot" />
                    <strong>{step}</strong>
                  </div>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Prompt review" title="Instruction + completion">
            <div className="prompt-preview">
              <div className="prompt-preview__row">
                <span>system</span>
                <p>
                  Route support requests using policy context before answering.
                </p>
              </div>
              <div className="prompt-preview__row">
                <span>context</span>
                <p>
                  Refund policy, account tier, latest order event, escalation
                  note.
                </p>
              </div>
              <div className="prompt-preview__row prompt-preview__row--strong">
                <span>completion</span>
                <p>
                  Escalate after confidence drops below the configured
                  threshold.
                </p>
              </div>
            </div>
          </Panel>

          <div className="hero-canvas__stack">
            <Panel label="Evaluations" title="Release candidate 24">
              <div className="score-list">
                {[
                  ["Groundedness", "0.98"],
                  ["Routing", "97.4%"],
                  ["Tool reliability", "95.2%"],
                ].map(([label, value]) => (
                  <div key={label} className="score-list__row">
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel label="Memory" title="Retrieved context" tone="soft">
              <div className="memory-list">
                {[
                  ["policy_memory", "0.95 relevance"],
                  ["order_event", "0.92 relevance"],
                  ["billing_article", "0.67 relevance"],
                ].map(([label, value], index) => (
                  <div key={label} className="memory-list__row">
                    <div>
                      <strong>{label}</strong>
                      <span>{value}</span>
                    </div>
                    <div className="memory-list__bar">
                      <span style={{ width: `${94 - index * 17}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </ProductShell>
  );
}

export function ReviewCanvas() {
  return (
    <ProductShell
      label="Execution review"
      title="From incoming trace to final decision"
      status="Trace detail"
      className="product-shell--wide"
    >
      <div className="review-canvas">
        <aside className="review-canvas__sidebar">
          <div className="stack-label">
            <p>Projects</p>
            <strong>Support</strong>
          </div>
          {["production", "latency > 800 ms", "status: error"].map((item) => (
            <span key={item} className="filter-pill">
              {item}
            </span>
          ))}
          <div className="review-sidebar__group">
            {[
              ["trace_9f31", "refund escalation"],
              ["trace_9f12", "policy answer"],
              ["trace_9ef8", "invoice lookup"],
              ["trace_9ed0", "handoff review"],
            ].map(([id, label], index) => (
              <div
                key={id}
                className={`review-sidebar__row ${index === 0 ? "is-selected" : ""}`}
              >
                <strong>{id}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="review-canvas__main">
          <Panel label="Timeline" title="Nested execution graph" tone="dark">
            <div className="review-timeline">
              {[
                ["Agent", "request received"],
                ["LLM call", "prompt compiled"],
                ["Tool", "refund policy"],
                ["LLM call", "final answer"],
                ["Evaluation", "groundedness passed"],
              ].map(([title, detail], index) => (
                <div key={title} className="review-timeline__row">
                  <div className="review-timeline__marker">
                    <span />
                    {index < 4 ? <i /> : null}
                  </div>
                  <div>
                    <strong>{title}</strong>
                    <p>{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="review-canvas__split">
            <Panel label="Prompt viewer" title="Inputs, context, completion">
              <div className="prompt-block">
                <div>
                  <span>Input</span>
                  <p>User asked for a refund after an order shipped late.</p>
                </div>
                <div>
                  <span>Retrieved context</span>
                  <p>Refund policy, customer tier, last shipment event.</p>
                </div>
                <div>
                  <span>Completion</span>
                  <p>
                    Explain the policy and escalate when the confidence score is
                    below the configured threshold.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel label="Tool calls" title="Runtime arguments and result">
              <div className="tool-table">
                {[
                  ["refund_policy.lookup", "129 ms", "ok"],
                  ["crm.customer_tier", "41 ms", "ok"],
                  ["fulfillment.timeline", "58 ms", "ok"],
                ].map(([tool, latency, status]) => (
                  <div key={tool} className="tool-table__row">
                    <div>
                      <strong>{tool}</strong>
                      <span>arguments + return value captured</span>
                    </div>
                    <div className="tool-table__meta">
                      <span>{latency}</span>
                      <em className={`state-pill state-pill--${status}`}>
                        {status}
                      </em>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <aside className="review-canvas__rail">
          <Panel label="Memory analysis" title="Chunk relevance" tone="soft">
            <div className="memory-list">
              {[
                ["customer_policy", "0.95"],
                ["latest_order_event", "0.92"],
                ["agent_notes", "0.81"],
              ].map(([label, value], index) => (
                <div key={label} className="memory-list__row">
                  <div>
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </div>
                  <div className="memory-list__bar">
                    <span style={{ width: `${96 - index * 11}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Evaluations" title="Regression guardrail">
            <div className="score-list">
              {[
                ["answer_quality", "pass"],
                ["policy_match", "pass"],
                ["latency_budget", "warn"],
              ].map(([label, value]) => (
                <div key={label} className="score-list__row">
                  <strong>{label}</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </ProductShell>
  );
}

export function IntegrationCanvas() {
  return (
    <ProductShell
      label="Instrumentation"
      title="Application code becomes a reviewable execution"
      status="SDK linked"
    >
      <div className="integration-canvas">
        <Panel label="Runtime" title="Application emits spans" tone="dark">
          <div className="log-lines">
            {[
              "monitor.trace('support-router') started",
              "monitor.span('retrieve_context') completed in 84 ms",
              "monitor.span('generate_response') completed in 561 ms",
              "batch upload queued for POST /v1/traces",
            ].map((line) => (
              <div key={line} className="log-lines__row">
                <span>$</span>
                <code>{line}</code>
              </div>
            ))}
          </div>
        </Panel>

        <Panel label="Pipeline" title="Agentry ingestion path">
          <div className="pipeline-list">
            {[
              "SDK captures root trace + spans",
              "HTTP batch reaches FastAPI",
              "SQLAlchemy persists to PostgreSQL",
              "Dashboard renders the new execution",
            ].map((step) => (
              <div key={step} className="pipeline-list__row">
                <span className="pipeline-list__index" />
                <p>{step}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel label="Dashboard" title="The trace arrives ready to inspect">
          <div className="arrival-card">
            <div className="arrival-card__summary">
              <strong>trace_a1832</strong>
              <span>support-router / production</span>
            </div>
            <div className="arrival-card__stats">
              <div>
                <p>Latency</p>
                <strong>842 ms</strong>
              </div>
              <div>
                <p>Tokens</p>
                <strong>2,481</strong>
              </div>
              <div>
                <p>Status</p>
                <strong>OK</strong>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </ProductShell>
  );
}

export function ControlCanvas() {
  return (
    <ProductShell
      label="Control plane"
      title="Projects, settings, and release confidence"
      status="Structured"
    >
      <div className="control-canvas">
        <Panel label="Projects" title="Operational surfaces">
          <div className="project-table">
            {[
              ["Support", "production", "6 alerts open"],
              ["Onboarding", "staging", "clean"],
              ["Billing", "production", "1 regression"],
              ["Internal tools", "development", "clean"],
            ].map(([name, env, status]) => (
              <div key={name} className="project-table__row">
                <div>
                  <strong>{name}</strong>
                  <span>{env}</span>
                </div>
                <p>{status}</p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="control-canvas__stack">
          <Panel label="Settings" title="Retention and policy">
            <div className="settings-list">
              {[
                ["Trace retention", "30 days"],
                ["Evaluation suites", "12 active"],
                ["API keys", "scoped by environment"],
              ].map(([label, value]) => (
                <div key={label} className="settings-list__row">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Release review" title="Shipping confidence" tone="soft">
            <div className="score-list">
              {[
                ["routing suite", "passed"],
                ["groundedness suite", "passed"],
                ["memory drift", "watch"],
              ].map(([label, value]) => (
                <div key={label} className="score-list__row">
                  <strong>{label}</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </ProductShell>
  );
}
