"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentProgressStats } from "@/lib/reportUtils";
import { getGlobalErrorPatterns } from "@/lib/errorPatternsUtil";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard, GameStatCard } from "@/components/reports/ReportCard";
import {
  GameActivityTrend,
  ScoreTrend,
  GameComparisonChart,
} from "@/components/reports/ChartComponents";
import { ErrorPatternsSection } from "@/components/reports/ErrorPatternsComponents";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Chart colors
const CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function StudentReportPage({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { studentId } = unwrappedParams;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [errorPatternData, setErrorPatternData] = useState(null);
  const [errorPatternLoading, setErrorPatternLoading] = useState(false);

  // Fetch student data
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const data = await getStudentProgressStats(studentId);
      setReportData(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch student report data:", err);
      setError("Failed to load student report data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch error pattern data
  const fetchErrorPatternData = async (gameId = null) => {
    if (!studentId) return;

    try {
      setErrorPatternLoading(true);
      const filters = {
        studentId,
        limit: 50,
      };

      if (gameId) {
        filters.gameId = gameId;
      }

      const data = await getGlobalErrorPatterns(filters);
      setErrorPatternData(data);
    } catch (err) {
      console.error("Failed to fetch error pattern data:", err);
      // Don't set the global error state here to avoid disrupting the entire page
    } finally {
      setErrorPatternLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  // Load error pattern data when tab is selected
  useEffect(() => {
    if (activeTab === "errorPatterns" && studentId && !errorPatternData) {
      fetchErrorPatternData();
    }
  }, [activeTab, studentId, errorPatternData]);

  // Handle game selection
  const handleGameSelect = (gameType) => {
    setSelectedGameType(gameType);
    setActiveTab("gameDetails");
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading student report...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Student Report</h1>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/reports")}
            >
              Back to Reports
            </Button>
          </div>
          <div className="bg-red-50 p-6 rounded-md text-red-600 border border-red-200">
            {error}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!reportData) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Student Report</h1>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/reports")}
            >
              Back to Reports
            </Button>
          </div>
          <div className="text-center p-8">
            <p>No report data available for this student</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Extract game types for rendering tabs
  const gameTypes = Object.keys(reportData.gameStats);

  // Format data for the activity comparison chart
  const gameComparisonData = gameTypes.map((gameType) => {
    const gameStats = reportData.gameStats[gameType];
    return {
      gameType,
      gameName: gameStats.gameName,
      playCount: gameStats.totalPlayCount || gameStats.playCount || 0,
      avgScore: gameStats.avgScore || 0,
    };
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Student Report</h1>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/reports")}
          >
            Back to Reports
          </Button>
        </div>

        {/* Student Profile Card */}
        <Card className="mb-6">
          <CardContent className="flex items-center gap-4 p-6">
            <div>
              <h2 className="text-2xl font-bold">{reportData.student.name}</h2>
              <p className="text-gray-500">{reportData.student.email}</p>
              {reportData.bestGame && (
                <Badge className="mt-2 bg-green-500">
                  Best at: {reportData.bestGame.gameName}
                </Badge>
              )}
            </div>
            <div className="ml-auto">
              <StatCard
                title="Total Games Played"
                value={reportData.totalPlayCount}
                className="border-0 shadow-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gameDetails">Game Details</TabsTrigger>
            <TabsTrigger value="progress">Progress Trends</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="errorPatterns">Error Patterns</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gameTypes.map((gameType) => {
                const gameStats = reportData.gameStats[gameType];
                return (
                  <Card
                    key={gameType}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleGameSelect(gameType)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle>{gameStats.gameName}</CardTitle>
                      <CardDescription>
                        Played{" "}
                        {gameStats.totalPlayCount || gameStats.playCount || 0}{" "}
                        times
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Average Score</p>
                          <p className="text-lg font-medium">
                            {gameStats.avgScore?.toFixed(1) || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Completion Rate
                          </p>
                          <p className="text-lg font-medium">
                            {(gameStats.completionRate * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Game Activity Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <GameComparisonChart data={gameComparisonData} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Game Details Tab */}
          <TabsContent value="gameDetails" className="space-y-6">
            <div className="flex space-x-4 mb-4">
              {gameTypes.map((gameType) => (
                <Button
                  key={gameType}
                  variant={
                    selectedGameType === gameType ? "default" : "outline"
                  }
                  onClick={() => setSelectedGameType(gameType)}
                >
                  {reportData.gameStats[gameType].gameName}
                </Button>
              ))}
            </div>

            {selectedGameType && (
              <div className="space-y-6">
                {/* Show GameStatCard only for non-Game1 games */}
                {selectedGameType !== "Game1" && (
                  <GameStatCard
                    gameData={reportData.gameStats[selectedGameType]}
                    className="w-full"
                  />
                )}

                {/* Game1 Specific Content */}
                {selectedGameType === "Game1" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Level Completion</CardTitle>
                      <CardDescription>
                        汉字图片连连看 - Level details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Level Progress Bar */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">
                              Level Completion
                            </span>
                            <span className="text-sm font-medium">
                              {
                                Object.keys(
                                  reportData.gameStats.Game1.levelHighScores ||
                                    {}
                                ).length
                              }{" "}
                              / 8 Levels
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-gray-200 rounded-full">
                            <div
                              className="h-2.5 bg-green-500 rounded-full"
                              style={{
                                width: `${
                                  (Object.keys(
                                    reportData.gameStats.Game1
                                      .levelHighScores || {}
                                  ).length /
                                    8) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Level High Scores */}
                        <div>
                          <h3 className="text-md font-semibold mb-3">
                            Level High Scores
                          </h3>
                          <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: 8 }, (_, i) => i + 1).map(
                              (level) => {
                                const score =
                                  reportData.gameStats.Game1.levelHighScores?.[
                                    level
                                  ] || 0;
                                const maxScore = 50;
                                const percentage = (score / maxScore) * 100;

                                return (
                                  <div
                                    key={level}
                                    className="border rounded-md p-3"
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-medium">
                                        Level {level}
                                      </span>
                                      <span
                                        className={`text-sm ${
                                          score === 0
                                            ? "text-gray-400"
                                            : score === maxScore
                                            ? "text-green-500 font-bold"
                                            : "text-amber-500"
                                        }`}
                                      >
                                        {score}/{maxScore}
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full">
                                      <div
                                        className={`h-1.5 rounded-full ${
                                          score === 0
                                            ? "bg-gray-300"
                                            : score === maxScore
                                            ? "bg-green-500"
                                            : "bg-amber-500"
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>

                        {/* Total Score */}
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h3 className="text-md font-semibold mb-2">
                            Total Game Score
                          </h3>
                          <div className="text-3xl font-bold">
                            {reportData.gameStats.Game1.totalScore || 0}
                            <span className="text-sm text-gray-500 font-normal ml-2">
                              / 400 (Perfect Score)
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!selectedGameType && (
              <div className="text-center p-6 bg-gray-50 rounded-md">
                <p>Please select a game to view details</p>
              </div>
            )}
          </TabsContent>

          {/* Progress Trends Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Progress Trends</CardTitle>
                <CardDescription>
                  Activity frequency and score improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gameTypes.map((gameType, index) => {
                  const gameStats = reportData.gameStats[gameType];
                  return (
                    <div
                      key={gameType}
                      className="mb-8 pb-6 border-b last:border-b-0 last:mb-0 last:pb-0"
                    >
                      <h3 className="text-md font-semibold mb-4">
                        {gameStats.gameName}
                      </h3>
                      <div className="h-[300px]">
                        {/* Combined chart with activity and score */}
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={gameStats.playHistory}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="playCount"
                              name="Play Count"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="score"
                              name="Score"
                              stroke="#82ca9d"
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Game Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {reportData.recentGames &&
                  reportData.recentGames.length > 0 ? (
                    reportData.recentGames.map((game, index) => (
                      <div
                        key={index}
                        className="py-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{game.gameName}</p>
                          <p className="text-sm text-gray-500">{game.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{game.score}</p>
                          <Badge
                            variant={game.completed ? "default" : "outline"}
                            className={
                              game.completed
                                ? "bg-green-500"
                                : "text-amber-500 border-amber-500"
                            }
                          >
                            {game.completed ? "Completed" : "Incomplete"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      No recent activity found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error Patterns Tab */}
          <TabsContent value="errorPatterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Error Patterns</CardTitle>
                <CardDescription>
                  Analysis of error patterns and common mistakes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errorPatternLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : errorPatternData ? (
                  <ErrorPatternsSection errorPatternData={errorPatternData} />
                ) : (
                  <div className="text-center p-6">
                    <p>No error pattern data available for this student</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game-specific error pattern filter */}
            {errorPatternData &&
              errorPatternData.errorTypeDistribution &&
              errorPatternData.errorTypeDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Filter by Game</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={!selectedGameType ? "default" : "outline"}
                        onClick={() => {
                          setSelectedGameType(null);
                          fetchErrorPatternData();
                        }}
                      >
                        All Games
                      </Button>
                      {errorPatternData.errorTypeDistribution.map(
                        (gameError) => (
                          <Button
                            key={gameError.gameType}
                            variant={
                              selectedGameType === gameError.gameType
                                ? "default"
                                : "outline"
                            }
                            onClick={() => {
                              setSelectedGameType(gameError.gameType);
                              fetchErrorPatternData(gameError.gameType);
                            }}
                          >
                            {gameError.gameName}
                          </Button>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
