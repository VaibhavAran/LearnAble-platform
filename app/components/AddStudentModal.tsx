"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { db, auth } from "../../firebase/config";
import { collection, addDoc, Timestamp } from "firebase/firestore";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: () => void;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onStudentAdded,
}: AddStudentModalProps) {
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [studentDOB, setStudentDOB] = useState("");
  const [parentContact, setParentContact] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Required fields validation
    if (!studentName || !studentAge) {
      alert("Please fill all required fields");
      return;
    }

    const ageNumber = parseInt(studentAge);
    if (ageNumber < 1 || ageNumber > 10) {
      alert("Age must be between 1 and 10");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login first");
        return;
      }

      await addDoc(collection(db, "students"), {
        name: studentName.trim(),
        age: ageNumber,
        dateOfBirth: studentDOB || null,
        parentContact: parentContact || "",
        teacherId: user.uid,
        teacherName: localStorage.getItem("userName") || "",
        lastAssessmentDate: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Reset form
      setStudentName("");
      setStudentAge("");
      setStudentDOB("");
      setParentContact("");

      onStudentAdded();
      alert("✅ Student added successfully!");
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserPlus className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Add New Student
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={studentAge}
              onChange={(e) => setStudentAge(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Date of Birth (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="date"
              value={studentDOB}
              onChange={(e) => setStudentDOB(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> LearnAble analyzes learning patterns for
              children aged 1–10 using short, interactive games.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
