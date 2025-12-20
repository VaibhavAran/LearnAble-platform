"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { db } from "../../firebase/config";
import { doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onStudentUpdated: () => void;
}

export default function EditStudentModal({
  isOpen,
  onClose,
  student,
  onStudentUpdated,
}: EditStudentModalProps) {
  const router = useRouter();

  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [studentDOB, setStudentDOB] = useState("");
  const [parentContact, setParentContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      setStudentName(student.name || "");
      setStudentAge(student.age?.toString() || "");
      setStudentDOB(student.dateOfBirth || "");
      setParentContact(student.parentContact || "");
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const studentRef = doc(db, "students", student.id);

      await updateDoc(studentRef, {
        name: studentName.trim(),
        age: ageNumber,
        dateOfBirth: studentDOB || null,
        parentContact: parentContact || "",
        updatedAt: Timestamp.now(),
      });

      alert("✅ Student updated successfully!");
      onStudentUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await deleteDoc(doc(db, "students", student.id));
      alert("✅ Student deleted successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
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
              <Save className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Edit Student
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
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          
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
              placeholder="1 - 10"
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

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-4">
            <div className="flex space-x-3">
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
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                showDeleteConfirm
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-50 hover:bg-red-100 text-red-600"
              }`}
            >
              <Trash2 size={18} />
              <span>
                {showDeleteConfirm
                  ? "Click again to confirm delete"
                  : "Delete Student"}
              </span>
            </button>

            {showDeleteConfirm && (
              <p className="text-xs text-red-600 text-center">
                ⚠️ This action cannot be undone. All student data will be lost.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
