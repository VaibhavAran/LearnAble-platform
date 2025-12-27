"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import SearchFilter from "../components/SearchFilter";
import StudentCard from "../components/StudentCard";
import AddStudentModal from "../components/AddStudentModal";
import { Plus, Loader2 } from "lucide-react";


export default function Dashboard() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingAssessments, setPendingAssessments] = useState(0);
  const [reportsReady, setReportsReady] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      } else {
        const name = localStorage.getItem("userName");
        if (name) setUserName(name);
        fetchStudents();
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    filterStudents();
    calculateStats();
  }, [students, searchQuery]);

  // 🔹 Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "students"),
        where("teacherId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const studentData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unknown",
          age: data.age || 0,
          dateOfBirth: data.dateOfBirth || null,
          parentContact: data.parentContact || "",
          teacherId: data.teacherId || "",
          teacherName: data.teacherName || "",
          lastAssessmentDate: data.lastAssessmentDate || null,
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        };
      });

      // Sort newest first
      studentData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setStudents(studentData);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Error loading students. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Search (name only)
  const filterStudents = () => {
    let filtered = [...students];

    if (searchQuery) {
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  // 🔹 Stats
  const calculateStats = () => {
    const total = students.length;
    setTotalStudents(total);

    const pending = students.filter(
      (s) => !s.lastAssessmentDate
    ).length;
    setPendingAssessments(pending);

    const ready = students.filter(
      (s) => s.lastAssessmentDate
    ).length;
    setReportsReady(ready);
  };

  const handleStudentAdded = () => {
    fetchStudents();
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar userName={userName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-600">
            Track and support your childs learning journey
          </p>
        </div>

        {/* Stats */}
        <StatsCards
          totalStudents={totalStudents}
          pendingAssessments={pendingAssessments}
          reportsReady={reportsReady}
        />

        {/* Students Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Students
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredStudents.length}{" "}
                {filteredStudents.length === 1
                  ? "student"
                  : "students"}
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl shadow-md font-medium"
            >
              <Plus size={20} />
              <span>Add Student</span>
            </button>
          </div>

          {/* Search */}
          <SearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-7xl mb-4">
                {students.length === 0 ? "📚" : "🔍"}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {students.length === 0
                  ? "No students yet"
                  : "No students found"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {students.length === 0
                  ? "Add your first student to begin"
                  : "Try adjusting your search"}
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg mb-2">
                <div className="flex items-center px-6 py-3 gap-6">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Student Name
                    </p>
                  </div>
                  <div className="w-28">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Age
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Last Assessment
                    </p>
                  </div>
                  <div style={{ width: "220px" }}>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </p>
                  </div>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onStudentAdded={handleStudentAdded}
      />


    </div>
  );
}
