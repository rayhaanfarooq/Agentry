const futureSections = [
  "Hero",
  "Features",
  "Observability",
  "Evaluations",
  "Tracing",
  "Memory Analysis",
  "Developer SDK",
  "Pricing",
  "FAQ",
  "Footer",
];

export function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "72px 24px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: "960px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Landing Page Scaffold
        </p>

        <h1
          style={{
            marginTop: "16px",
            marginBottom: "16px",
            fontSize: "48px",
            lineHeight: 1.05,
          }}
        >
          Developer infrastructure for AI agents.
        </h1>

        <p
          style={{
            maxWidth: "680px",
            color: "#475569",
            fontSize: "18px",
          }}
        >
          Trace, evaluate, benchmark, and improve AI agents with confidence.
        </p>

        <section
          style={{
            marginTop: "48px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            borderRadius: "24px",
            backgroundColor: "#ffffff",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Planned sections</h2>
          <p style={{ color: "#475569" }}>
            This app is intentionally lightweight in Phase 1. Styling and full
            section implementation will follow in a later milestone.
          </p>

          <ul style={{ paddingLeft: "20px", color: "#0f172a" }}>
            {futureSections.map((section) => (
              <li key={section} style={{ marginBottom: "8px" }}>
                {section}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
