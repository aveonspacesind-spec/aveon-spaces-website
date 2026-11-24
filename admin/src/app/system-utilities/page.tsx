"use client";

import React, { useState } from "react";
import { 
  Database, 
  HardDrive, 
  Mail, 
  Globe, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Upload,
  ArrowRight,
  Server
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, query, setDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

type TestStatus = "idle" | "loading" | "success" | "error";

interface EndpointTest {
  id: string;
  name: string;
  operationType: "Read Operation" | "Write Operation" | "Route Verification" | "Auth & Handshake" | "CDN Delivery";
  endpoint: string;
  description: string;
  status: TestStatus;
  latency?: number;
  statusCode?: number;
  responseMessage?: string;
  errorMessage?: string;
  lastTested?: string;
}

interface CategoryGroup {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  badgeBg: string;
  tests: EndpointTest[];
}

const INITIAL_CATEGORIES: CategoryGroup[] = [
  {
    id: "database",
    title: "1. Cloud Firestore Database",
    description: "Database queries, read permissions, document write permissions, and real-time connectivity.",
    icon: Database,
    color: "text-amber-400",
    badgeBg: "bg-amber-400/10",
    tests: [
      {
        id: "firestore-read",
        name: "Database Read Query",
        operationType: "Read Operation",
        endpoint: "Firestore /products",
        description: "Executes a live query to fetch documents from the Firestore products collection.",
        status: "idle",
      },
      {
        id: "firestore-write",
        name: "Database Write & Delete Probe",
        operationType: "Write Operation",
        endpoint: "Firestore /health_checks",
        description: "Creates a temporary test document and immediately deletes it to verify full write and delete permissions.",
        status: "idle",
      },
    ],
  },
  {
    id: "storage",
    title: "2. Cloudflare R2 Media Storage",
    description: "Asset storage, image uploads, S3-compatible bucket read/write, and public CDN asset delivery.",
    icon: HardDrive,
    color: "text-blue-400",
    badgeBg: "bg-blue-400/10",
    tests: [
      {
        id: "r2-route",
        name: "Internal Upload Route",
        operationType: "Route Verification",
        endpoint: "GET /api/upload",
        description: "Tests the server-side image upload handler and verifies R2 environment credentials on the server.",
        status: "idle",
      },
      {
        id: "r2-read",
        name: "S3 Bucket Read & List",
        operationType: "Read Operation",
        endpoint: "S3 ListObjectsV2",
        description: "Connects to Cloudflare R2 via S3 API and lists bucket keys to verify read access.",
        status: "idle",
      },
      {
        id: "r2-write",
        name: "S3 Bucket Write & Delete",
        operationType: "Write Operation",
        endpoint: "S3 PutObject + DeleteObject",
        description: "Uploads a temporary 1-byte health check probe file and deletes it to verify upload permissions.",
        status: "idle",
      },
      {
        id: "r2-public",
        name: "Public CDN Asset Delivery",
        operationType: "CDN Delivery",
        endpoint: "HEAD CLOUDFLARE_R2_PUBLIC_URL",
        description: "Pings the public Cloudflare R2 domain to verify product photos and brochures can be downloaded.",
        status: "idle",
      },
    ],
  },
  {
    id: "email",
    title: "3. Email Notification Service",
    description: "Order confirmation emails, customer inquiry notifications, and Resend server authentication.",
    icon: Mail,
    color: "text-purple-400",
    badgeBg: "bg-purple-400/10",
    tests: [
      {
        id: "email-route",
        name: "Internal Email Dispatch Route",
        operationType: "Route Verification",
        endpoint: "GET /api/send-email",
        description: "Checks if the server-side email dispatch handler is active and loaded with RESEND_API_KEY.",
        status: "idle",
      },
      {
        id: "resend-auth",
        name: "Resend API Authentication & Sending Scope",
        operationType: "Auth & Handshake",
        endpoint: "api.resend.com/api-keys",
        description: "Authenticates directly with Resend servers to verify that the API key is valid and has active sending permissions.",
        status: "idle",
      },
    ],
  },
  {
    id: "frontend",
    title: "4. Storefront & Public Web",
    description: "Customer-facing store availability and web server responsiveness.",
    icon: Globe,
    color: "text-emerald-400",
    badgeBg: "bg-emerald-400/10",
    tests: [
      {
        id: "storefront-ping",
        name: "Customer Storefront Ping",
        operationType: "Route Verification",
        endpoint: "Customer Store Domain",
        description: "Pings the public website to verify that the customer storefront is online and returning HTTP 200.",
        status: "idle",
      },
    ],
  },
];

export default function SystemUtilitiesPage() {
  const [categories, setCategories] = useState<CategoryGroup[]>(INITIAL_CATEGORIES);
  const [runningTests, setRunningTests] = useState<Record<string, boolean>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Update specific test status
  const updateTestState = (testId: string, updates: Partial<EndpointTest>) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        tests: cat.tests.map((t) => (t.id === testId ? { ...t, ...updates } : t)),
      }))
    );
  };

  // Run a single test
  const runTest = async (testId: string) => {
    setRunningTests((prev) => ({ ...prev, [testId]: true }));
    updateTestState(testId, {
      status: "loading",
      errorMessage: undefined,
      responseMessage: undefined,
      latency: undefined,
    });

    const startTime = performance.now();
    const timestamp = new Date().toLocaleTimeString();

    try {
      // 1. Database Read
      if (testId === "firestore-read") {
        const q = query(collection(db, "products"), limit(1));
        const snap = await getDocs(q);
        const latency = Math.round(performance.now() - startTime);

        updateTestState(testId, {
          status: "success",
          statusCode: 200,
          latency,
          responseMessage: `Read query successful. Fetched sample document. Latency: ${latency}ms.`,
          lastTested: timestamp,
        });
      }

      // 2. Database Write & Delete
      else if (testId === "firestore-write") {
        const testDocRef = doc(db, "health_checks", `probe-${Date.now()}`);
        await setDoc(testDocRef, { timestamp: serverTimestamp(), probe: true });
        await deleteDoc(testDocRef);
        const latency = Math.round(performance.now() - startTime);

        updateTestState(testId, {
          status: "success",
          statusCode: 200,
          latency,
          responseMessage: `Write & Delete operations confirmed. Test document created and purged. Latency: ${latency}ms.`,
          lastTested: timestamp,
        });
      }

      // 3. R2 Upload Route
      else if (testId === "r2-route") {
        const res = await fetch("/api/upload");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateTestState(testId, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `HTTP ${res.status}: Upload route check failed.`,
            lastTested: timestamp,
          });
        } else {
          updateTestState(testId, {
            status: "success",
            statusCode: res.status,
            latency,
            responseMessage: data.message || "Upload route is online and configured.",
            lastTested: timestamp,
          });
        }
      }

      // 4. R2 S3 Read
      else if (testId === "r2-read") {
        const res = await fetch("/api/health?test=r2-read");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateTestState(testId, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `R2 read test failed with status ${res.status}.`,
            lastTested: timestamp,
          });
        } else {
          updateTestState(testId, {
            status: "success",
            statusCode: 200,
            latency: data.latency || latency,
            responseMessage: data.message || "R2 S3 read access confirmed.",
            lastTested: timestamp,
          });
        }
      }

      // 5. R2 S3 Write
      else if (testId === "r2-write") {
        const res = await fetch("/api/health?test=r2-write");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateTestState(testId, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `R2 write operation failed with status ${res.status}.`,
            lastTested: timestamp,
          });
        } else {
          updateTestState(testId, {
            status: "success",
            statusCode: 200,
            latency: data.latency || latency,
            responseMessage: data.message || "R2 write and delete verified successfully.",
            lastTested: timestamp,
          });
        }
      }

      // 6. R2 Public CDN
      else if (testId === "r2-public") {
        const res = await fetch("/api/health?test=r2-public");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateTestState(testId, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `R2 public CDN is unreachable.`,
            lastTested: timestamp,
          });
        } else {
          updateTestState(testId, {
            status: "success",
            statusCode: 200,
            latency: data.latency || latency,
            responseMessage: data.message || "Cloudflare R2 CDN is reachable.",
            lastTested: timestamp,
          });
        }
      }

      // 7. Email Route
      else if (testId === "email-route") {
        const res = await fetch("/api/send-email");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateTestState(testId, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `HTTP ${res.status}: Email route error.`,
            lastTested: timestamp,
          });
        } else {
          updateTestState(testId, {
            status: "success",
            statusCode: res.status,
            latency,
            responseMessage: data.message || "Email route is online and configured.",
            lastTested: timestamp,
          });
        }
      }

      // 8. Resend Auth
      else if (testId === "resend-auth") {
        const res = await fetch("/api/health?test=resend");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateTestState(testId, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `Resend probe failed with status ${res.status}.`,
            lastTested: timestamp,
          });
        } else {
          updateTestState(testId, {
            status: "success",
            statusCode: 200,
            latency: data.latency || latency,
            responseMessage: data.message || "Resend API key is verified and authenticated.",
            lastTested: timestamp,
          });
        }
      }

      // 9. Storefront Ping
      else if (testId === "storefront-ping") {
        const targetUrl = typeof window !== "undefined" ? window.location.origin : "/";
        const res = await fetch(targetUrl, { method: "HEAD" });
        const latency = Math.round(performance.now() - startTime);

        if (!res.ok) {
          updateTestState(testId, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: `Storefront returned HTTP ${res.status}.`,
            lastTested: timestamp,
          });
        } else {
          updateTestState(testId, {
            status: "success",
            statusCode: res.status,
            latency,
            responseMessage: `Storefront is responding (HTTP ${res.status} OK). Latency: ${latency}ms.`,
            lastTested: timestamp,
          });
        }
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime);
      updateTestState(testId, {
        status: "error",
        latency,
        errorMessage: err.message || "Network request failed. Service unreachable.",
        lastTested: timestamp,
      });
    } finally {
      setRunningTests((prev) => ({ ...prev, [testId]: false }));
    }
  };

  // Run all tests within one category
  const testCategory = async (cat: CategoryGroup) => {
    for (const test of cat.tests) {
      await runTest(test.id);
    }
  };

  // Run all tests across all categories
  const testAll = async () => {
    setIsTestingAll(true);
    for (const cat of categories) {
      for (const test of cat.tests) {
        await runTest(test.id);
      }
    }
    setIsTestingAll(false);
  };

  const allTests = categories.flatMap((c) => c.tests);
  const totalWorking = allTests.filter((t) => t.status === "success").length;
  const totalFailed = allTests.filter((t) => t.status === "error").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">API Health & System Diagnostics</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Categorized end-to-end connectivity tests. Check read & write operations individually for each service.
          </p>
        </div>
        <div>
          <button
            onClick={testAll}
            disabled={isTestingAll}
            className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isTestingAll ? "animate-spin" : ""}`} />
            {isTestingAll ? "Running Full Diagnostic..." : "Run Full Diagnostic"}
          </button>
        </div>
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-medium">Total Endpoints Tested</div>
            <div className="text-2xl font-bold text-white mt-0.5">{allTests.length} Operations</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-medium">Operational & Active</div>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">{totalWorking}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-medium">Errors Detected</div>
            <div className="text-2xl font-bold text-red-400 mt-0.5">{totalFailed}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryWorking = category.tests.filter((t) => t.status === "success").length;
          const categoryErrors = category.tests.filter((t) => t.status === "error").length;

          return (
            <div
              key={category.id}
              className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden"
            >
              {/* Category Header */}
              <div className="p-5 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${category.badgeBg} ${category.color} flex items-center justify-center shrink-0`}>
                    <category.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{category.title}</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">{category.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs text-neutral-400 font-medium">
                    {categoryWorking}/{category.tests.length} working
                  </span>
                  <button
                    onClick={() => testCategory(category)}
                    disabled={isTestingAll}
                    className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors border border-white/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Test Category
                  </button>
                </div>
              </div>

              {/* Sub-Endpoints / Operations List */}
              <div className="p-5 space-y-3">
                {category.tests.map((test) => {
                  const isBusy = runningTests[test.id] || false;
                  const isOk = test.status === "success";
                  const isErr = test.status === "error";

                  return (
                    <div
                      key={test.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-sm font-semibold text-white">{test.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                              {test.endpoint}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-neutral-400 font-medium">
                              {test.operationType}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400">{test.description}</p>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                          {/* Status Pill */}
                          {isOk && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Working ({test.latency}ms)
                            </span>
                          )}

                          {isErr && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                              <XCircle className="w-3.5 h-3.5" />
                              Failed {test.statusCode ? `(${test.statusCode})` : ""}
                            </span>
                          )}

                          {isBusy && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Running test...
                            </span>
                          )}

                          {test.status === "idle" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400">
                              <Clock className="w-3.5 h-3.5" />
                              Not tested
                            </span>
                          )}

                          {/* Individual Test Button */}
                          <button
                            onClick={() => runTest(test.id)}
                            disabled={isBusy || isTestingAll}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors border border-white/10 flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Test
                          </button>
                        </div>
                      </div>

                      {/* Result Box */}
                      {(test.responseMessage || test.errorMessage) && (
                        <div
                          className={`p-3 rounded-lg border text-xs font-mono leading-relaxed ${
                            isOk
                              ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                              : "bg-red-950/20 border-red-500/20 text-red-300"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {isOk ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 overflow-x-auto">
                              <span className="font-bold">{isOk ? "Result: " : "Error: "}</span>
                              {isOk ? test.responseMessage : test.errorMessage}
                              {test.lastTested && (
                                <span className="block text-[11px] text-neutral-400 mt-1 font-sans">
                                  Tested at {test.lastTested}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
