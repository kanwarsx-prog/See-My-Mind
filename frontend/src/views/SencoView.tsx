import React, { useState, useEffect } from 'react';
import { Child, ChildEvent, AskNoyaResponse, DocumentItem, IncidentDetail } from '../types';
import { ShieldCheck, Sparkles, Search, FileText, CheckCircle2, Upload, AlertTriangle } from 'lucide-react';
import { api } from '../api';

interface SencoViewProps {
  child: Child;
  timeline: ChildEvent[];
  onOpenDocModal?: () => void;
  onOpenIncidentModal?: () => void;
}

export const SencoView: React.FC<SencoViewProps> = ({
  child,
  timeline,
  onOpenDocModal,
  onOpenIncidentModal,
}) => {
  const [query, setQuery] = useState('What sensory calming strategies have proven most effective this month?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskNoyaResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentDetail[]>([]);

  useEffect(() => {
    if (child?.id) {
      api.getDocuments(child.id).then(setDocuments).catch(console.error);
      api.getIncidents(child.id).then(setIncidents).catch(console.error);
    }
  }, [child?.id]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const resp = await api.askNoya(child.id, query);
      setResult(resp);
    } catch (err) {
      console.error(err);
      alert('Failed to query NOYA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SENCO Header Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="stat-card border-teal">
          <div className="font-serif text-2xl font-bold text-teal">34</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Active SEND Caseload · Whole School</div>
        </div>
        <div className="stat-card border-purple-dark">
          <div className="font-serif text-2xl font-bold text-purple-dark">12</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Statutory EHCPs Managed</div>
        </div>
        <div className="stat-card border-amber-dark">
          <div className="font-serif text-2xl font-bold text-amber-dark">2</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Annual Reviews Due This Term</div>
        </div>
        <div className="stat-card border-emerald-600">
          <div className="font-serif text-2xl font-bold text-emerald-700">{timeline.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Logged Evidence Events</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ask NOYA & EHCP Outcomes */}
        <div className="lg:col-span-7 space-y-4">
          {/* Ask NOYA RAG & Evidence Tool */}
          <div className="card p-5 border-l-4 border-l-teal">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
              <Sparkles className="w-4 h-4 text-teal" />
              <h3 className="text-sm font-bold text-navy">Ask NOYA · SEND Longitudinal Evidence Retrieval</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Ask questions across Phoenix's observation history, morning handovers, and EHCP provision records. Answers include verifiable citations.
            </p>

            <form onSubmit={handleAsk} className="flex gap-2 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask NOYA about triggers, strategies, or learning wins..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-teal hover:bg-teal-medium text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{loading ? 'Searching...' : 'Ask'}</span>
              </button>
            </form>

            {result && (
              <div className="p-4 rounded-xl bg-mint/10 border border-mint/40 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] text-teal font-bold">
                  <span>NOYA Synthesis ({result.model_used})</span>
                  <span>{result.latency_ms}ms</span>
                </div>
                <div className="text-xs text-navy whitespace-pre-line leading-relaxed">
                  {result.answer_markdown}
                </div>
                {result.citations.length > 0 && (
                  <div className="pt-2 border-t border-mint/20 text-[10px] text-gray-500">
                    <span className="font-bold">Citations: </span>
                    {result.citations.map((c) => c.citation_text).join(' · ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statutory EHCP Progress Section */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-dark" />
                <h3 className="text-sm font-bold text-navy">EHCP Annual Review & Outcomes</h3>
              </div>
              <span className="text-[10px] bg-purple-light text-purple-dark px-2 py-0.5 rounded-full font-bold">
                Section F Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <div className="font-bold text-navy">Target 1: Sensory Regulation in Large Spaces</div>
                <p className="text-gray-600">Provision: Access to noise defenders & visual timetable for whole-school transitions.</p>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>On track · 8 positive observation logs this term</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <div className="font-bold text-navy">Target 2: Peer Collaboration & Group Tasks</div>
                <p className="text-gray-600">Provision: Visual task breakdown strip for partner work in practical subjects.</p>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Demonstrated in Science practical (Water density task)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Documents, Incidents & Caseload */}
        <div className="lg:col-span-5 space-y-4">
          {/* Statutory Documents Section */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-dark" />
                <h3 className="text-sm font-bold text-navy">Statutory Documents ({documents.length})</h3>
              </div>
              {onOpenDocModal && (
                <button
                  onClick={onOpenDocModal}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-purple-light text-purple-dark rounded-lg hover:bg-purple-200 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>+ Upload</span>
                </button>
              )}
            </div>

            {documents.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No statutory documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-navy">{doc.title}</div>
                      <div className="text-[10px] text-gray-400">{doc.document_type} · {(doc.file_size_bytes ? doc.file_size_bytes / 1024 : 0).toFixed(1)} KB</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Stored</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ABC Incident Triage */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-coral" />
                <h3 className="text-sm font-bold text-navy">ABC Incidents ({incidents.length})</h3>
              </div>
              {onOpenIncidentModal && (
                <button
                  onClick={onOpenIncidentModal}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-coral-light text-coral-dark rounded-lg hover:bg-coral-200 cursor-pointer"
                >
                  <span>+ Report ABC</span>
                </button>
              )}
            </div>

            {incidents.length === 0 ? (
              <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero major incidents recorded this term.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-navy">
                      <span>{inc.location || 'Classroom'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        inc.severity === 'Safeguarding Incident' ? 'bg-red-100 text-red-800' : 'bg-coral-100 text-coral-800'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600"><strong>A:</strong> {inc.antecedent}</p>
                    <p className="text-[11px] text-gray-600"><strong>B:</strong> {inc.behaviour}</p>
                    <p className="text-[11px] text-emerald-700"><strong>C:</strong> {inc.consequence}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inclusion Triage & Reviews */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <ShieldCheck className="w-4 h-4 text-teal" />
              <h3 className="text-sm font-bold text-navy">Inclusion Triage & Reviews</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs space-y-1">
                <div className="flex justify-between font-bold text-navy">
                  <span>Phoenix Carter (Year 5)</span>
                  <span className="text-coral-dark text-[10px]">Today: Assembly Alert</span>
                </div>
                <p className="text-gray-500 text-[11px]">ASC · Noise defenders prepared · Handover received from Dana Carter</p>
              </div>

              <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs space-y-1">
                <div className="flex justify-between font-bold text-navy">
                  <span>Luca Moretti (Year 4)</span>
                  <span className="text-emerald-700 text-[10px]">Stable</span>
                </div>
                <p className="text-gray-500 text-[11px]">Speech & Language therapy scheduled for Thursday 2:00pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
