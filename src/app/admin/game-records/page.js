"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { getRawGameRecords } from "@/lib/gameRecordUtils";

export default function GameRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("Game1");
  const [levelFilter, setLevelFilter] = useState("all");

  const fetchGameRecords = async (gameId) => {
    try {
      setLoading(true);
      const recordsData = await getRawGameRecords(gameId);
      setRecords(recordsData);
    } catch (error) {
      console.error("Error fetching game records:", error);
      toast.error("Failed to fetch game records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameRecords(selectedGame);
  }, [selectedGame]);

  // Filter records based on search query and level
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      searchQuery === "" ||
      record.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      levelFilter === "all" || record.Level.toString() === levelFilter;

    return matchesSearch && matchesLevel;
  });

  // Get unique levels for filter options
  const uniqueLevels = [...new Set(records.map((record) => record.Level))].sort(
    (a, b) => a - b
  );

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Game Records</h1>
          <p className="text-gray-600">View and manage game records</p>
        </div>

        <Tabs
          defaultValue="Game1"
          value={selectedGame}
          onValueChange={setSelectedGame}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="Game1">Game 1</TabsTrigger>
            <TabsTrigger value="Game2">Game 2</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by username or record ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {uniqueLevels.map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  Level {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => fetchGameRecords(selectedGame)}
          >
            Refresh
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Loading records...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">
                        {record.id}
                      </TableCell>
                      <TableCell>{record.userName}</TableCell>
                      <TableCell>{record.Level}</TableCell>
                      <TableCell>{record.Score}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.IsCompleted
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {record.IsCompleted ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {record.datetime
                          ? format(record.datetime, "yyyy/MM/dd HH:mm:ss")
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
