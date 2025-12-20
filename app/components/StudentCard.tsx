"use client";

import { Play, Eye, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  age: number;
  lastAssessmentDate?: any;
}

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  const router = useRouter();

  // Safety check
  if (!student || !student.name) {
    return null;
  }

  const formatDate = (date: any) => {
    if (!date) return "Not assessed yet";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Not assessed yet";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
      <div className="flex items-center px-6 py-4 gap-6">
        
        {/* Student Name */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate">
            {student.name}
          </h3>
        </div>

        {/* Age */}
        <div className="w-28 flex-shrink-0">
          <p className="text-sm text-gray-600">
            {student.age} years
          </p>
        </div>

        {/* Last Assessment */}
        <div className="flex-1 flex items-center space-x-2 min-w-0">
          <Calendar size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate">
            {formatDate(student.lastAssessmentDate)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => router.push(`/student/${student.id}`)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            title="Start Assessment"
          >
            <Play size={16} />
            <span>Start Test</span>
          </button>

          <button
            onClick={() => router.push(`/student/${student.id}`)}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            title="View Profile"
          >
            <Eye size={16} />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
