"use client";

import { CVEDetails } from "@/components/cve-details";
import { CVEHeader } from "@/components/cve-header";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
            <div className="space-y-6">
              {/* CVE Header Skeleton */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Title and subtitle */}
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-64" />
                      <Skeleton className="h-7 w-96" />
                    </div>
                    {/* CVSS Score and badges */}
                    <div className="flex flex-wrap gap-4 items-center">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CVE Details Skeleton */}
              <div className="space-y-4">
                {/* Published & Updated dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>

                {/* Description */}
                <div className="bg-card rounded-lg p-4 border border-border space-y-2">
                  <Skeleton className="h-5 w-28 mb-3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Additional sections */}
                <div className="bg-card rounded-lg p-4 border border-border space-y-2">
                  <Skeleton className="h-5 w-32 mb-3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
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
              <CVEHeader cve={cveData} />

              {/* CVE Details */}
              <CVEDetails cve={cveData} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
