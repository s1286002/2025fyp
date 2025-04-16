"use client";

import { useState, useEffect } from "react";
import {
  getGlobalProgressStats,
  getGlobalErrorPatterns,
  getStudentErrorPatterns,
} from "@/lib/reportUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Input } from "@/components/ui/input";

export default function TestReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [errorPatternData, setErrorPatternData] = useState(null);
  const [errorPatternType, setErrorPatternType] = useState("global"); // 'global' or 'student'

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get global stats with no filters (all data)
      const globalStats = await getGlobalProgressStats();
      setData(globalStats);
      setSelectedGameType(null);
      console.log("Global stats:", globalStats);
    } catch (err) {
      setError(err.message || "Error fetching data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by game type
  const fetchFilteredData = async (gameType) => {
    setLoading(true);
    setError(null);
    try {
      const filteredStats = await getGlobalProgressStats({ gameType });
      setData(filteredStats);
      setSelectedGameType(gameType);
      console.log(`Filtered stats for ${gameType}:`, filteredStats);
    } catch (err) {
      setError(err.message || "Error fetching filtered data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch global error patterns
  const fetchGlobalErrorPatterns = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = selectedGameType ? { gameType: selectedGameType } : {};
      const errorPatterns = await getGlobalErrorPatterns(filters);
      setErrorPatternData(errorPatterns);
      setErrorPatternType("global");
      setActiveTab("errorPatterns");
      console.log("Global error patterns:", errorPatterns);
    } catch (err) {
      setError(err.message || "Error fetching error patterns");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student error patterns
  const fetchStudentErrorPatterns = async () => {
    if (!studentId.trim()) {
      setError("请输入学生ID");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const filters = selectedGameType ? { gameType: selectedGameType } : {};
      const errorPatterns = await getStudentErrorPatterns(studentId, filters);
      setErrorPatternData(errorPatterns);
      setErrorPatternType("student");
      setActiveTab("errorPatterns");
      console.log("Student error patterns:", errorPatterns);
    } catch (err) {
      setError(err.message || "Error fetching student error patterns");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format data for display
  const renderSummary = () => {
    if (!data) return null;

    return (
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">总游戏次数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalPlayCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">参与学生数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalStudents}</div>
            </CardContent>
          </Card>
        </div>

        {selectedGameType &&
          data.gameTypeStats &&
          data.gameTypeStats.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                游戏特定指标 - {data.gameTypeStats[0].gameName}
              </h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">平均分数</p>
                      <p className="text-lg font-medium">
                        {data.gameTypeStats[0].avgScore?.toFixed(1) || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">最高分数</p>
                      <p className="text-lg font-medium">
                        {data.gameTypeStats[0].highestScore || "N/A"}
                      </p>
                    </div>
                    {data.gameTypeStats[0].scoreDistribution && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 mb-2">分数分布</p>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(
                            data.gameTypeStats[0].scoreDistribution
                          ).map(([range, count]) => (
                            <div
                              key={range}
                              className="bg-gray-100 rounded p-2 text-center"
                            >
                              <p className="text-xs text-gray-500">{range}</p>
                              <p className="text-sm font-medium">{count} 次</p>
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

  const renderGameTypeStats = () => {
    if (!data || !data.gameTypeStats) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">游戏类型统计</h3>
        <div className="grid gap-6">
          {data.gameTypeStats.map((game) => (
            <Card key={game.gameType}>
              <CardHeader>
                <CardTitle>{game.gameName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">游戏次数</p>
                    <p className="text-lg font-medium">{game.playCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">参与学生数</p>
                    <p className="text-lg font-medium">{game.uniqueStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">平均分数</p>
                    <p className="text-lg font-medium">
                      {game.avgScore?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">最高分数</p>
                    <p className="text-lg font-medium">
                      {game.highestScore || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">完成率</p>
                    <p className="text-lg font-medium">
                      {(game.completionRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {game.scoreDistribution && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">分数分布</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(game.scoreDistribution).map(
                        ([range, count]) => (
                          <div
                            key={range}
                            className="bg-gray-100 rounded p-2 text-center"
                          >
                            <p className="text-xs text-gray-500">{range}</p>
                            <p className="text-sm font-medium">{count} 次</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => fetchFilteredData(game.gameType)}
                >
                  查看此游戏统计
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeTrend = () => {
    if (!data || !data.trendsByGameType) return null;

    // 如果已选择特定游戏，只显示该游戏的趋势
    const gameTypes = selectedGameType
      ? [selectedGameType]
      : Object.keys(data.trendsByGameType);

    return (
      <div className="mt-6">
        {gameTypes.map((gameType) => {
          const gameName =
            data.gameTypeStats?.find((g) => g.gameType === gameType)
              ?.gameName || gameType;
          const trends = data.trendsByGameType[gameType];

          return (
            <div key={gameType} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                时间趋势 - {gameName}（最近7天）
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">日期</th>
                    <th className="border p-2 text-left">游戏次数</th>
                    <th className="border p-2 text-left">平均分数</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((day) => (
                    <tr key={day.date}>
                      <td className="border p-2">{day.date}</td>
                      <td className="border p-2">{day.playCount}</td>
                      <td className="border p-2">
                        {day.avgScore?.toFixed(1) || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRawData = () => {
    if (!data || !data.rawData) return null;

    return (
      <div className="mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">原始数据（最多100条）</h3>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">学生</th>
              <th className="border p-2 text-left">游戏</th>
              <th className="border p-2 text-left">分数</th>
              <th className="border p-2 text-left">完成</th>
              <th className="border p-2 text-left">时间</th>
            </tr>
          </thead>
          <tbody>
            {data.rawData.map((record) => (
              <tr key={record.id}>
                <td className="border p-2">{record.id.substring(0, 6)}...</td>
                <td className="border p-2">{record.userName}</td>
                <td className="border p-2">{record.gameName}</td>
                <td className="border p-2">{record.Score}</td>
                <td className="border p-2">
                  {record.IsCompleted ? "是" : "否"}
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

  // Render error patterns tab
  const renderErrorPatterns = () => {
    if (!errorPatternData) return null;

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {errorPatternType === "global"
              ? "全局错误模式分析"
              : `学生错误模式分析 - ${studentId}`}
          </h3>

          {/* Error Type Distribution */}
          <div className="mb-8">
            <h4 className="text-md font-medium mb-3">错误类型分布</h4>
            {errorPatternData.errorTypeDistribution &&
            errorPatternData.errorTypeDistribution.length > 0 ? (
              <div className="space-y-6">
                {errorPatternData.errorTypeDistribution.map(
                  (gameError, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {gameError.gameName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {gameError.errorPatterns &&
                        gameError.errorPatterns.length > 0 ? (
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border p-2 text-left">
                                  错误答案
                                </th>
                                <th className="border p-2 text-left">知识点</th>
                                <th className="border p-2 text-left">
                                  错误次数
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {gameError.errorPatterns.map((error, idx) => (
                                <tr key={idx}>
                                  <td className="border p-2">
                                    {error.wrongAnswer}
                                  </td>
                                  <td className="border p-2">
                                    {error.knowledgePoint}
                                  </td>
                                  <td className="border p-2">{error.count}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-gray-500">没有错误记录</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500">没有错误类型分布数据</p>
            )}
          </div>

          {/* Error Frequency Trend */}
          <div className="mb-8">
            <h4 className="text-md font-medium mb-3">
              错误频率趋势（最近7天）
            </h4>
            {errorPatternData.errorFrequencyTrend &&
            errorPatternData.errorFrequencyTrend.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">日期</th>
                    <th className="border p-2 text-left">游戏类型</th>
                    <th className="border p-2 text-left">错误数</th>
                    <th className="border p-2 text-left">常见错误</th>
                  </tr>
                </thead>
                <tbody>
                  {errorPatternData.errorFrequencyTrend.map((day, dayIndex) =>
                    day.dailyErrors.length > 0 ? (
                      day.dailyErrors.map((error, errorIndex) => (
                        <tr key={`${dayIndex}-${errorIndex}`}>
                          {errorIndex === 0 && (
                            <td
                              className="border p-2"
                              rowSpan={day.dailyErrors.length}
                            >
                              {day.date}
                            </td>
                          )}
                          <td className="border p-2">{error.gameName}</td>
                          <td className="border p-2">{error.errorCount}</td>
                          <td className="border p-2">
                            {error.commonErrors.join(", ")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr key={dayIndex}>
                        <td className="border p-2">{day.date}</td>
                        <td className="border p-2 text-center" colSpan={3}>
                          无错误记录
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">没有错误频率趋势数据</p>
            )}
          </div>

          {/* Error Concentration (Only for Global) */}
          {errorPatternType === "global" &&
            errorPatternData.errorConcentration && (
              <div>
                <h4 className="text-md font-medium mb-3">错误集中领域分析</h4>
                {errorPatternData.errorConcentration.length > 0 ? (
                  <div className="space-y-6">
                    {errorPatternData.errorConcentration.map(
                      (gameData, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">
                              {gameData.gameName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {gameData.knowledgePoints &&
                            gameData.knowledgePoints.length > 0 ? (
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border p-2 text-left">
                                      知识点
                                    </th>
                                    <th className="border p-2 text-left">
                                      错误次数
                                    </th>
                                    <th className="border p-2 text-left">
                                      学生数
                                    </th>
                                    <th className="border p-2 text-left">
                                      难度系数
                                    </th>
                                    <th className="border p-2 text-left">
                                      常见错误
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {gameData.knowledgePoints.map((kp, idx) => (
                                    <tr key={idx}>
                                      <td className="border p-2">{kp.point}</td>
                                      <td className="border p-2">
                                        {kp.errorCount}
                                      </td>
                                      <td className="border p-2">
                                        {kp.uniqueStudents}
                                      </td>
                                      <td className="border p-2">
                                        {kp.difficulty.toFixed(2)}
                                      </td>
                                      <td className="border p-2">
                                        {kp.commonWrongAnswers
                                          .map(
                                            (wa) => `${wa.answer} (${wa.count})`
                                          )
                                          .join(", ")}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-gray-500">
                                没有知识点错误数据
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">没有错误集中领域数据</p>
                )}
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {selectedGameType
              ? `${
                  data?.gameTypeStats[0]?.gameName || selectedGameType
                } 游戏统计`
              : "全局游戏进度统计"}
          </h1>
          <div className="flex gap-4">
            <Button onClick={fetchData} disabled={loading}>
              {loading ? "加载中..." : "获取全部数据"}
            </Button>
            <Button variant="outline" onClick={() => setData(null)}>
              清除数据
            </Button>
          </div>
        </div>

        {/* Error Pattern Test Controls */}
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h2 className="text-lg font-medium mb-3">错误模式测试</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm mb-1">学生ID (可选)</label>
              <Input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="输入学生ID"
                className="w-64"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">游戏类型 (可选)</label>
              <select
                value={selectedGameType || ""}
                onChange={(e) => setSelectedGameType(e.target.value || null)}
                className="p-2 border rounded-md w-40"
              >
                <option value="">所有游戏</option>
                <option value="Game1">汉字图片连连看</option>
                <option value="Game2">汉字偏旁消消乐</option>
                <option value="Game3">量词贪吃蛇</option>
              </select>
            </div>
            <Button
              onClick={fetchGlobalErrorPatterns}
              disabled={loading}
              variant="default"
            >
              获取全局错误模式
            </Button>
            <Button
              onClick={fetchStudentErrorPatterns}
              disabled={loading}
              variant="secondary"
            >
              获取学生错误模式
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {selectedGameType && (
          <div className="mb-4">
            <Button variant="outline" size="sm" onClick={() => fetchData()}>
              返回全局概览
            </Button>
          </div>
        )}

        {(data || errorPatternData) && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="summary">总体统计</TabsTrigger>
              <TabsTrigger value="gameTypes">游戏类型</TabsTrigger>
              <TabsTrigger value="timeTrend">时间趋势</TabsTrigger>
              <TabsTrigger value="rawData">原始数据</TabsTrigger>
              <TabsTrigger value="errorPatterns">错误模式</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">{renderSummary()}</TabsContent>
            <TabsContent value="gameTypes">{renderGameTypeStats()}</TabsContent>
            <TabsContent value="timeTrend">{renderTimeTrend()}</TabsContent>
            <TabsContent value="rawData">{renderRawData()}</TabsContent>
            <TabsContent value="errorPatterns">
              {renderErrorPatterns()}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ProtectedRoute>
  );
}
