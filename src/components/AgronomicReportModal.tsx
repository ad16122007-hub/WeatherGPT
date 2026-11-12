import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Wind,
  Droplets,
  Bug,
  Tractor,
  ThermometerSnowflake,
  RefreshCw,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { AgronomyReport, FarmContext, CropConfig } from '../types';

interface AgronomicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmContext: FarmContext;
  crop: CropConfig;
}

export const AgronomicReportModal: React.FC<AgronomicReportModalProps> = ({
  isOpen,
  onClose,
  farmContext,
  crop,
}) => {
  const [report, setReport] = useState<AgronomyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agronomy-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmContext }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      console.error('Audit generation error:', err);
      setError(err.message || 'Failed to generate farm audit.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, farmContext.locationName, farmContext.cropStage]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="farm-card w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-emerald-500/30">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-100 flex items-center gap-2">
                Precision Agronomic Audit & Action Plan
              </h2>
              <p className="text-xs text-stone-400">
                {farmContext.locationName} · {crop.name} · Stage: {farmContext.cropStage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {report && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-700/60 transition-colors"
                title="Print Audit Report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print / Save PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-stone-200">
          {isLoading && (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-stone-200">
                Synthesizing multi-variable agro-meteorological models...
              </p>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Correlating ET₀ water loss, Delta-T drift boundaries, microclimate pathogen indices, and soil compaction limits.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-700/50 text-xs text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchReport}
                className="px-3 py-1 bg-rose-900/60 rounded border border-rose-600/40 hover:bg-rose-800 text-xs text-rose-200 font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {report && !isLoading && (
            <>
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-stone-950 to-stone-950 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
                  Executive Agronomic Summary
                </span>
                <p className="text-xs sm:text-sm text-stone-100 mt-1.5 leading-relaxed font-medium">
                  {report.summary}
                </p>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Spray Window */}
                <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-stone-200">
                      <Wind className="w-4 h-4 text-teal-400" />
                      <span>Spraying Suitability Window</span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold border ${
                        report.sprayWindow.status === 'Optimal'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                          : report.sprayWindow.status === 'Caution'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                          : 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                      }`}
                    >
                      {report.sprayWindow.status}
                    </span>
                  </div>
                  <p className="text-stone-300 leading-normal">
                    <strong>Optimal Hours:</strong> {report.sprayWindow.recommendedWindow}
                  </p>
                  <p className="text-stone-400 text-[11px]">
                    {report.sprayWindow.rationale}
                  </p>
                  <div className="pt-2 border-t border-stone-800/60 flex justify-between text-[11px] font-mono text-stone-400">
                    <span>Drift Risk: <strong className="text-stone-200">{report.sprayWindow.driftRisk}</strong></span>
                    <span>Rainfastness: <strong className="text-stone-200">{report.sprayWindow.rainfastnessWindowHours}h required</strong></span>
                  </div>
                </div>

                {/* 2. Irrigation */}
                <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-stone-200">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      <span>Irrigation & Soil Depletion</span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold border ${
                        report.irrigation.urgency === 'High'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                          : report.irrigation.urgency === 'Medium'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                      }`}
                    >
                      {report.irrigation.urgency} Urgency
                    </span>
                  </div>
                  <p className="text-stone-300 leading-normal">
                    <strong>Target:</strong> {report.irrigation.recommendation}
                  </p>
                  <p className="text-stone-400 text-[11px]">
                    System runtime: {report.irrigation.systemRuntimeHours}
                  </p>
                  <div className="pt-2 border-t border-stone-800/60 flex justify-between text-[11px] font-mono text-stone-400">
                    <span>Soil Depletion: <strong className="text-stone-200">{report.irrigation.depletionStatus}</strong></span>
                    <span>Net Water Balance: <strong className="text-rose-400">{report.irrigation.waterBalanceNetMm} mm</strong></span>
                  </div>
                </div>

                {/* 3. Pest & Disease Alert */}
                <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-stone-200">
                      <Bug className="w-4 h-4 text-amber-400" />
                      <span>Microclimate Disease Pressure</span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold border ${
                        report.pestDiseaseAlert.riskLevel === 'High'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                          : report.pestDiseaseAlert.riskLevel === 'Moderate'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                      }`}
                    >
                      {report.pestDiseaseAlert.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-stone-300 leading-normal">
                    <strong>Target Threats:</strong> {report.pestDiseaseAlert.primaryThreats.join(', ')}
                  </p>
                  <p className="text-stone-400 text-[11px]">
                    {report.pestDiseaseAlert.preventativeAction}
                  </p>
                </div>

                {/* 4. Tractor Trafficability & Soil Health */}
                <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-stone-200">
                      <Tractor className="w-4 h-4 text-emerald-400" />
                      <span>Field Trafficability & Compaction</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold border bg-stone-900 border-stone-700 text-stone-300">
                      Status: {report.fieldTrafficability.status}
                    </span>
                  </div>
                  <p className="text-stone-300 leading-normal">
                    <strong>Guidance:</strong> {report.fieldTrafficability.equipmentGuidance}
                  </p>
                  <div className="pt-2 border-t border-stone-800/60 flex justify-between text-[11px] font-mono text-stone-400">
                    <span>Compaction Risk: <strong className="text-stone-200">{report.fieldTrafficability.soilCompactionRisk}</strong></span>
                  </div>
                </div>
              </div>

              {/* 72-Hour Operational Action Plan */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs uppercase font-mono text-stone-200">
                    Next 72-Hour Farm Operator Action Plan
                  </span>
                </div>
                <div className="space-y-2">
                  {report.next72HoursActionPlan.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-900/60 border border-stone-800/60 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-stone-200 leading-relaxed font-medium">
                        {action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          <span>WeatherGPT Precision Agronomy Model · Gemini 3.8 Flash</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
