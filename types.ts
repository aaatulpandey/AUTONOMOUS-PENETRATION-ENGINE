export interface Vulnerability {
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  cvss: string;
  endpoint: string;
  parameter: string;
  impact: string;
  poc: string;
  root_cause: string;
  remediation: string;
}

export interface OverviewStats {
  total_endpoints: string;
  total_parameters: string;
  critical: string;
  high: string;
  medium: string;
  low: string;
}

export interface TrafficLogEntry {
  id: string;
  time: string;
  method: string;
  url: string;
  status: number;
  length: string;
  type: 'Recon' | 'Fuzz' | 'Exploit' | 'Passive';
}

export interface DashboardData {
  overview: OverviewStats;
  tech_stack: string[];
  sitemap: string[];
  vulnerabilities: Vulnerability[];
  traffic_log: TrafficLogEntry[];
  graphs: {
    severity_distribution: { name: string; value: number }[];
    attack_chain: { step: string; description: string }[];
    endpoint_risk_map: { endpoint: string; risk: number }[];
  };
}

export interface FullScanResult {
  dashboard: DashboardData;
  markdown_report: string;
}

export type SubmissionPlatform = 'generic' | 'hackerone' | 'bugcrowd' | 'synack' | 'intigriti';

export interface ScanConfig {
  targetUrl: string;
  auth: string;
  cookies: string;
  mode: 'safe' | 'validate';
  submissionPlatform: SubmissionPlatform;
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  targetUrl: string;
  mode: 'safe' | 'validate';
  platform: SubmissionPlatform;
  stats: OverviewStats;
  result: FullScanResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}