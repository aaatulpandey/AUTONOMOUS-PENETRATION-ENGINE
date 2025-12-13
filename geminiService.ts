import { GoogleGenAI, Type, Chat } from "@google/genai";
import { FullScanResult, ScanConfig } from "../types";

const OMEGA_SYSTEM_PROMPT = `
You are OMEGA WEB HUNTER — an autonomous, AI-powered full replacement for BurpSuite Professional.
You automate the entire workflow of a manual penetration tester.

YOUR CAPABILITIES (AUTOMATED):
1. PROXY/LOGGER: You capture and analyze all traffic.
2. SCANNER: You perform deep active scanning.
3. INTRUDER: You automatically fuzz parameters.
4. REPEATER: You automatically replay requests with modified payloads.
5. SEQUENCER: You analyze token entropy.

Perform a simulated security assessment based on the user's provided target URL.
Even if you cannot physically access the URL, generate a REALISTIC, HYPOTHETICAL assessment.

OUTPUT REQUIREMENT:
You must return a JSON object with:
1. "dashboard": structured stats, tech stack, sitemap, vulnerabilities, AND a "traffic_log" simulating the HTTP history of the scan.
2. "markdown_report": A comprehensive text report.

For the 'traffic_log', generate 10-15 realistic HTTP entries showing what you "scanned". Include a mix of:
- 200 OK (Recon)
- 404 Not Found (Fuzzing)
- 500 Internal Server Error (Fuzzing/Exploits)
- 403 Forbidden
- 302 Redirects
`;

const dashboardSchema = {
  type: Type.OBJECT,
  properties: {
    dashboard: {
      type: Type.OBJECT,
      properties: {
        overview: {
          type: Type.OBJECT,
          properties: {
            total_endpoints: { type: Type.STRING },
            total_parameters: { type: Type.STRING },
            critical: { type: Type.STRING },
            high: { type: Type.STRING },
            medium: { type: Type.STRING },
            low: { type: Type.STRING },
          },
          required: ["total_endpoints", "total_parameters", "critical", "high", "medium", "low"],
        },
        tech_stack: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        sitemap: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        vulnerabilities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low", "Info"] },
              cvss: { type: Type.STRING },
              endpoint: { type: Type.STRING },
              parameter: { type: Type.STRING },
              impact: { type: Type.STRING },
              poc: { type: Type.STRING },
              root_cause: { type: Type.STRING },
              remediation: { type: Type.STRING },
            },
            required: ["name", "severity", "cvss", "endpoint", "impact", "remediation"],
          },
        },
        traffic_log: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              time: { type: Type.STRING },
              method: { type: Type.STRING },
              url: { type: Type.STRING },
              status: { type: Type.NUMBER },
              length: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["Recon", "Fuzz", "Exploit", "Passive"] },
            }
          }
        },
        graphs: {
          type: Type.OBJECT,
          properties: {
            severity_distribution: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                },
                required: ["name", "value"],
              },
            },
            attack_chain: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            endpoint_risk_map: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  endpoint: { type: Type.STRING },
                  risk: { type: Type.NUMBER },
                },
              },
            },
          },
          required: ["severity_distribution"],
        },
      },
      required: ["overview", "tech_stack", "vulnerabilities", "graphs", "traffic_log"],
    },
    markdown_report: { type: Type.STRING },
  },
  required: ["dashboard", "markdown_report"],
};

const getPlatformSpecificInstruction = (platform: string) => {
  switch (platform) {
    case 'hackerone':
      return `CRITICAL: You are acting as a professional bug bounty hunter writing a real HackerOne submission.
      Generate the 'markdown_report' field using the following STRICT template.
      DO NOT use generic scanner language. Write as a human researcher.
      --- START OF TEMPLATE ---
      # [Vulnerability Name] on [Scope]
      **Target Program:** (Infer Company Name from URL) + HackerOne Program
      **Vulnerability Type:** [Exact vulnerability name – e.g. IDOR / Stored XSS / SSRF]
      **Scope:** [Exact in-scope domain or endpoint]
      ## Title
      (Short, clear, impact-focused title)
      ## Summary
      (Explain the issue in 3–4 lines in plain English.)
      ## Affected Endpoint / Feature
      (List exact URL(s), endpoint(s), HTTP method(s))
      ## Preconditions
      (Mention required account level)
      ## Steps to Reproduce
      (Write numbered, step-by-step instructions)
      1. ...
      2. ...
      ## Proof of Concept
      (Provide raw HTTP request(s) and response(s).)
      ## Impact
      (Explain real-world impact clearly.)
      ## Why this is a Security Issue
      (Briefly explain which security control is missing or broken.)
      ## Suggested Fix (Optional)
      (High-level remediation)
      --- END OF TEMPLATE ---
      TONE RULES: Professional, Honest, No CVSS score in text, No automated scanner language.`;
    
    case 'bugcrowd':
      return `CRITICAL: Format 'markdown_report' for BUGCROWD (VRT Style).`;
    case 'synack':
      return `CRITICAL: Format 'markdown_report' for SYNACK RED TEAM (SRT).`;
    case 'intigriti':
      return `CRITICAL: Format 'markdown_report' for INTIGRITI.`;
    default:
      return "Format the report for a standard professional security audit.";
  }
};

export const runOmegaScan = async (config: ScanConfig): Promise<FullScanResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const platformInstruction = getPlatformSpecificInstruction(config.submissionPlatform || 'generic');

  const userPrompt = JSON.stringify({
    target_url: config.targetUrl,
    auth: config.auth,
    cookies: config.cookies,
    mode: config.mode,
    submission_platform: config.submissionPlatform,
    instruction: `BEGIN EXECUTION NOW. Generate realistic findings and TRAFFIC LOGS for this target. ${platformInstruction}`
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: OMEGA_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: dashboardSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text) as FullScanResult;
    return parsed;
  } catch (error) {
    console.error("Omega Scan Error:", error);
    throw error;
  }
};

export const createReportChat = (result: FullScanResult): Chat => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `
    You are OMEGA TACTICAL ADVISOR. 
    You are an expert offensive security engineer assisting a user with a specific vulnerability scan report.
    SCAN CONTEXT:
    - Tech Stack: ${result.dashboard.tech_stack.join(', ')}
    - Total Endpoints: ${result.dashboard.overview.total_endpoints}
    - Critical Issues: ${result.dashboard.overview.critical}
    FINDINGS:
    ${JSON.stringify(result.dashboard.vulnerabilities.map(v => ({ name: v.name, severity: v.severity, endpoint: v.endpoint })))}
    The user is looking at this report right now.
    Answer questions about how to exploit these findings or how to fix them.
  `;
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction: systemInstruction }
  });
};
