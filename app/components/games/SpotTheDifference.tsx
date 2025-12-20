"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface SpotDifferenceGameProps {
  studentAge: number;
  onComplete: (result: any) => void;
}

export default function SpotDifferenceGame({
  studentAge,
  onComplete,
}: SpotDifferenceGameProps) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [round, setRound] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [roundStart, setRoundStart] = useState(0);

  /* 📊 Metrics */
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  /* 🔢 Difficulty by age */
  const totalRounds = studentAge <= 4 ? 6 : studentAge <= 7 ? 10 : 14;
  const gridSize = studentAge <= 4 ? 6 : studentAge <= 7 ? 9 : 12;

  /**
   * 🧠 HARD DIFFERENCE SETS
   * Very subtle visual changes
   */
  const hardSets = [
    { normal: "😈", odd: "👿" },
    { normal: "😿", odd: "😾" },
    { normal: "🟦", odd: "🟪" },
    { normal: "🙁", odd: "☹️" },
  ];

  useEffect(() => {
    if (phase === "play") setupRound();
  }, [round, phase]);

  const setupRound = () => {
    setFeedback(null);

    const set = hardSets[round % hardSets.length];
    const newItems = Array(gridSize).fill(set.normal);
    const oddIndex = Math.floor(Math.random() * gridSize);

    newItems[oddIndex] = set.odd;

    setItems(newItems);
    setTargetIndex(oddIndex);
    setRoundStart(Date.now());
  };

  const handleSelect = (index: number) => {
    if (feedback) return;

    const reaction = Date.now() - roundStart;

    if (index === targetIndex) {
      setCorrect((c) => c + 1);
      setReactionTimes((r) => [...r, reaction]);
      setFeedback("correct");
    } else {
      setWrong((w) => w + 1);
      setFeedback("wrong");
    }

    setTimeout(() => {
      if (round + 1 >= totalRounds) finishGame();
      else setRound((r) => r + 1);
    }, 800);
  };

  const finishGame = () => {
    const accuracy = Math.round((correct / totalRounds) * 100);
    const avgReaction =
      reactionTimes.length > 0
        ? Math.round(
            reactionTimes.reduce((a, b) => a + b, 0) /
              reactionTimes.length
          )
        : 0;

    onComplete({
      gameId: "spot_difference",
      gameName: "Spot the Difference",
      domain: "visual_attention",
      correct,
      wrong,
      accuracy,
      avgReaction,
      totalRounds,
      timestamp: new Date().toISOString(),
    });

    setPhase("done");
  };

  /* ================= UI ================= */

  if (phase === "intro") {
    return (
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">
          Spot the Difference
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          All items look almost the same.<br />
          One is slightly different.<br />
          Find it carefully.
        </p>
        <button
          onClick={() => setPhase("play")}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-md"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold mb-2">Great Focus!</h2>
        <p className="text-gray-600">
          You completed the visual attention task.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">

      {/* Round Info */}
      <div className="text-center mb-5">
        <p className="text-sm text-gray-500">
          Round {round + 1} of {totalRounds}
        </p>
        <h3 className="text-lg font-semibold text-gray-800">
          Find the slightly different one
        </h3>
      </div>

      {/* Grid */}
      <div
        className={`grid gap-4 ${
          gridSize <= 6 ? "grid-cols-3" : "grid-cols-4"
        }`}
      >
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={!!feedback}
            className={`aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all
              ${
                feedback && idx === targetIndex
                  ? "bg-green-200 ring-4 ring-green-500"
                  : "bg-gray-100 hover:bg-gray-200"
              }
            `}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mt-6 text-center">
          {feedback === "correct" ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle />
              <span className="font-semibold">Correct!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <XCircle />
              <span className="font-semibold">Incorrect</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
