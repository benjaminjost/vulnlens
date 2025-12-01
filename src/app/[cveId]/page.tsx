"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { searchCVE } from "@/lib/projectdiscovery-api";
import { CVERecord } from "@/models/CVERecord";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function CVEDetailPage({
  params,
}: {
  params: Promise<{ cveId: string }>;
}) {
  const [cveId, setCveId] = useState<string>("");
  const [cveData, setCveData] = useState<CVERecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      setCveId(p.cveId);
      fetchCVEData(p.cveId);
    });
  }, [params]);

  useEffect(() => {
    if (cveData) {
      document.title = `${cveData.cveId} - ${cveData.name || "CVE Details"} | Vulnx`;
    } else if (cveId) {
      document.title = `${cveId} | Vulnx`;
    }
  }, [cveData, cveId]);

  const isValidCveId = (id: string): boolean => {
    const cveRegex = /^CVE-\d{4}-\d{4,}$/i;
    return cveRegex.test(id);
  };

  const fetchCVEData = async (id: string) => {
    setLoading(true);
    setError(null);

    if (!isValidCveId(id)) {
      setError(`Invalid CVE ID format: ${id}. Expected format: CVE-YYYY-NNNNN`);
      setLoading(false);
      return;
    }

    const result = await searchCVE({
      query: id,
    });

    if (result.success && result.data && result.data.length > 0) {
      setCveData(result.data[0]);
    } else if (result.error) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-6 py-6">
          {loading && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading CVE data...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && !loading && (
            <Card className="border-status-critical/40 bg-status-critical/10">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-3">
                  <AlertCircle className="h-8 w-8 text-status-critical" />
                  <p className="text-sm font-medium text-status-critical">
                    Error: {error}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && cveData && (
            <div className="space-y-6">
              {/* Header Card with CVE ID and Basic Info */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        {cveData.cveId}
                      </h1>
                      <h2 className="text-xl text-muted-foreground">
                        {cveData.name || cveData.product || "N/A"}
                      </h2>
                    </div>

                    {/* CVSS Score and Severity */}
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          CVSS Score:
                        </span>
                        <span className="text-2xl font-bold text-foreground">
                          {cveData.score.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold ${
                            cveData.severity.toLowerCase() === "critical"
                              ? "bg-status-critical text-status-critical-foreground"
                              : cveData.severity.toLowerCase() === "high"
                                ? "bg-status-high text-status-high-foreground"
                                : cveData.severity.toLowerCase() === "medium"
                                  ? "bg-status-medium text-status-medium-foreground"
                                  : cveData.severity.toLowerCase() === "low"
                                    ? "bg-status-low text-status-low-foreground"
                                    : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {cveData.severity}
                        </span>
                      </div>
                      {cveData.hasPoC && (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-status-critical text-status-critical-foreground">
                          PoC Available
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <div className="bg-card rounded-lg p-4 border border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Description
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cveData.description}
                </p>
              </div>

              {/* Impact & Remediation */}
              {(cveData.impact || cveData.remediation || cveData.requirements) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cveData.impact && (
                    <div className="bg-card rounded-lg p-4 border border-border">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Impact
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed">
                        {cveData.impact}
                      </p>
                    </div>
                  )}
                  {cveData.remediation && (
                    <div className="bg-card rounded-lg p-4 border border-border">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Remediation
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed">
                        {cveData.remediation}
                      </p>
                    </div>
                  )}
                  {cveData.requirements && (
                    <div className="bg-card rounded-lg p-4 border border-border md:col-span-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Requirements
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed">
                        {cveData.requirements}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cveData.vendor && (
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Vendor
                    </h4>
                    <p className="text-sm text-foreground font-medium">
                      {cveData.vendor}
                    </p>
                  </div>
                )}
                {cveData.product && (
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Product
                    </h4>
                    <p className="text-sm text-foreground font-medium">
                      {cveData.product}
                    </p>
                  </div>
                )}
                {cveData.vulnerabilityType && (
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Type
                    </h4>
                    <p className="text-sm text-foreground font-medium capitalize">
                      {cveData.vulnerabilityType.replaceAll("_", " ")}
                    </p>
                  </div>
                )}
                {cveData.publishedAt && (
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Published
                    </h4>
                    <p className="text-sm text-foreground font-medium">
                      {new Date(cveData.publishedAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                )}
                {cveData.updatedAt && (
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Updated
                    </h4>
                    <p className="text-sm text-foreground font-medium">
                      {new Date(cveData.updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Age
                  </h4>
                  <p className="text-sm text-foreground font-medium">
                    {cveData.ageInDays} days
                  </p>
                </div>
              </div>

              {/* Security Attributes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Patch Available
                  </h4>
                  <p className="text-sm text-foreground font-semibold">
                    {cveData.isPatchAvailable ? "✓ Yes" : "✗ No"}
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Attributes
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {cveData.isExploitSeen && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-status-critical text-status-critical-foreground">
                        Exploit Seen
                      </span>
                    )}
                    {cveData.isRemote && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-primary text-primary-foreground">
                        Remote
                      </span>
                    )}
                    {cveData.isAuth && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-status-high text-status-high-foreground">
                        Auth
                      </span>
                    )}
                    {cveData.isTemplate && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-status-low text-status-low-foreground">
                        Template
                      </span>
                    )}
                    {!cveData.isExploitSeen &&
                      !cveData.isRemote &&
                      !cveData.isAuth &&
                      !cveData.isTemplate && (
                        <span className="text-xs text-muted-foreground">
                          None
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {cveData.vector && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Attack Vector (CVSS)
                  </h4>
                  <p className="text-sm text-foreground font-mono">
                    {cveData.vector}
                  </p>
                </div>
              )}

              {/* Weaknesses */}
              {cveData.weaknesses.length > 0 && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Weaknesses (CWE)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cveData.weaknesses.map((weakness, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-status-medium text-status-medium-foreground"
                      >
                        {weakness}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* PoC URLs */}
              {cveData.pocUrls.length > 0 && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Proof of Concept (PoC)
                  </h4>
                  <ul className="space-y-2">
                    {cveData.pocUrls.map((poc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-status-critical mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <a
                          href={poc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:text-primary/80 hover:underline break-all font-medium transition-colors"
                        >
                          {poc}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* References */}
              {cveData.references.length > 0 && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    References
                  </h4>
                  <ul className="space-y-2">
                    {cveData.references.slice(0, 5).map((ref, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-primary mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:text-primary/80 hover:underline break-all font-medium transition-colors"
                        >
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nuclei Template URL */}
              {cveData.isTemplate && cveData.uri && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Nuclei Template
                  </h4>
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-status-low mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                    <a
                      href={`https://github.com/projectdiscovery/nuclei-templates/blob/main/${cveData.uri}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 hover:underline break-all font-medium transition-colors"
                    >
                      {`https://github.com/projectdiscovery/nuclei-templates/blob/main/${cveData.uri}`}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
