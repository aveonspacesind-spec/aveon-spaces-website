"use client";

import React, { useState } from "react";
import { 
  Server, 
  Mail, 
  Upload, 
  Database, 
  Globe, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  HardDrive
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

type EndpointStatus = "idle" | "loading" | "success" | "error";

interface EndpointItem {
  id: string;
  name: string;
  category: "Internal Route" | "External Service" | "Database" | "CDN / Store";
  method: string;
  target: string;
  description: string;
  icon: any;
  status: EndpointStatus;
  latency?: number;
  statusCode?: number;
  responseMessage?: string;
  errorMessage?: string;
  lastTested?: string;
}

const INITIAL_ENDPOINTS: EndpointItem[] = [
  {
    id: "firestore",
    name: "Firebase Firestore Database",
    category: "Database",
    method: "SDK QUERY",
    target: "Google Cloud Firestore",
    description: "Queries the Firestore database to verify live read permissions and database connectivity.",
    icon: Database,
    status: "idle",
  },
  {
    id: "send-email-route",
    name: "Email Dispatch Route",
    category: "Internal Route",
    method: "GET",
    target: "/api/send-email",
    description: "Tests the server-side email dispatch handler and checks if RESEND_API_KEY is present.",
    icon: Mail,
    status: "idle",
  },
  {
    id: "resend-api",
    name: "Resend Email Service API",
    category: "External Service",
    method: "PROBE",
    target: "api.resend.com",
    description: "Sends an authenticated probe directly to Resend servers to verify that your API key is valid.",
    icon: Mail,
    status: "idle",
  },
  {
    id: "upload-route",
    name: "Cloudflare R2 Upload Route",
    category: "Internal Route",
    method: "GET",
    target: "/api/upload",
    description: "Tests the image upload route and verifies Cloudflare R2 bucket credentials on the server.",
    icon: Upload,
    status: "idle",
  },
  {
    id: "r2-storage",
    name: "Cloudflare R2 Bucket & S3 API",
    category: "External Service",
    method: "S3 API PROBE",
    target: "r2.cloudflarestorage.com",
    description: "Tests live bucket connectivity, credentials, and read access via Cloudflare R2 S3 API.",
    icon: HardDrive,
    status: "idle",
  },
  {
    id: "r2-public",
    name: "Cloudflare R2 Public CDN",
    category: "CDN / Store",
    method: "PROBE",
    target: "R2 Public URL",
    description: "Checks if the public Cloudflare R2 CDN where product images & brochures are served is reachable.",
    icon: Server,
    status: "idle",
  },
  {
    id: "frontend-site",
    name: "Customer Storefront",
    category: "CDN / Store",
    method: "PING",
    target: "Customer Store Website",
    description: "Pings the website domain to ensure the public store is online and reachable.",
    icon: Globe,
    status: "idle",
  },
];

export default function SystemUtilitiesPage() {
  const [endpoints, setEndpoints] = useState<EndpointItem[]>(INITIAL_ENDPOINTS);
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Update a single endpoint's state
  const updateEndpoint = (id: string, updates: Partial<EndpointItem>) => {
    setEndpoints((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Run a single endpoint test
  const testEndpoint = async (id: string) => {
    updateEndpoint(id, {
      status: "loading",
      errorMessage: undefined,
      responseMessage: undefined,
      latency: undefined,
    });

    const startTime = performance.now();
    const timestamp = new Date().toLocaleTimeString();

    try {
      if (id === "firestore") {
        // Test Firestore
        const q = query(collection(db, "products"), limit(1));
        const snap = await getDocs(q);
        const latency = Math.round(performance.now() - startTime);

        updateEndpoint(id, {
          status: "success",
          statusCode: 200,
          latency,
          responseMessage: `Firestore query successful (${snap.size} sample document read). Database is operational.`,
          lastTested: timestamp,
        });
      } else if (id === "send-email-route") {
        // Test /api/send-email
        const res = await fetch("/api/send-email");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateEndpoint(id, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `HTTP ${res.status}: Failed to reach email route.`,
            lastTested: timestamp,
          });
        } else {
          updateEndpoint(id, {
            status: "success",
            statusCode: res.status,
            latency,
            responseMessage: data.message || "Endpoint is working (HTTP 200 OK).",
            lastTested: timestamp,
          });
        }
      } else if (id === "upload-route") {
        // Test /api/upload
        const res = await fetch("/api/upload");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateEndpoint(id, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `HTTP ${res.status}: Upload route check failed.`,
            lastTested: timestamp,
          });
        } else {
          updateEndpoint(id, {
            status: "success",
            statusCode: res.status,
            latency,
            responseMessage: data.message || "Endpoint is working (HTTP 200 OK).",
            lastTested: timestamp,
          });
        }
      } else if (id === "resend-api") {
        // Test Resend via health route
        const res = await fetch("/api/health?test=resend");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateEndpoint(id, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `Resend test returned HTTP ${res.status}. Check RESEND_API_KEY.`,
            lastTested: timestamp,
          });
        } else {
          updateEndpoint(id, {
            status: "success",
            statusCode: 200,
            latency: data.latency || latency,
            responseMessage: data.message || "Resend API key is valid and servers responded successfully.",
            lastTested: timestamp,
          });
        }
      } else if (id === "r2-storage") {
        // Test Cloudflare R2 bucket connection
        const res = await fetch("/api/health?test=r2-storage");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateEndpoint(id, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `R2 storage test returned HTTP ${res.status}. Check R2 credentials.`,
            lastTested: timestamp,
          });
        } else {
          updateEndpoint(id, {
            status: "success",
            statusCode: 200,
            latency: data.latency || latency,
            responseMessage: data.message || "Cloudflare R2 bucket is connected and operational.",
            lastTested: timestamp,
          });
        }
      } else if (id === "r2-public") {
        // Test Cloudflare R2 Public CDN
        const res = await fetch("/api/health?test=r2-public");
        const latency = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.success === false) {
          updateEndpoint(id, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: data.error || `R2 public CDN test failed. Check CLOUDFLARE_R2_PUBLIC_URL.`,
            lastTested: timestamp,
          });
        } else {
          updateEndpoint(id, {
            status: "success",
            statusCode: 200,
            latency: data.latency || latency,
            responseMessage: data.message || "Cloudflare R2 CDN is reachable and responsive.",
            lastTested: timestamp,
          });
        }
      } else if (id === "frontend-site") {
        // Test Storefront
        const targetUrl = typeof window !== "undefined" ? window.location.origin : "/";
        const res = await fetch(targetUrl, { method: "HEAD" });
        const latency = Math.round(performance.now() - startTime);

        if (!res.ok) {
          updateEndpoint(id, {
            status: "error",
            statusCode: res.status,
            latency,
            errorMessage: `Storefront returned HTTP ${res.status}.`,
            lastTested: timestamp,
          });
        } else {
          updateEndpoint(id, {
            status: "success",
            statusCode: res.status,
            latency,
            responseMessage: `Storefront is online (HTTP ${res.status} OK).`,
            lastTested: timestamp,
          });
        }
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime);
      updateEndpoint(id, {
        status: "error",
        latency,
        errorMessage: err.message || "Network request failed. Service unreachable.",
        lastTested: timestamp,
      });
    }
  };

  // Test all endpoints sequentially
  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    for (const item of endpoints) {
      await testEndpoint(item.id);
    }
    setIsTestingAll(false);
  };

  const totalWorking = endpoints.filter((e) => e.status === "success").length;
  const totalFailed = endpoints.filter((e) => e.status === "error").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">API Health & System Utilities</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Send real-time test requests to each API endpoint. If an endpoint is working, it will show as operational; if not, it will display the error.
          </p>
        </div>
        <div>
          <button
            onClick={testAllEndpoints}
            disabled={isTestingAll}
            className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isTestingAll ? "animate-spin" : ""}`} />
            {isTestingAll ? "Testing all endpoints..." : "Test All Endpoints"}
          </button>
        </div>
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-medium">Total Endpoints</div>
            <div className="text-2xl font-bold text-white mt-0.5">{endpoints.length}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-medium">Working & Active</div>
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

      {/* Endpoints List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Configured Services and Endpoints</h2>

        <div className="space-y-3">
          {endpoints.map((ep) => {
            const isBusy = ep.status === "loading";
            const isOk = ep.status === "success";
            const isErr = ep.status === "error";

            return (
              <div
                key={ep.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/15 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Endpoint Details */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 shrink-0 mt-0.5">
                      <ep.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base font-semibold text-white">{ep.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono font-medium">
                          {ep.method}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-neutral-400">
                          {ep.target}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 max-w-2xl">{ep.description}</p>
                    </div>
                  </div>

                  {/* Actions & Status Pill */}
                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    {/* Status Display */}
                    {isOk && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Working ({ep.latency}ms)
                      </span>
                    )}

                    {isErr && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Failed {ep.statusCode ? `(${ep.statusCode})` : ""}
                      </span>
                    )}

                    {isBusy && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Testing...
                      </span>
                    )}

                    {ep.status === "idle" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400">
                        <Clock className="w-3.5 h-3.5" />
                        Not tested
                      </span>
                    )}

                    {/* Test Button */}
                    <button
                      onClick={() => testEndpoint(ep.id)}
                      disabled={isBusy || isTestingAll}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors border border-white/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Test Endpoint
                    </button>
                  </div>
                </div>

                {/* Response / Error Detail Box */}
                {(ep.responseMessage || ep.errorMessage) && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs font-mono leading-relaxed ${
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
                        <span className="font-bold">{isOk ? "Success: " : "Error: "}</span>
                        {isOk ? ep.responseMessage : ep.errorMessage}
                        {ep.lastTested && (
                          <span className="block text-[11px] text-neutral-400 mt-1 font-sans">
                            Checked at {ep.lastTested} (Latency: {ep.latency}ms)
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
    </div>
  );
}
