import React, { useState } from 'react';
import { DashboardData, Vulnerability, TrafficLogEntry } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { VulnerabilityModal } from './VulnerabilityModal';

interface DashboardProps {
  data: DashboardData;
  onViewReport: () => void;
  onDownloadReport: () => void;
  onDownloadPDF: () => void;
}

const SEVERITY_COLORS = {
  Critical: '#ff3333',
  High: '#ff9900',
  Medium: '#ffcc00',
  Low: '#00ccff',
  Info: '#999999',
};

type Tab = 'dashboard' | 'target' | 'logger' | 'issues';

export const Dashboard: React.FC<DashboardProps> = ({ data, onViewReport, onDownloadReport, onDownloadPDF }) => {
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <h2 className="text-2xl font-mono font-bold text-white tracking-wider border-l-4 border-omega-accent pl-4">
          MISSION CONTROL
        </h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={onDownloadPDF} className="px-3 py-1.5 bg-omega-800 hover:bg-omega-700 text-white border border-omega-700 hover:border-white font-mono text-xs transition-all uppercase flex items-center gap-2">
            PDF Report
          </button>
          <button onClick={onDownloadReport} className="px-3 py-1.5 bg-omega-800 hover:bg-omega-700 text-white border border-omega-700 hover:border-white font-mono text-xs transition-all uppercase flex items-center gap-2">
             MD Report
          </button>
          <button onClick={onViewReport} className="px-3 py-1.5 bg-omega-700 hover:bg-omega-accent hover:text-black border border-omega-accent text-omega-accent font-mono text-xs transition-all uppercase">
            View Full Report
          </button>
        </div>
      </div>

      {/* BURP SUITE STYLE TABS */}
      <div className="flex border-b border-omega-700 mb-6 bg-omega-800/50">
        {[
          { id: 'dashboard', label: 'DASHBOARD' },
          { id: 'target', label: 'TARGET / SITEMAP' },
          { id: 'logger', label: 'LOGGER (HTTP HISTORY)' },
          { id: 'issues', label: 'ISSUES (SCANNER)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-6 py-3 font-mono text-sm font-bold tracking-wider transition-colors ${
              activeTab === tab.id
                ? 'bg-omega-700 text-omega-accent border-b-2 border-omega-accent'
                : 'text-gray-500 hover:text-gray-300 hover:bg-omega-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'CRITICAL', value: data.overview.critical, color: 'text-red-500', border: 'border-red-500' },
              { label: 'HIGH', value: data.overview.high, color: 'text-orange-500', border: 'border-orange-500' },
              { label: 'ENDPOINTS', value: data.overview.total_endpoints, color: 'text-omega-accent', border: 'border-omega-accent' },
              { label: 'PARAMETERS', value: data.overview.total_parameters, color: 'text-blue-400', border: 'border-blue-400' },
            ].map((stat, i) => (
              <div key={i} className={`bg-omega-800 p-4 border-t-2 ${stat.border} shadow-lg`}>
                <p className="text-gray-500 font-mono text-xs uppercase">{stat.label}</p>
                <p className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-omega-800 p-6 rounded-sm border border-omega-700 shadow-xl col-span-1">
              <h3 className="text-gray-400 font-mono text-sm mb-4 border-b border-omega-700 pb-2">SEVERITY_DISTRIBUTION</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.graphs.severity_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {data.graphs.severity_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS] || '#8884d8'} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} itemStyle={{ color: '#fff', fontFamily: 'monospace' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-omega-800 p-6 rounded-sm border border-omega-700 shadow-xl col-span-1 lg:col-span-2">
              <h3 className="text-gray-400 font-mono text-sm mb-4 border-b border-omega-700 pb-2">ENDPOINT_RISK_TOPOLOGY</h3>
               <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.graphs.endpoint_risk_map.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="endpoint" stroke="#666" fontSize={10} tick={{fill: '#666'}} />
                    <YAxis stroke="#666" />
                    <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} itemStyle={{ color: '#00ff41', fontFamily: 'monospace' }} />
                    <Bar dataKey="risk" fill="#333" stroke="#00ff41" strokeWidth={1} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-omega-800 p-4 border border-omega-700">
             <span className="text-gray-500 font-mono text-xs mr-4">DETECTED_TECH:</span>
             {data.tech_stack.map((tech, i) => (
               <span key={i} className="inline-block px-2 py-1 bg-omega-700 text-omega-accent text-xs font-mono mr-2 mb-2 border border-omega-600 rounded">
                 {tech}
               </span>
             ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TARGET / SITEMAP */}
      {activeTab === 'target' && (
        <div className="bg-omega-800 border border-omega-700 shadow-xl min-h-[500px] flex flex-col animate-fade-in">
          <div className="p-4 border-b border-omega-700 bg-omega-900 flex justify-between">
            <h3 className="text-white font-mono text-sm uppercase">Sitemap / Content Discovery</h3>
            <span className="text-xs font-mono text-gray-500">{data.sitemap.length} NODES FOUND</span>
          </div>
          <div className="flex-1 p-0 overflow-y-auto">
            {data.sitemap.map((path, idx) => (
              <div key={idx} className="border-b border-omega-700/50 p-2 hover:bg-omega-700/30 flex items-center space-x-2 font-mono text-sm text-gray-400 group cursor-default">
                 <svg className="w-4 h-4 text-gray-600 group-hover:text-omega-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                 <span>{path}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: LOGGER */}
      {activeTab === 'logger' && (
         <div className="bg-omega-800 border border-omega-700 shadow-xl flex flex-col animate-fade-in">
           <div className="p-4 border-b border-omega-700 bg-omega-900 flex justify-between items-center">
             <h3 className="text-white font-mono text-sm uppercase">HTTP Traffic Logger</h3>
             <div className="flex space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-xs font-mono text-gray-400">PROXY: ON</span>
                <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span>
                <span className="text-xs font-mono text-gray-400">SCANNER: ACTIVE</span>
             </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-xs font-mono">
               <thead className="bg-black text-gray-500 uppercase sticky top-0">
                 <tr>
                   <th className="px-4 py-3 w-16">#</th>
                   <th className="px-4 py-3">Time</th>
                   <th className="px-4 py-3">Tool</th>
                   <th className="px-4 py-3">Method</th>
                   <th className="px-4 py-3">URL</th>
                   <th className="px-4 py-3">Status</th>
                   <th className="px-4 py-3">Length</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-omega-700 text-gray-300">
                 {data.traffic_log && data.traffic_log.length > 0 ? (
                    data.traffic_log.map((log) => (
                      <tr key={log.id} className="hover:bg-omega-700/50 transition-colors cursor-pointer group">
                        <td className="px-4 py-2 text-gray-600 group-hover:text-white">{log.id}</td>
                        <td className="px-4 py-2 text-gray-500">{log.time}</td>
                        <td className="px-4 py-2">
                           <span className={`px-1.5 py-0.5 rounded text-[10px] border ${
                             log.type === 'Exploit' ? 'border-red-900 text-red-500' :
                             log.type === 'Fuzz' ? 'border-orange-900 text-orange-500' :
                             'border-gray-800 text-gray-500'
                           }`}>
                             {log.type}
                           </span>
                        </td>
                        <td className={`px-4 py-2 font-bold ${log.method === 'POST' ? 'text-blue-400' : 'text-green-400'}`}>{log.method}</td>
                        <td className="px-4 py-2 truncate max-w-md">{log.url}</td>
                        <td className="px-4 py-2">
                          <span className={`${
                            log.status >= 500 ? 'text-red-500 font-bold' :
                            log.status >= 400 ? 'text-orange-500' :
                            log.status >= 300 ? 'text-blue-500' :
                            'text-green-500'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500">{log.length}</td>
                      </tr>
                    ))
                 ) : (
                    <tr><td colSpan={7} className="text-center p-8 text-gray-500">NO TRAFFIC CAPTURED</td></tr>
                 )}
               </tbody>
             </table>
           </div>
         </div>
      )}

      {/* TAB CONTENT: ISSUES */}
      {activeTab === 'issues' && (
        <div className="bg-omega-800 border border-omega-700 shadow-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-omega-700 bg-omega-900">
             <h3 className="text-white font-mono text-sm uppercase">Identified Vulnerabilities</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-mono">
              <thead className="bg-omega-900 text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Severity</th>
                  <th className="px-6 py-3">Vulnerability</th>
                  <th className="px-6 py-3">Endpoint</th>
                  <th className="px-6 py-3">CVSS</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-omega-700">
                {data.vulnerabilities.map((vuln, idx) => (
                  <tr key={idx} className="hover:bg-omega-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        vuln.severity === 'Critical' ? 'bg-red-900/50 text-red-500 border border-red-900' :
                        vuln.severity === 'High' ? 'bg-orange-900/50 text-orange-500 border border-orange-900' :
                        vuln.severity === 'Medium' ? 'bg-yellow-900/50 text-yellow-500 border border-yellow-900' :
                        'bg-blue-900/50 text-blue-500 border border-blue-900'
                      }`}>
                        {vuln.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-200">{vuln.name}</td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{vuln.endpoint}</td>
                    <td className="px-6 py-4 text-gray-400">{vuln.cvss}</td>
                    <td className="px-6 py-4">
                       <button 
                         onClick={() => setSelectedVuln(vuln)}
                         className="text-omega-accent hover:text-white hover:underline text-xs uppercase font-bold tracking-wide"
                       >
                         DETAILS
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedVuln && (
        <VulnerabilityModal 
          vuln={selectedVuln} 
          onClose={() => setSelectedVuln(null)} 
        />
      )}
    </div>
  );
};
