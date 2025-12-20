"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Eye } from "lucide-react";

interface MemoryPathGameProps {
  studentAge: number;
  onComplete: (result: any) => void;
}

export default function MemoryPathGame({
  studentAge,
  onComplete,
}: MemoryPathGameProps) {
  const [phase, setPhase] = useState<
    "intro" | "showing" | "input" | "feedback" | "done"
  >("intro");

  const [round, setRound] = useState(0);
  const [path, setPath] = useState<number[]>([]);
  const [inputPath, setInputPath] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [startTime, setStartTime] = useState(0);

  /* 📊 Metrics */
  const [correctRounds, setCorrectRounds] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [maxLength, setMaxLength] = useState(0);

  /* 🔢 Difficulty by age */
  const totalRounds = studentAge <= 4 ? 6 : studentAge <= 7 ? 8 : 10;
  const baseLength = studentAge <= 4 ? 2 : studentAge <= 7 ? 3 : 4;
  const gridSize = 9;

  useEffect(() => {
    if (phase === "showing") showPath();
  }, [phase]);

  const generatePath = (length: number) => {
    const arr: number[] = [];
    while (arr.length < length) {
      const next = Math.floor(Math.random() * gridSize);
      if (!arr.includes(next)) arr.push(next);
    }
    return arr;
  };

  const startRound = () => {
    const length = baseLength + Math.floor(round / 2);
    const newPath = generatePath(length);

    setPath(newPath);
    setInputPath([]);
    setFeedback(null);
    setPhase("showing");
  };

  const showPath = async () => {
    for (let i = 0; i < path.length; i++) {
      setInputPath([path[i]]);
      await new Promise((res) => setTimeout(res, 600));
      setInputPath([]);
      await new Promise((res) => setTimeout(res, 250));
    }
    setPhase("input");
    setStartTime(Date.now());
  };

  const handleTap = (index: number) => {
    if (phase !== "input") return;

    const updated = [...inputPath, index];
    setInputPath(updated);

    if (updated.length === path.length) {
      const reaction = Date.now() - startTime;
      const isCorrect = JSON.stringify(updated) === JSON.stringify(path);

      if (isCorrect) {
        setCorrectRounds((c) => c + 1);
        setReactionTimes((r) => [...r, reaction]);
        setMaxLength((m) => Math.max(m, path.length));
        setFeedback("correct");
      } else {
        setFeedback("wrong");
      }

      setPhase("feedback");

      setTimeout(() => {
        if (round + 1 >= totalRounds) finishGame();
        else {
          setRound((r) => r + 1);
          startRound();
        }
      }, 1200);
    }
  };

  const finishGame = () => {
    const accuracy = Math.round((correctRounds / totalRounds) * 100);
    const avgReaction =
      reactionTimes.length > 0
        ? Math.round(
            reactionTimes.reduce((a, b) => a + b, 0) /
              reactionTimes.length
          )
        : 0;

    onComplete({
      gameId: "memory_path",
      gameName: "Memory Path",
      domain: "working_memory",
      correctRounds,
      accuracy,
      avgReaction,
      maxSequenceLength: maxLength,
      totalRounds,
      timestamp: new Date().toISOString(),
    });

    setPhase("done");
  };

  /* ================= UI ================= */

  if (phase === "intro") {
    return (
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🧠</div>
        <h2 className="text-2xl font-bold mb-2">Memory Path</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Watch the tiles carefully.<br />
          Then tap them in the same order.
        </p>
        <button
          onClick={startRound}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-3 rounded-xl font-semibold shadow-md"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🌟</div>
        <h2 className="text-2xl font-bold mb-2">Awesome!</h2>
        <p className="text-gray-600">
          You completed the memory challenge.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8">

      {/* Round + Phase Info */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500">
          Round {round + 1} of {totalRounds}
        </p>

        {phase === "showing" && (
          <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
            <Eye size={18} />
            Watch carefully
          </div>
        )}

        {phase === "input" && (
          <p className="font-medium text-gray-700">
            Now repeat the path
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: gridSize }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleTap(idx)}
            disabled={phase !== "input"}
            className={`aspect-square rounded-2xl transition-all duration-200
              ${
                inputPath.includes(idx)
                  ? "bg-blue-500 scale-105"
                  : "bg-gray-200 hover:bg-gray-300"
              }
            `}
          />
        ))}
      </div>

      {/* Feedback */}
      {phase === "feedback" && (
        <div className="mt-6 text-center">
          {feedback === "correct" ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle />
              <span className="font-semibold">Correct!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <XCircle />
              <span className="font-semibold">Wrong order</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
