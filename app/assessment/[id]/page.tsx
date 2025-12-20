// app/assessment/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "../../../firebase/config";
import { getAssessmentGames } from "../../../lib/assessment/gameSelector";

import FocusTapGame from "../../components/games/FocusTapGame";
import SpotTheDifference from "../../components/games/SpotTheDifference";
import MemoryPathGame from "../../components/games/MemoryPathGame";

import { Loader2 } from "lucide-react";


interface Student {
  id: string;
  name: string;
  age: number;
}


const GAME_COMPONENTS: Record<string, any> = {
  focus_tap: FocusTapGame,
  spot_difference: SpotTheDifference,
  memory_path: MemoryPathGame,
};

export default function AssessmentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [games, setGames] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      const snap = await getDoc(doc(db, "students", id as string));

      if (!snap.exists()) {
        router.push("/dashboard");
        return;
      }

      const studentData: Student = {
        id: snap.id,
        ...(snap.data() as Omit<Student, "id">),
      };

      setStudent(studentData);
      setGames(getAssessmentGames(studentData.age));
      setLoading(false);
    });

    return () => unsub();
  }, [id, router]);

  /* ---------------- GAME FLOW ---------------- */

  const handleGameComplete = (gameResult: any) => {
    const updated = [...results, gameResult];
    setResults(updated);

    if (currentIndex < games.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishAssessment(updated);
    }
  };

  const finishAssessment = async (finalResults: any[]) => {
    if (!student) return;

    const assessmentRef = await addDoc(collection(db, "assessments"), {
      studentId: student.id,
      studentName: student.name,
      studentAge: student.age,
      results: finalResults,
      status: "games_completed",
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
    });

    await updateDoc(doc(db, "students", student.id), {
      lastAssessmentDate: Timestamp.now(),
      currentAssessmentId: assessmentRef.id,
      updatedAt: Timestamp.now(),
    });

    router.push(`/student/${student.id}?assessment=complete`);
  };

  /* ---------------- LOADING ---------------- */

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Preparing assessment...
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- UI DATA ---------------- */

  const currentGame = games[currentIndex];
  const GameComponent = GAME_COMPONENTS[currentGame.id];
  const progress = Math.round(((currentIndex + 1) / games.length) * 100);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Learning Assessment
              </h1>
              <p className="text-sm text-gray-600">
                {student.name} • Age {student.age}
              </p>
            </div>

            <div className="text-sm font-medium text-gray-600">
              Game {currentIndex + 1} of {games.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <div className="bg-white rounded-3xl shadow-xl border p-6 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentGame.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Follow the instructions carefully and respond honestly
              </p>
            </div>

            <div className="flex justify-center">
              <GameComponent
                studentAge={student.age}
                onComplete={handleGameComplete}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
