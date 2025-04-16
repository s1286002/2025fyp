"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGlobalProgressStats } from "@/lib/reportUtils";
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
import {
  BarChart,
  PieChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell,
} from "recharts";

// Sample colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function GlobalReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedGameType, setSelectedGameType] = useState(null);

  // Fetch all game data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const data = await getGlobalProgressStats();
      setReportData(data);
      setSelectedGameType(null);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch global report data:", err);
      setError("Failed to load report data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for a specific game
  const fetchGameData = async (gameType) => {
    try {
      setLoading(true);
      const data = await getGlobalProgressStats({ gameType });
      setReportData(data);
      setSelectedGameType(gameType);
      setError(null);
    } catch (err) {
      console.error(`Failed to fetch data for ${gameType}:`, err);
      setError(`Failed to load data for ${gameType}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading report data...</p>
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
            <h1 className="text-3xl font-bold">Global Game Reports</h1>
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
            <h1 className="text-3xl font-bold">Global Game Reports</h1>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/reports")}
            >
              Back to Reports
            </Button>
          </div>
          <div className="text-center p-8">
            <p>No report data available</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Get header title based on selected game
  const getReportTitle = () => {
    if (selectedGameType) {
      const gameName =
        reportData.gameTypeStats[0]?.gameName || selectedGameType;
      return `${gameName} Game Report`;
    }
    return "Global Game Reports";
  };

  // Render summary section
  const renderSummary = () => {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Games Played
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.totalPlayCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.totalStudents}
              </div>
            </CardContent>
          </Card>

          {!selectedGameType ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.gameTypeStats.length}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.gameTypeStats[0]?.avgScore?.toFixed(1) || "N/A"}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedGameType && reportData.gameTypeStats[0]
                  ? `${(
                      reportData.gameTypeStats[0].completionRate * 100
                    ).toFixed(1)}%`
                  : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedGameType &&
          reportData.gameTypeStats &&
          reportData.gameTypeStats.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Game Details - {reportData.gameTypeStats[0].gameName}
              </h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Play Count</p>
                      <p className="text-lg font-medium">
                        {reportData.gameTypeStats[0].playCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Unique Students</p>
                      <p className="text-lg font-medium">
                        {reportData.gameTypeStats[0].uniqueStudents}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Score</p>
                      <p className="text-lg font-medium">
                        {reportData.gameTypeStats[0].avgScore?.toFixed(1) ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Highest Score</p>
                      <p className="text-lg font-medium">
                        {reportData.gameTypeStats[0].highestScore || "N/A"}
                      </p>
                    </div>
                    {reportData.gameTypeStats[0].scoreDistribution && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 mb-2">
                          Score Distribution
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(
                            reportData.gameTypeStats[0].scoreDistribution
                          ).map(([range, count]) => (
                            <div
                              key={range}
                              className="bg-gray-100 rounded p-2 text-center"
                            >
                              <p className="text-xs text-gray-500">{range}</p>
                              <p className="text-sm font-medium">{count}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    );
  };

  // Render game type stats
  const renderGameTypeStats = () => {
    if (!reportData.gameTypeStats) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Game Type Statistics</h3>
        <div className="grid gap-6">
          {reportData.gameTypeStats.map((game) => {
            const trends = reportData.trendsByGameType?.[game.gameType] || [];

            return (
              <Card key={game.gameType}>
                <CardHeader>
                  <CardTitle>{game.gameName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Play Count</p>
                      <p className="text-lg font-medium">{game.playCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Unique Students</p>
                      <p className="text-lg font-medium">
                        {game.uniqueStudents}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Score</p>
                      <p className="text-lg font-medium">
                        {game.avgScore?.toFixed(1) || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Highest Score</p>
                      <p className="text-lg font-medium">
                        {game.highestScore || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completion Rate</p>
                      <p className="text-lg font-medium">
                        {(game.completionRate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {game.scoreDistribution && (
                    <div className="mt-4 mb-6">
                      <p className="text-sm text-gray-500 mb-2">
                        Score Distribution
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(game.scoreDistribution).map(
                          ([range, count]) => (
                            <div
                              key={range}
                              className="bg-gray-100 rounded p-2 text-center"
                            >
                              <p className="text-xs text-gray-500">{range}</p>
                              <p className="text-sm font-medium">{count}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {trends && trends.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 font-medium mb-2">
                        Average Score Trend (Last 7 Days)
                      </p>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="avgScore"
                              stroke="#82ca9d"
                              name="Average Score"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Render time trends
  const renderTimeTrend = () => {
    if (!reportData.trendsByGameType) return null;

    // If selected specific game, only show that game's trends
    const gameTypes = selectedGameType
      ? [selectedGameType]
      : Object.keys(reportData.trendsByGameType);

    if (gameTypes.length === 0) return null;

    // For single game view
    if (selectedGameType) {
      const gameName =
        reportData.gameTypeStats?.find((g) => g.gameType === selectedGameType)
          ?.gameName || selectedGameType;
      const trends = reportData.trendsByGameType[selectedGameType];

      if (!trends || trends.length === 0) return null;

      return (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Play Count Trend - {gameName} (Last 7 Days)
          </h3>

          <Card>
            <CardHeader>
              <CardTitle>Play Count Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="playCount"
                    stroke="#8884d8"
                    name="Play Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      );
    }

    // For multiple games view - combined chart
    // First, get all unique dates across all game types
    const allDates = new Set();
    gameTypes.forEach((gameType) => {
      const trends = reportData.trendsByGameType[gameType] || [];
      trends.forEach((trend) => allDates.add(trend.date));
    });

    // Create combined data with all games
    const combinedData = Array.from(allDates)
      .sort()
      .map((date) => {
        const dataPoint = { date };

        gameTypes.forEach((gameType) => {
          const gameTrends = reportData.trendsByGameType[gameType] || [];
          const dayTrend = gameTrends.find((t) => t.date === date);
          const gameName =
            reportData.gameTypeStats?.find((g) => g.gameType === gameType)
              ?.gameName || gameType;

          // Use game name as the key to make it more readable in the chart
          dataPoint[gameName] = dayTrend ? dayTrend.playCount : 0;
        });

        return dataPoint;
      });

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">
          Combined Play Count Trends (Last 7 Days)
        </h3>

        <Card>
          <CardHeader>
            <CardTitle>Play Count by Game</CardTitle>
            <CardDescription>
              Comparison of activity across all games
            </CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {gameTypes.map((gameType, index) => {
                  const gameName =
                    reportData.gameTypeStats?.find(
                      (g) => g.gameType === gameType
                    )?.gameName || gameType;
                  return (
                    <Line
                      key={gameType}
                      type="monotone"
                      dataKey={gameName}
                      stroke={COLORS[index % COLORS.length]}
                      name={gameName}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Detailed Play Count Data
          </h3>
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Date</th>
                {gameTypes.map((gameType) => {
                  const gameName =
                    reportData.gameTypeStats?.find(
                      (g) => g.gameType === gameType
                    )?.gameName || gameType;
                  return (
                    <th key={gameType} className="border p-2 text-left">
                      {gameName}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {combinedData.map((day) => (
                <tr key={day.date}>
                  <td className="border p-2">{day.date}</td>
                  {gameTypes.map((gameType) => {
                    const gameName =
                      reportData.gameTypeStats?.find(
                        (g) => g.gameType === gameType
                      )?.gameName || gameType;
                    return (
                      <td key={gameType} className="border p-2">
                        {day[gameName]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render raw data
  const renderRawData = () => {
    if (!reportData.rawData) return null;

    return (
      <div className="mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">
          Raw Data (Limited to 100 records)
        </h3>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Student</th>
              <th className="border p-2 text-left">Game</th>
              <th className="border p-2 text-left">Score</th>
              <th className="border p-2 text-left">Completed</th>
              <th className="border p-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {reportData.rawData.map((record) => (
              <tr key={record.id}>
                <td className="border p-2">
                  {record.id?.substring(0, 6) || ""}...
                </td>
                <td className="border p-2">{record.userName}</td>
                <td className="border p-2">{record.gameName}</td>
                <td className="border p-2">{record.Score}</td>
                <td className="border p-2">
                  {record.IsCompleted ? "Yes" : "No"}
                </td>
                <td className="border p-2">
                  {record.datetime instanceof Date
                    ? record.datetime.toLocaleString()
                    : new Date(record.datetime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{getReportTitle()}</h1>
          <div className="flex gap-4">
            {selectedGameType && (
              <Button variant="outline" onClick={fetchAllData}>
                Return to Global Overview
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/reports")}
            >
              Back to Reports
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="gameTypes">Game Types</TabsTrigger>
            <TabsTrigger value="timeTrend">Time Trends</TabsTrigger>
            <TabsTrigger value="rawData">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">{renderSummary()}</TabsContent>
          <TabsContent value="gameTypes">{renderGameTypeStats()}</TabsContent>
          <TabsContent value="timeTrend">{renderTimeTrend()}</TabsContent>
          <TabsContent value="rawData">{renderRawData()}</TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
