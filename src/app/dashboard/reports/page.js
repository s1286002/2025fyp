"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllStudents } from "@/lib/studentUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getAllStudents();
        setStudents(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setError("Failed to load student data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const goToGlobalReport = () => {
    router.push("/dashboard/reports/global");
  };

  const goToStudentReport = (studentId) => {
    if (!studentId) return;
    router.push(`/dashboard/reports/${studentId}`);
  };

  const goToTestPage = () => {
    router.push("/dashboard/reports/test");
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Game Progress Reports</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Global Report</CardTitle>
              <CardDescription>
                View aggregated statistics across all students and games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                This report provides an overview of game activity, performance
                metrics, and trends across your entire student population.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={goToGlobalReport}
                  className="w-full"
                >
                  View Global Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Student Reports</CardTitle>
              <CardDescription>
                Choose a student to view their game progress report
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading student data...</p>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md text-red-600 border border-red-200">
                  {error}
                </div>
              ) : students.length === 0 ? (
                <div className="bg-yellow-50 p-4 rounded-md text-yellow-600 border border-yellow-200">
                  No students found. Add students to view their reports.
                </div>
              ) : (
                <>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name || student.userName || student.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => goToStudentReport(selectedStudent)}
                      disabled={!selectedStudent}
                    >
                      View Student Report
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
