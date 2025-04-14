"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Game1RecordCard from "@/components/game-records/Game1RecordCard";
import Game2RecordCard from "@/components/game-records/Game2RecordCard";
import { getAllStudentsGameRecords } from "@/lib/gameRecordUtils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GameRecordsPage() {
  const { user } = useAuth();
  const [game1Records, setGame1Records] = useState([]);
  const [game2Records, setGame2Records] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGameRecords = async () => {
      if (!user?.uid) return;

      try {
        const [game1Data, game2Data] = await Promise.all([
          getAllStudentsGameRecords("Game1"),
          getAllStudentsGameRecords("Game2"),
        ]);

        setGame1Records(game1Data);
        setGame2Records(game2Data);
      } catch (error) {
        console.error("Error loading game records:", error);
        toast.error("Failed to load game records");
      } finally {
        setLoading(false);
      }
    };

    loadGameRecords();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading game records...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Game Records</h1>
        </div>

        <Tabs defaultValue="game1" className="space-y-4">
          <TabsList>
            <TabsTrigger value="game1">Game 1</TabsTrigger>
            <TabsTrigger value="game2">Game 2</TabsTrigger>
          </TabsList>

          <TabsContent value="game1" className="space-y-4">
            {game1Records.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No Game 1 records found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {game1Records.map((record) => (
                  <Game1RecordCard key={record.studentId} record={record} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="game2" className="space-y-4">
            {game2Records.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No Game 2 records found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {game2Records.map((record) => (
                  <Game2RecordCard key={record.studentId} record={record} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
