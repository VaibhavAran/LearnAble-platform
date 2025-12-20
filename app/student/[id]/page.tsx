// app/student/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Play,
  FileText,
} from "lucide-react";

import EditStudentModal from "../../components/EditStudentModal";
import ReportDisplay from "../../components/ReportDisplay";

// Add proper type definitions
interface Student {
  id: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  parentContact?: string;
  lastAssessmentDate?: any;
  currentAssessmentId?: string;
}

interface GameResult {
  gameId: string;
  gameName?: string;
  domain: string;
  accuracy: number;
  avgReaction?: number;
  hits?: number;
  misses?: number;
  falseTaps?: number;
  correct?: number;
  wrong?: number;
  totalRounds?: number;
  correctRounds?: number;
  maxSequenceLength?: number;
}

interface Assessment {
  id: string;
  results?: GameResult[];
  completedAt?: any;
  report?: any;
  reportGenerated?: boolean;
  reportGeneratedAt?: any;
  status?: string;
}

interface Metric {
  label: string;
  value: string | number;
}

interface DetailedScore {
  name: string;
  domain: string;
  gameUsed: string;
  score: number;
  metrics: Metric[];
  rawData: GameResult;
}

export default function StudentProfile() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      } else {
        fetchStudent();
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  useEffect(() => {
    if (searchParams.get("assessment") === "complete") {
      alert("✅ Assessment completed successfully!");
    }
  }, [searchParams]);

  /* ---------------- FETCH ---------------- */

  const fetchStudent = async () => {
    if (!studentId) return;
    
    try {
      const ref = doc(db, "students", studentId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.push("/dashboard");
        return;
      }

      const studentData = { id: snap.id, ...snap.data() } as Student;
      setStudent(studentData);

      if (studentData.currentAssessmentId) {
        const aSnap = await getDoc(
          doc(db, "assessments", studentData.currentAssessmentId)
        );

        if (aSnap.exists()) {
          const assessmentData = { id: aSnap.id, ...aSnap.data() } as Assessment;
          setAssessment(assessmentData);

          // ✅ Load existing report if already generated
          if (assessmentData.report) {
            setGeneratedReport(assessmentData.report);
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error loading student");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const formatDate = (date: any) => {
    if (!date) return "Never";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Never";
    }
  };

  /* ---------------- IMPROVED SCORE EXTRACTION ---------------- */

  const extractDetailedMetrics = (): DetailedScore[] | null => {
    if (!assessment?.results || !Array.isArray(assessment.results)) {
      console.error("No assessment results available");
      return null;
    }

    console.log("Extracting metrics from results:", assessment.results);

    const results = assessment.results;
    const detailedScores: DetailedScore[] = [];

    // Process each game result
    results.forEach((result: GameResult) => {
      // Skip if required fields are missing
      if (!result || !result.domain || typeof result.accuracy !== 'number') {
        console.warn("Skipping invalid result:", result);
        return;
      }

      const metrics: Metric[] = [];
      
      // Common metrics
      if (result.avgReaction !== undefined && result.avgReaction !== null) {
        metrics.push({
          label: "Avg Reaction Time",
          value: `${result.avgReaction}ms`
        });
      }

      // Game-specific metrics
      switch (result.gameId) {
        case "focus_tap":
          metrics.push(
            { 
              label: "Hits", 
              value: `${result.hits ?? 0}/${result.totalRounds ?? 0}` 
            },
            { 
              label: "Misses", 
              value: result.misses ?? 0 
            },
            { 
              label: "False Taps", 
              value: result.falseTaps ?? 0 
            }
          );
          break;
        
        case "spot_difference":
          metrics.push(
            { 
              label: "Correct", 
              value: `${result.correct ?? 0}/${result.totalRounds ?? 0}` 
            },
            { 
              label: "Wrong", 
              value: result.wrong ?? 0 
            }
          );
          break;
        
        case "memory_path":
          metrics.push(
            { 
              label: "Correct Rounds", 
              value: `${result.correctRounds ?? 0}/${result.totalRounds ?? 0}` 
            },
            { 
              label: "Max Sequence", 
              value: result.maxSequenceLength ?? 0 
            }
          );
          break;
      }

      detailedScores.push({
        name: formatDomain(result.domain),
        domain: result.domain,
        gameUsed: result.gameName || result.gameId || "Unknown Game",
        score: result.accuracy,
        metrics,
        rawData: result
      });
    });

    console.log("Extracted detailed scores:", detailedScores);
    
    // Return null if no valid scores were extracted
    return detailedScores.length > 0 ? detailedScores : null;
  };

  const extractScore = (domains: string[]): number | null => {
    if (!assessment?.results || !Array.isArray(assessment.results)) return null;
    const found = assessment.results.find((r: GameResult) =>
      r && r.domain && domains.includes(r.domain)
    );
    return found?.accuracy ?? null;
  };

  const scores = {
    attention: extractScore(["attention"]),
    memory: extractScore(["working_memory", "memory"]),
    processing: extractScore(["processing", "visual_attention"]),
    impulse: extractScore(["impulse_control"])
  };

  /* ---------------- INTELLIGENT REPORT GENERATION ---------------- */

  const generateIntelligentReport = () => {
    if (!student) {
      console.error("No student data available");
      return null;
    }

    const detailedScores = extractDetailedMetrics();
    if (!detailedScores || detailedScores.length === 0) {
      console.error("No detailed scores available");
      return null;
    }

    // Calculate overall performance
    const avgScore = Math.round(
      detailedScores.reduce((sum, s) => sum + (s.score || 0), 0) / detailedScores.length
    );

    // Identify strengths (scores >= 80)
    const strengths = detailedScores
      .filter(s => s.score >= 80)
      .map(s => `${s.name}: Demonstrates strong capability with ${s.score}% accuracy`);

    // Identify areas for development (scores < 70)
    const areasForDevelopment = detailedScores
      .filter(s => s.score < 70)
      .map(s => `${s.name}: Shows room for improvement with ${s.score}% accuracy`);

    // Generate detailed analysis
    const detailedAnalysis = detailedScores.map(score => {
      let observation = "";
      
      if (score.score >= 80) {
        observation = `Excellent performance in ${score.name.toLowerCase()}. `;
      } else if (score.score >= 70) {
        observation = `Good performance in ${score.name.toLowerCase()} with minor areas for enhancement. `;
      } else if (score.score >= 60) {
        observation = `Moderate performance in ${score.name.toLowerCase()}. Additional practice recommended. `;
      } else {
        observation = `${score.name} shows significant opportunity for development. `;
      }

      // Add game-specific insights
      const data = score.rawData;
      if (data.gameId === "focus_tap") {
        const hits = data.hits ?? 0;
        const totalRounds = data.totalRounds ?? 0;
        const falseTaps = data.falseTaps ?? 0;
        
        observation += `Child achieved ${hits} successful taps out of ${totalRounds} rounds`;
        if (falseTaps > 0) {
          observation += `, with ${falseTaps} premature response(s)`;
        }
        observation += `.`;
      } else if (data.gameId === "spot_difference") {
        const correct = data.correct ?? 0;
        const totalRounds = data.totalRounds ?? 0;
        observation += `Successfully identified differences in ${correct} out of ${totalRounds} rounds.`;
      } else if (data.gameId === "memory_path") {
        const maxSeq = data.maxSequenceLength ?? 0;
        const correctRounds = data.correctRounds ?? 0;
        observation += `Recalled sequences up to ${maxSeq} items, completing ${correctRounds} rounds successfully.`;
      }

      return {
        domain: score.name,
        observation
      };
    });

    console.log("Generated detailed analysis:", detailedAnalysis);

    // Generate intelligent recommendations
    const recommendations = [];

    // Attention-based recommendations
    const attentionScore = detailedScores.find(s => s.domain === "attention");
    if (attentionScore) {
      if (attentionScore.score < 70) {
        recommendations.push({
          title: "Attention Enhancement Activities",
          description: "Engage in focused activities like puzzles, matching games, and timed challenges to improve sustained attention and reduce distractibility."
        });
      } else {
        recommendations.push({
          title: "Maintain Attention Skills",
          description: "Continue with challenging attention-based activities to maintain strong focus capabilities."
        });
      }
    }

    // Memory-based recommendations
    const memoryScore = detailedScores.find(s => 
      s.domain === "working_memory" || s.domain === "memory"
    );
    if (memoryScore) {
      if (memoryScore.score < 70) {
        recommendations.push({
          title: "Memory Strengthening Exercises",
          description: "Practice memory games, storytelling recall, and sequential activities to enhance working memory capacity."
        });
      } else {
        recommendations.push({
          title: "Advanced Memory Challenges",
          description: "Introduce more complex memory tasks and longer sequences to further develop memory skills."
        });
      }
    }

    // Visual attention recommendations
    const visualScore = detailedScores.find(s => s.domain === "visual_attention");
    if (visualScore && visualScore.score < 70) {
      recommendations.push({
        title: "Visual Discrimination Activities",
        description: "Include spot-the-difference games, pattern recognition, and visual sorting activities to improve visual processing."
      });
    }

    // General recommendation
    recommendations.push({
      title: "Regular Assessment & Monitoring",
      description: "Schedule follow-up assessment in 3-4 months to track progress and adjust intervention strategies as needed."
    });

    recommendations.push({
      title: "Collaborative Approach",
      description: "Maintain communication between parents, educators, and specialists to ensure consistent support across all environments."
    });

    console.log("Generated recommendations:", recommendations);

    // Executive summary
    let executiveSummary = `${student.name}, age ${student.age}, completed a comprehensive game-based cognitive assessment. `;
    
    if (avgScore >= 80) {
      executiveSummary += `The child demonstrates excellent cognitive capabilities across all assessed domains, with an average performance of ${avgScore}%. `;
    } else if (avgScore >= 70) {
      executiveSummary += `The child shows good cognitive development with an average performance of ${avgScore}%, with specific areas identified for continued growth. `;
    } else if (avgScore >= 60) {
      executiveSummary += `The child displays moderate cognitive performance averaging ${avgScore}%, with several areas benefiting from targeted interventions. `;
    } else {
      executiveSummary += `The child's assessment reveals significant opportunities for cognitive development, with an average performance of ${avgScore}%. `;
    }

    if (strengths.length > 0) {
      executiveSummary += `Notable strengths include ${strengths.length} domain(s) with excellent performance. `;
    }
    
    if (areasForDevelopment.length > 0) {
      executiveSummary += `Development focus recommended in ${areasForDevelopment.length} area(s). `;
    }

    executiveSummary += "This assessment provides a snapshot of current cognitive functioning and should be interpreted within the broader context of the child's overall development.";

    // Next steps
    const nextSteps = [
      "Review this report with parents/guardians to discuss findings and recommendations",
      "Implement suggested activities and interventions consistently at home and school",
      "Monitor progress through informal observation and tracking of skill development",
      "Schedule follow-up assessment in 3-4 months to evaluate progress",
      "Consult with educational or developmental specialists if concerns persist"
    ];

    const finalReport = {
      studentName: student.name,
      age: student.age,
      assessmentDate: assessment?.completedAt?.toDate?.() || new Date(),
      generatedAt: new Date().toISOString(),
      
      executiveSummary,
      
      detailedScores,
      
      averageScore: avgScore,
      
      strengths: strengths.length > 0 ? strengths : ["Assessment shows developing skills across all domains"],
      
      areasForDevelopment: areasForDevelopment.length > 0 
        ? areasForDevelopment 
        : ["Continue monitoring development across all cognitive areas"],
      
      detailedAnalysis,
      
      recommendations,
      
      nextSteps
    };

    console.log("Final complete report:", finalReport);
    console.log("Report sections check:", {
      hasDetailedAnalysis: detailedAnalysis.length > 0,
      hasRecommendations: recommendations.length > 0,
      hasNextSteps: nextSteps.length > 0,
      detailedScoresCount: detailedScores.length
    });

    return finalReport;
  };

  /* ---------------- REPORT GENERATION ---------------- */

  const handleGenerateReport = async () => {
    if (!assessment) {
      alert("No assessment data available");
      return;
    }

    // ✅ If already generated, just show it
    if (assessment.reportGenerated && assessment.report) {
      setGeneratedReport(assessment.report);
      setShowReport(true);
      return;
    }

    setGeneratingReport(true);

    try {
      console.log("Starting report generation...");
      console.log("Assessment data:", assessment);
      
      const report = generateIntelligentReport();

      if (!report) {
        console.error("Report generation returned null");
        throw new Error("Failed to generate report data - no metrics available");
      }

      console.log("Generated report:", report);
      console.log("About to save to Firestore:", {
        detailedAnalysisLength: report.detailedAnalysis?.length,
        recommendationsLength: report.recommendations?.length,
        nextStepsLength: report.nextSteps?.length,
        detailedScoresLength: report.detailedScores?.length,
        fullReport: JSON.stringify(report, null, 2)
      });

      await updateDoc(doc(db, "assessments", assessment.id), {
        report,
        reportGenerated: true,
        reportGeneratedAt: Timestamp.now(),
        status: "report_generated",
      });

      console.log("Successfully saved to Firestore");

      // Verify what was actually saved by fetching it back
      const verifySnap = await getDoc(doc(db, "assessments", assessment.id));
      const savedReport = verifySnap.data()?.report;
      console.log("Verified saved report from Firestore:", savedReport);
      console.log("Verified report sections:", {
        detailedAnalysisLength: savedReport?.detailedAnalysis?.length,
        recommendationsLength: savedReport?.recommendations?.length,
        nextStepsLength: savedReport?.nextSteps?.length,
        detailedScoresLength: savedReport?.detailedScores?.length
      });

      setGeneratedReport(report);
      setShowReport(true);
    } catch (err) {
      console.error("Report generation error:", err);
      alert(`Failed to generate report: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  /* ---------------- UTILITY ---------------- */

  function formatDomain(domain: string): string {
    if (!domain) return "Unknown Domain";
    
    const formatted = domain
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    
    // Special cases
    if (domain === "working_memory") return "Working Memory";
    if (domain === "visual_attention") return "Visual Attention";
    
    return formatted;
  }

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Student
          </button>
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* STUDENT INFO */}
        <section className="bg-white rounded-3xl shadow-lg border p-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {student.name}
          </h1>

          <div className="mt-3 flex flex-wrap gap-6 text-sm text-gray-600">
            <span>🎂 Age: <strong>{student.age}</strong></span>
            <span>📅 DOB: <strong>{student.dateOfBirth || "N/A"}</strong></span>
            <span>🕒 Last Assessment: <strong>{formatDate(student.lastAssessmentDate)}</strong></span>
          </div>

          {student.parentContact && (
            <p className="mt-3 text-sm text-gray-500">
              👨‍👩‍👧 Parent Contact: {student.parentContact}
            </p>
          )}
        </section>

        {/* SNAPSHOT */}
        <section className="bg-white rounded-3xl shadow-lg border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Learning Snapshot
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              ["Attention", scores.attention, "bg-blue-500"],
              ["Working Memory", scores.memory, "bg-green-500"],
              ["Visual Processing", scores.processing, "bg-purple-500"],
            ].map(([label, value, color]) => (
              <div key={label as string} className="rounded-2xl border bg-gray-50 p-5">
                <p className="text-sm text-gray-600 mb-2">{label as string}</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">
                  {value !== null ? `${value}%` : "—"}
                </p>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className={`${color as string} h-2 rounded-full`}
                    style={{ width: `${(value as number) || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTION */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
          {!assessment ? (
            <>
              <h2 className="text-2xl font-bold mb-2">
                Ready to assess learning patterns?
              </h2>
              <p className="text-white/80 mb-6">
                Age-appropriate games to understand how the child learns.
              </p>

              <button
                onClick={() => router.push(`/assessment/${student.id}`)}
                className="inline-flex items-center gap-3 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-semibold shadow-lg hover:bg-gray-50 transition"
              >
                <Play />
                Start Assessment
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">
                Assessment Completed ✓
              </h2>
              <p className="text-white/80 mb-6">
                Generate a comprehensive learning pattern report with detailed insights and recommendations.
              </p>

              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="inline-flex items-center gap-3 bg-white text-purple-700 px-8 py-4 rounded-2xl font-semibold shadow-lg hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FileText />
                {assessment.reportGenerated ? "View Report" : generatingReport ? "Generating..." : "Generate Report"}
              </button>
            </>
          )}
        </section>
      </main>

      {/* MODALS */}
      <EditStudentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        student={student}
        onStudentUpdated={fetchStudent}
      />

      {showReport && generatedReport && (
        <ReportDisplay
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          report={generatedReport}
        />
      )}
    </div>
  );
}