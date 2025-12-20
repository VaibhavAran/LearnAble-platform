// app/components/assessment/AssessmentProgress.tsx

"use client";

interface Props {
  current: number;
  total: number;
}

export default function AssessmentProgress({ current, total }: Props) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="max-w-xl mx-auto mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Game {current} of {total}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
