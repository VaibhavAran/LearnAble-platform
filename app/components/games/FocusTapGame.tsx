"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface FocusTapGameProps {
  studentAge: number;
  onComplete: (result: any) => void;
}

export default function FocusTapGame({
  studentAge,
  onComplete,
}: FocusTapGameProps) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [round, setRound] = useState(0);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [isTarget, setIsTarget] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const startTimeRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* 🔢 Difficulty by age */
  const totalRounds = studentAge <= 3 ? 8 : studentAge <= 6 ? 12 : 16;
  const showTime = studentAge <= 3 ? 2500 : studentAge <= 6 ? 1800 : 1300;

  /* 📊 Metrics */
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseTaps, setFalseTaps] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const targets = ["⭐"];
  const distractors = ["⬛", "🔺", "🔵"];

  useEffect(() => {
    if (phase === "play") startRound();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [round, phase]);

  const startRound = () => {
    setFeedback(null);

    const targetRound = Math.random() < 0.6;
    const newSymbol = targetRound
      ? targets[0]
      : distractors[Math.floor(Math.random() * distractors.length)];

    setSymbol(newSymbol);
    setIsTarget(targetRound);
    startTimeRef.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      if (targetRound) setMisses((m) => m + 1);
      nextRound();
    }, showTime);
  };

  const handleTap = () => {
    if (feedback) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const reaction = Date.now() - startTimeRef.current;

    if (isTarget) {
      setHits((h) => h + 1);
      setReactionTimes((r) => [...r, reaction]);
      setFeedback("correct");
    } else {
      setFalseTaps((f) => f + 1);
      setFeedback("wrong");
    }

    setTimeout(nextRound, 700);
  };

  const nextRound = () => {
    if (round + 1 >= totalRounds) finishGame();
    else setRound((r) => r + 1);
  };

  const finishGame = () => {
    const accuracy = Math.round(
      (hits / Math.max(1, hits + misses + falseTaps)) * 100
    );

    const avgReaction =
      reactionTimes.length > 0
        ? Math.round(
            reactionTimes.reduce((a, b) => a + b, 0) /
              reactionTimes.length
          )
        : 0;

    onComplete({
      gameId: "focus_tap",
      gameName: "Focus Tap",
      domain: "attention",
      hits,
      misses,
      falseTaps,
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
        <div className="text-6xl mb-4">⭐</div>
        <h2 className="text-2xl font-bold mb-2">Focus Tap</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Tap <strong>only</strong> when you see the ⭐ star.<br />
          Don’t tap other shapes.
        </p>

        <button
          onClick={() => setPhase("play")}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-md"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
        <p className="text-gray-600">
          You completed the Focus Tap game.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">

      {/* Round Info */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500">
          Round {round + 1} of {totalRounds}
        </p>
        <p className="text-sm font-medium text-gray-700">
          Tap ⭐ only
        </p>
      </div>

      {/* Game Area */}
      <div
        onClick={handleTap}
        className={`relative min-h-[420px] rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-300 select-none
        ${
          feedback === "correct"
            ? "bg-green-100"
            : feedback === "wrong"
            ? "bg-red-100"
            : "bg-gradient-to-br from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200"
        }`}
      >
        {!feedback ? (
          <div className="text-[120px] animate-pulse">
            {symbol}
          </div>
        ) : feedback === "correct" ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-24 h-24 text-green-600 mb-2" />
            <span className="text-lg font-semibold text-green-700">
              Correct!
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <XCircle className="w-24 h-24 text-red-600 mb-2" />
            <span className="text-lg font-semibold text-red-700">
              Try again
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
