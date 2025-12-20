// app/components/ReportDisplay.tsx

"use client";

import { X, FileText, CheckCircle, AlertTriangle, Download } from "lucide-react";

interface ReportDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  report: any;
}

export default function ReportDisplay({
  isOpen,
  onClose,
  report,
}: ReportDisplayProps) {
  if (!isOpen) return null;

  // Defensive checks for report data
  if (!report) {
    console.error("No report data provided");
    return null;
  }

  console.log("ReportDisplay received report:", report);
  console.log("Report data check:", {
    hasDetailedAnalysis: report.detailedAnalysis?.length,
    hasRecommendations: report.recommendations?.length,
    hasNextSteps: report.nextSteps?.length,
    detailedAnalysis: report.detailedAnalysis,
    recommendations: report.recommendations,
    nextSteps: report.nextSteps
  });

  // Ensure all required fields exist with defaults
  const safeReport = {
    ...report,
    detailedScores: report.detailedScores || [],
    strengths: report.strengths || [],
    areasForDevelopment: report.areasForDevelopment || [],
    detailedAnalysis: report.detailedAnalysis || [],
    recommendations: report.recommendations || [],
    nextSteps: report.nextSteps || []
  };

  console.log("SafeReport after defaults:", {
    detailedAnalysisCount: safeReport.detailedAnalysis.length,
    recommendationsCount: safeReport.recommendations.length,
    nextStepsCount: safeReport.nextSteps.length
  });

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/generate-report-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: safeReport }),
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeReport.studentName}_Assessment_Report.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">

        {/* ================= HEADER ================= */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <FileText />
            <div>
              <h2 className="text-xl font-bold">Learning Assessment Report</h2>
              <p className="text-xs opacity-90">
                Generated on {new Date(safeReport.generatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl flex items-center gap-2 transition"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition"
            >
              <X />
            </button>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* -------- STUDENT INFO -------- */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard label="Student Name" value={safeReport.studentName} />
            <InfoCard label="Age" value={`${safeReport.age} years`} />
            <InfoCard label="Assessment Date" value={new Date(safeReport.assessmentDate).toLocaleDateString()} />
          </section>

          {/* -------- EXECUTIVE SUMMARY -------- */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Executive Summary
            </h3>
            <p className="text-gray-700 leading-relaxed text-base">
              {safeReport.executiveSummary}
            </p>
          </section>

          {/* -------- DETAILED SCORES -------- */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              📊 Cognitive Domain Performance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {safeReport.detailedScores.map((domain: any) => (
                <DetailedScoreCard key={domain.name} domain={domain} />
              ))}
            </div>
          </section>

          {/* -------- PERFORMANCE SUMMARY -------- */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HighlightCard
              title="Key Strengths"
              icon={<CheckCircle className="text-green-600" size={24} />}
              items={safeReport.strengths}
              emptyText="No major strengths identified yet"
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />

            <HighlightCard
              title="Areas for Development"
              icon={<AlertTriangle className="text-amber-600" size={24} />}
              items={safeReport.areasForDevelopment}
              emptyText="No critical concerns identified"
              bgColor="bg-amber-50"
              borderColor="border-amber-200"
            />
          </section>

          {/* -------- DETAILED ANALYSIS -------- */}
          <section className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📋 Detailed Analysis
            </h3>
            
            {safeReport.detailedAnalysis.length > 0 ? (
              <div className="space-y-4">
                {safeReport.detailedAnalysis.map((analysis: any, idx: number) => (
                  <div key={idx} className="pb-4 border-b last:border-b-0 last:pb-0">
                    <h4 className="font-semibold text-gray-900 mb-2">{analysis.domain}</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{analysis.observation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ No detailed analysis available. This might indicate a data issue. 
                  Please check browser console for errors.
                </p>
              </div>
            )}
          </section>

          {/* -------- RECOMMENDATIONS -------- */}
          <section className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              💡 Professional Recommendations
            </h3>

            {safeReport.recommendations.length > 0 ? (
              <div className="space-y-4">
                {safeReport.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border border-purple-100">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                        <p className="text-gray-700 text-sm">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ No recommendations available. This might indicate a data issue. 
                  Please check browser console for errors.
                </p>
              </div>
            )}
          </section>

          {/* -------- NEXT STEPS -------- */}
          <section className="bg-blue-600 text-white rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-3">🎯 Next Steps</h3>
            {safeReport.nextSteps.length > 0 ? (
              <ul className="space-y-2">
                {safeReport.nextSteps.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-blue-200 font-bold">•</span>
                    <span className="text-white/90">{step}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-blue-500 rounded-lg p-4">
                <p className="text-white text-sm">
                  ⚠️ No next steps available. This might indicate a data issue. 
                  Please check browser console for errors.
                </p>
              </div>
            )}
          </section>

          {/* -------- DISCLAIMER -------- */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Disclaimer:</strong> This report is generated using game-based learning analytics 
              and should be used as a supplementary tool. It is not a substitute for professional 
              psychological or educational assessment. For comprehensive evaluation, please consult 
              with qualified professionals.
            </p>
          </section>

        </main>

        {/* ================= FOOTER ================= */}
        <footer className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Report generated by Learning Assessment Platform
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition"
            >
              Close
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function DetailedScoreCard({ domain }: { domain: any }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-green-500", text: "text-green-700", border: "border-green-300" };
    if (score >= 60) return { bg: "bg-yellow-500", text: "text-yellow-700", border: "border-yellow-300" };
    return { bg: "bg-red-500", text: "text-red-700", border: "border-red-300" };
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Satisfactory";
    return "Needs Improvement";
  };

  const color = getScoreColor(domain.score);

  return (
    <div className={`bg-white border-2 ${color.border} rounded-2xl p-5 shadow-sm`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-gray-900 text-lg">{domain.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{domain.gameUsed}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color.text} bg-${color.bg.split('-')[1]}-100`}>
          {getPerformanceLabel(domain.score)}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Accuracy</span>
          <span className="text-2xl font-bold text-gray-900">{domain.score}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-3 ${color.bg} transition-all duration-500`}
            style={{ width: `${domain.score}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {domain.metrics.map((metric: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-gray-600">{metric.label}</span>
            <span className="font-semibold text-gray-900">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HighlightCard({
  title,
  icon,
  items,
  emptyText,
  bgColor,
  borderColor,
}: {
  title: string;
  icon: any;
  items: string[];
  emptyText: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-2xl p-5 shadow-sm`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-gray-500 font-bold mt-1">•</span>
              <span className="text-gray-700 flex-1">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">{emptyText}</p>
      )}
    </div>
  );
}