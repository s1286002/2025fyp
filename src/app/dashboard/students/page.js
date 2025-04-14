"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StudentCard from "@/components/students/StudentCard";
import AddStudentForm from "@/components/students/AddStudentForm";
import { getAllStudents } from "@/lib/studentUtils";
import { toast } from "sonner";

export default function StudentOverviewPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      if (!user?.uid) return;

      try {
        const studentData = await getAllStudents();
        setStudents(studentData);
      } catch (error) {
        console.error("Error loading students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [user]);

  const handleAddStudent = (newStudent) => {
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleUpdateStudent = (studentId, updates) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, ...updates } : student
      )
    );
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Overview</h1>
        </div>

        <AddStudentForm onStudentAdded={handleAddStudent} />

        {loading ? (
          <div className="text-center py-8">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No students found. Add students to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onUpdate={handleUpdateStudent}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
