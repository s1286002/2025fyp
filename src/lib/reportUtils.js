import {
  getStudentGameStats,
  getAllStudentsGameRecords,
  getRawGameRecords,
} from "@/lib/gameRecordUtils";
import { getAllStudents, getStudentById } from "@/lib/studentUtils";
import { getGlobalErrorPatterns as fetchGlobalErrorPatterns } from "@/lib/errorPatternsUtil";
import { format, subDays, parseISO, isAfter, isBefore } from "date-fns";
import { groupBy, orderBy, sumBy, meanBy, maxBy, minBy } from "lodash";

// 游戏配置数据
const GAME_CONFIG = {
  Game1: {
    name: "汉字图片连连看",
    scoreRanges: 50,
    errorPattern: {
      index: "unitNumber",
      wrongAnswer: "string",
      knowledgePoint: "unitNumber",
    },
  },
  Game2: {
    name: "汉字偏旁消消乐",
    scoreRanges: [
      { min: 0, max: 25, color: "bg-gray-200" },
      { min: 25, max: 50, color: "bg-green-200" },
      { min: 50, max: 75, color: "bg-green-300" },
      { min: 75, max: 100, color: "bg-green-400" },
      { min: 100, max: Infinity, color: "bg-green-500" },
    ],
    errorPattern: {
      // 未实现
    },
  },
  Game3: {
    name: "量词贪吃蛇",
    scoreRanges: [
      { min: 0, max: 1000, color: "bg-red-500" },
      { min: 1000, max: 2000, color: "bg-yellow-500" },
      { min: 2000, max: Infinity, color: "bg-green-500" },
    ],
    errorPattern: {
      index: "classifier",
      wrongAnswer: "word",
      knowledgePoint: "classifier",
    },
  },
};

/**
 * 获取全局游戏进度统计
 * @param {object} filters - 可选的筛选条件，如日期范围、游戏类型等
 * @returns {Promise<object>} - 全局进度统计数据
 */
export const getGlobalProgressStats = async (filters = {}) => {
  try {
    // 获取所有游戏的原始记录
    const gameTypes = Object.keys(GAME_CONFIG);
    const allRecordsPromises = gameTypes.map((gameId) =>
      getRawGameRecords(gameId)
    );
    const allRecordsResults = await Promise.all(allRecordsPromises);

    // 合并所有游戏记录
    let allRecords = [];
    allRecordsResults.forEach((records, index) => {
      // 添加游戏类型信息到每条记录
      const recordsWithGameType = records.map((record) => ({
        ...record,
        gameType: gameTypes[index],
        gameName: GAME_CONFIG[gameTypes[index]].name,
      }));
      allRecords = [...allRecords, ...recordsWithGameType];
    });

    // 应用筛选条件
    if (filters.startDate && filters.endDate) {
      allRecords = allRecords.filter((record) => {
        const recordDate =
          record.datetime instanceof Date
            ? record.datetime
            : new Date(record.datetime);
        return (
          isAfter(recordDate, new Date(filters.startDate)) &&
          isBefore(recordDate, new Date(filters.endDate))
        );
      });
    }

    if (filters.gameType) {
      allRecords = allRecords.filter(
        (record) => record.gameType === filters.gameType
      );
    }

    // 按时间排序
    allRecords = orderBy(allRecords, ["datetime"], ["desc"]);

    // 总体统计
    const totalPlayCount = allRecords.length;
    const totalStudents = new Set(allRecords.map((record) => record.userName))
      .size;

    // 按游戏类型分组
    const recordsByGameType = groupBy(allRecords, "gameType");
    const gameTypeStats = Object.keys(recordsByGameType).map((gameType) => {
      const records = recordsByGameType[gameType];
      const gameConfig = GAME_CONFIG[gameType];

      // 游戏特定指标
      let gameSpecificMetrics = {};

      // 根据游戏类型计算特定指标
      if (gameType === "Game1") {
        // 汉字图片连连看
        gameSpecificMetrics = {
          scoreDistribution: {
            "0-30": records.filter((r) => r.Score <= 30).length,
            "31-40": records.filter((r) => r.Score > 30 && r.Score <= 40)
              .length,
            "41-50": records.filter((r) => r.Score > 40).length,
          },
        };
      } else if (gameType === "Game3") {
        // 量词贪吃蛇
        gameSpecificMetrics = {
          scoreDistribution: {
            "0-1000": records.filter((r) => r.Score <= 1000).length,
            "1001-2000": records.filter(
              (r) => r.Score > 1000 && r.Score <= 2000
            ).length,
            "2000+": records.filter((r) => r.Score > 2000).length,
          },
        };
      }

      return {
        gameType,
        gameName: gameConfig.name,
        playCount: records.length,
        avgScore: meanBy(records, "Score"),
        highestScore: maxBy(records, "Score")?.Score,
        lowestScore: minBy(records, "Score")?.Score,
        completionRate:
          records.filter((r) => r.IsCompleted).length / records.length,
        uniqueStudents: new Set(records.map((r) => r.userName)).size,
        ...gameSpecificMetrics,
      };
    });

    // 按日期分组进行时间趋势分析 - 每种游戏分开统计
    const trendsByGameType = {};

    gameTypes.forEach((gameType) => {
      const gameRecords = allRecords.filter((r) => r.gameType === gameType);

      const recordsByDate = groupBy(gameRecords, (record) =>
        format(
          record.datetime instanceof Date
            ? record.datetime
            : new Date(record.datetime),
          "yyyy-MM-dd"
        )
      );

      trendsByGameType[gameType] = Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        return {
          date,
          playCount: (recordsByDate[date] || []).length,
          avgScore: meanBy(recordsByDate[date] || [], "Score") || 0,
        };
      }).reverse();
    });

    return {
      totalPlayCount,
      totalStudents,
      gameTypeStats,
      trendsByGameType,
      rawData: allRecords.slice(0, 100), // 限制返回的原始数据量
    };
  } catch (error) {
    console.error("Error in getGlobalProgressStats:", error);
    throw error;
  }
};

/**
 * 获取全局错误模式分析
 * @param {object} filters - 可选的筛选条件
 * @returns {Promise<object>} - 全局错误模式分析数据
 */
export const getGlobalErrorPatterns = async (filters = {}) => {
  try {
    // 使用新的错误模式分析工具
    return await fetchGlobalErrorPatterns(filters);
  } catch (error) {
    console.error("Error in getGlobalErrorPatterns:", error);
    throw error;
  }
};

/**
 * 获取学生游戏进度统计
 * @param {string} studentId - 学生ID
 * @param {object} filters - 可选的筛选条件
 * @returns {Promise<object>} - 学生进度统计数据
 */
export const getStudentProgressStats = async (studentId, filters = {}) => {
  try {
    // 获取学生信息
    const student = await getStudentById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // 获取学生的所有游戏记录
    const gameTypes = Object.keys(GAME_CONFIG);

    // First get raw records for each game type
    const rawRecordsPromises = gameTypes.map((gameId) => {
      return getRawGameRecords(gameId).then((records) =>
        records.filter((record) => record.UserId.id === studentId)
      );
    });

    // Then get processed statistics
    const allStatsPromises = gameTypes.map((gameId) =>
      getStudentGameStats(studentId, gameId)
    );

    // 等待所有请求完成
    const [rawRecordsResults, allStats] = await Promise.all([
      Promise.all(rawRecordsPromises),
      Promise.all(allStatsPromises),
    ]);

    // 组合数据
    const gameStats = {};
    gameTypes.forEach((gameType, index) => {
      // Get the raw records for this game
      const gameRecords = rawRecordsResults[index] || [];

      // Process the raw records to get playHistory
      const playHistory = gameRecords.map((record) => ({
        date: format(
          record.datetime instanceof Date
            ? record.datetime
            : new Date(record.datetime),
          "yyyy-MM-dd"
        ),
        score: record.Score,
        completed: record.IsCompleted,
      }));

      // Group by date and calculate average score per day for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        const dayRecords = playHistory.filter((r) => r.date === date);
        return {
          date,
          score: dayRecords.length > 0 ? meanBy(dayRecords, "score") : 0,
          playCount: dayRecords.length,
        };
      }).reverse();

      // Calculate average score overall
      const avgScore =
        gameRecords.length > 0 ? meanBy(gameRecords, "Score") : 0;

      // Calculate completion rate
      const completionRate =
        gameRecords.length > 0
          ? gameRecords.filter((r) => r.IsCompleted).length / gameRecords.length
          : 0;

      // 处理可能的错误或空结果
      if (allStats[index]) {
        gameStats[gameType] = {
          ...allStats[index],
          gameType,
          gameName: GAME_CONFIG[gameType].name,
          playHistory: last7Days,
          avgScore,
          completionRate,
          rawRecords: gameRecords,
        };
      } else {
        gameStats[gameType] = {
          gameType,
          gameName: GAME_CONFIG[gameType].name,
          totalPlayCount: 0,
          playCount: 0,
          playHistory: [],
          avgScore: 0,
          completionRate: 0,
          message: "No data available",
        };
      }
    });

    // 计算总体统计
    let totalPlayCount = 0;
    Object.values(gameStats).forEach((stat) => {
      totalPlayCount += stat.totalPlayCount || stat.playCount || 0;
    });

    // 查找表现最好的游戏
    let bestGame = { gameType: "", score: -1 };

    Object.entries(gameStats).forEach(([gameType, stat]) => {
      let score = 0;

      // 根据游戏类型选择评分标准
      if (gameType === "Game1" && stat.totalScore !== undefined) {
        score = stat.totalScore;
      } else if (stat.highestScore !== undefined) {
        score = stat.highestScore;
      }

      if (score > bestGame.score) {
        bestGame = {
          gameType,
          gameName: GAME_CONFIG[gameType].name,
          score,
        };
      }
    });

    // Get all recent games for the student, sort by date
    const allGamesRecent = [];

    Object.entries(gameStats).forEach(([gameType, stat]) => {
      if (stat.rawRecords && stat.rawRecords.length > 0) {
        stat.rawRecords.forEach((record) => {
          allGamesRecent.push({
            gameType,
            gameName: stat.gameName,
            date: format(
              record.datetime instanceof Date
                ? record.datetime
                : new Date(record.datetime),
              "yyyy-MM-dd"
            ),
            score: record.Score,
            completed: record.IsCompleted,
          });
        });
      }
    });

    // Sort by date (most recent first)
    const recentGames = allGamesRecent
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10); // Top 10 most recent games

    return {
      student: {
        id: student.id,
        name: student.userName || student.email,
        email: student.email,
      },
      totalPlayCount,
      gameStats,
      bestGame: bestGame.gameType ? bestGame : null,
      recentGames,
    };
  } catch (error) {
    console.error("Error in getStudentProgressStats:", error);
    throw error;
  }
};
