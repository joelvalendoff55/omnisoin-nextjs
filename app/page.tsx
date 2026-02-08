"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [Component, setComponent] = useState<any>(null);

  useEffect(() => {
    import("@/views/Index")
      .then((mod) => {
        setComponent(() => mod.default);
      })
      .catch((err) => {
        setError(String(err) + " | " + (err?.stack || ""));
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Erreur de chargement</h1>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, background: "#fee", padding: 10 }}>{error}</pre>
      </div>
    );
  }

  if (!Component) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}><p>Chargement...</p></div>;
  }

  return <Component />;
}