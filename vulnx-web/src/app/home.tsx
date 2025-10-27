"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Filter, Info, Search, Settings, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { columns } from '../components/cve-columns';
import { DataTable } from '../components/data-table';
import { CVERecord } from '../models/CVERecord';

export default function MainPage() {
  const [results, setResults] = useState<CVERecord[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showApiBanner, setShowApiBanner] = useState(false);
  const [apiKeyConnected, setApiKeyConnected] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  useEffect(() => {
    // Check localStorage for API key on mount
    const storedKey = localStorage.getItem('vulnxApiKey');
    const bannerDismissed = localStorage.getItem('vulnxBannerDismissed');

    if (storedKey) {
      setApiKey(storedKey);
      setApiKeyConnected(true);
    } else if (!bannerDismissed) {
      setShowApiBanner(true);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      let searchQuery = `(${query})`;

      const encodedQuery = encodeURIComponent(searchQuery);
      const apiUrl = `https://api.projectdiscovery.io/v2/vulnerability/search?q=${encodedQuery}`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      }

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Invalid or missing API key. Please check your API configuration in Settings.");
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (response.status >= 500) {
          throw new Error("Server error. The API service is temporarily unavailable. Please try again later.");
        } else {
          throw new Error(`Search failed (${response.status}). Please try again or contact support.`);
        }
      }

      const data = await response.json();

      //! remove me
      console.log('API Response:', data);

      if (data && typeof data === 'object' && Array.isArray(data.results)) {
        const cveRecords = data.results.map((item: any) => new CVERecord(item));
        setResults(cveRecords);

        if (cveRecords.length === 0) {
          throw new Error("No results found.");
        }
      } else {
        throw new Error("Invalid response format from API.");
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('vulnxApiKey', apiKey);
      setApiKeyConnected(true);
      setShowApiBanner(false);
      setApiKeySaved(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setApiKeySaved(false);
      }, 3000);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section flex items-center gap-3">
              <h1 className="logo text-3xl font-bold">Vulnx</h1>
              <Badge variant="secondary" className="text-xs">Web</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        <div className="container">
          <Tabs defaultValue="explore" className="w-full">
            <TabsList className="inline-flex mb-6">
              <TabsTrigger value="explore" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Explore Tab */}
            <TabsContent value="explore" className="space-y-6">
              {/* API Key Warning Banner */}
              {showApiBanner && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100">API Key Required</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Please configure your API key to access vulnerability data.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowApiBanner(false);
                            // Switch to settings tab
                            const settingsTab = document.querySelector('[value="settings"]') as HTMLButtonElement;
                            if (settingsTab) settingsTab.click();
                          }}
                        >
                          Set up now
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowApiBanner(false);
                            localStorage.setItem('vulnxBannerDismissed', 'true');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Search Section */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="searchInput"
                          type="text"
                          placeholder="Search by product, vendor, CVE ID, or keywords..."
                          className="pl-10"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <Filter className="h-4 w-4" />
                          Filters
                        </Button>
                        
                        <Button
                          onClick={handleSearch}
                          disabled={loading || !query.trim()}
                          className="min-w-[100px]"
                        >
                          <Search className="h-4 w-4" />
                          {loading ? 'Searching...' : 'Search'}
                        </Button>
                      </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                      <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader>
                          <CardTitle className="text-base">Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                              Critical Severity
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                              High Severity
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                              Recent (30 days)
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Results Table */}
              <div className="table-container">
                {loading && (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Loading results...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {error && !loading && (
                  <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">Error: {error}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {!loading && !error && results.length === 0 && (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Search className="h-8 w-8 text-slate-400" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          No results found. Try searching for a vulnerability.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {!loading && !error && results.length > 0 && (
                  <DataTable
                    columns={columns}
                    data={results}
                    renderSubComponent={({ row }) => {
                  const result = row.original as CVERecord;
                  return (
                    <div className="space-y-4">
                      {/* Description */}
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {result.description}
                        </p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.vendor && (
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Vendor</h4>
                            <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">{result.vendor}</p>
                          </div>
                        )}
                        {result.product && (
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Product</h4>
                            <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">{result.product}</p>
                          </div>
                        )}
                        {result.vector && (
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 md:col-span-2">
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Attack Vector (CVSS)</h4>
                            <p className="text-sm text-slate-900 dark:text-slate-100 font-mono">{result.vector}</p>
                          </div>
                        )}
                      </div>

                      {/* Weaknesses */}
                      {result.weaknesses.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Weaknesses (CWE)</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.weaknesses.map((weakness, idx) => (
                              <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                {weakness}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* References */}
                      {result.references.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">References</h4>
                          <ul className="space-y-2">
                            {result.references.slice(0, 5).map((ref, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <a 
                                  href={ref} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                                >
                                  {ref}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            )}
              </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-4">
                    <div className="space-y-1.5">
                      <CardTitle className="text-xl">API Configuration</CardTitle>
                      <CardDescription className="text-sm">
                        Connect your ProjectDiscovery API to access vulnerability data
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-3">
                      <label htmlFor="apiKeyInput" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        API Key
                      </label>
                      <Input
                        id="apiKeyInput"
                        type="password"
                        placeholder="pd_xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Get your API key from{' '}
                        <a 
                          href="https://cloud.projectdiscovery.io" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          ProjectDiscovery Cloud
                        </a>
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                          Your data is secure
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          Your API key is stored locally in your browser and is never transmitted to our servers. All API requests are made directly to ProjectDiscovery.
                        </p>
                      </div>
                    </div>
                    
                    {apiKeySaved && (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                          API key saved successfully!
                        </p>
                      </div>
                    )}
                    
                    <Button onClick={handleApiKeySave} className="w-full">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save Configuration
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2025 Vulnx Web by Benjamin. All rights reserved.</p>
          <p className="footer-links">
            Powered by <a href="https://github.com/projectdiscovery/cvemap" target="_blank" rel="noopener noreferrer">ProjectDiscovery Vulnerability API</a>
            {' • '}
            <a href="https://github.com/benjaminjost/vulnx-web" target="_blank" rel="noopener noreferrer">View Source on GitHub</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
