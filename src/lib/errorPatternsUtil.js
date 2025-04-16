import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, subDays } from "date-fns";
import { groupBy, orderBy as _orderBy } from "lodash";

/**
 * 生成错误类型分布数据
 * @param {Array} errorPatterns - 错误模式数据数组
 * @returns {Array} - 按游戏类型分组的错误分布数据
 */
export const generateErrorTypeDistribution = (errorPatterns) => {
  // 按游戏类型分组
  const groupedByGame = groupBy(errorPatterns, "gameId");

  // 生成每种游戏的错误类型分布
  return Object.entries(groupedByGame)
    .map(([gameType, patterns]) => {
      // 收集所有错误答案
      const allErrors = [];
      patterns.forEach((pattern) => {
        if (pattern.errorAnswers) {
          Object.values(pattern.errorAnswers).forEach((error) => {
            allErrors.push({
              wrongAnswer: error.wrongAnswer,
              knowledgePoint: error.knowledgePoint,
              count: error.errorCount || 0,
            });
          });
        }
      });

      // 按错误答案分组
      const groupedByWrongAnswer = groupBy(allErrors, "wrongAnswer");

      // 计算每种错误的总数和百分比
      const totalErrors = allErrors.reduce((sum, err) => sum + err.count, 0);
      const errorPatterns = Object.entries(groupedByWrongAnswer)
        .map(([wrongAnswer, errors]) => {
          const count = errors.reduce((sum, err) => sum + err.count, 0);
          return {
            wrongAnswer,
            count,
            percentage:
              totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0,
            knowledgePoint: errors.map((e) => e.knowledgePoint),
          };
        })
        .sort((a, b) => b.count - a.count);

      return {
        gameType,
        totalErrors,
        errorPatterns,
        // 添加游戏名称和总样本数
        gameName: getGameName(gameType),
        sampleCount: patterns.length,
      };
    })
    .filter((item) => item.totalErrors > 0); // 只返回有错误的游戏
};

/**
 * 生成错误集中领域雷达图数据
 * @param {Array} errorPatterns - 错误模式数据数组
 * @returns {Object} - 错误集中领域数据
 */
export const generateErrorConcentration = (errorPatterns) => {
  // 收集所有知识点的错误
  const knowledgePointErrors = {};

  errorPatterns.forEach((pattern) => {
    if (pattern.errorAnswers) {
      Object.values(pattern.errorAnswers).forEach((error) => {
        const point = error.knowledgePoint;
        if (point) {
          if (!knowledgePointErrors[point]) {
            knowledgePointErrors[point] = {
              point,
              errorCount: 0,
              gameTypes: new Set(),
              wrongAnswers: {},
            };
          }

          knowledgePointErrors[point].errorCount += error.errorCount || 0;
          knowledgePointErrors[point].gameTypes.add(pattern.gameId);

          // 记录错误答案分布
          if (!knowledgePointErrors[point].wrongAnswers[error.wrongAnswer]) {
            knowledgePointErrors[point].wrongAnswers[error.wrongAnswer] = 0;
          }
          knowledgePointErrors[point].wrongAnswers[error.wrongAnswer] +=
            error.errorCount || 0;
        }
      });
    }
  });

  // 转换为数组并排序
  const knowledgePoints = Object.values(knowledgePointErrors)
    .map((item) => ({
      point: item.point,
      errorCount: item.errorCount,
      gameCount: item.gameTypes.size,
      // 错误分布
      errorDistribution: Object.entries(item.wrongAnswers)
        .map(([answer, count]) => ({
          answer,
          count,
          percentage: Math.round((count / item.errorCount) * 100),
        }))
        .sort((a, b) => b.count - a.count),
      // 计算错误难度 (1-3)，基于错误次数的相对值
      errorDifficulty: calculateErrorDifficulty(
        item.errorCount,
        Math.max(
          ...Object.values(knowledgePointErrors).map((k) => k.errorCount)
        )
      ),
    }))
    .sort((a, b) => b.errorCount - a.errorCount);

  return {
    knowledgePoints,
    totalErrors: knowledgePoints.reduce(
      (sum, point) => sum + point.errorCount,
      0
    ),
    totalKnowledgePoints: knowledgePoints.length,
    // 分类错误难度
    difficultyGroups: {
      high: knowledgePoints.filter((p) => p.errorDifficulty === 3).length,
      medium: knowledgePoints.filter((p) => p.errorDifficulty === 2).length,
      low: knowledgePoints.filter((p) => p.errorDifficulty === 1).length,
    },
  };
};

/**
 * 计算错误的难度等级
 * @param {number} errorCount - 错误次数
 * @param {number} maxErrorCount - 最大错误次数
 * @returns {number} - 难度等级 (1-3)
 */
const calculateErrorDifficulty = (errorCount, maxErrorCount) => {
  if (maxErrorCount === 0) return 1;
  const ratio = errorCount / maxErrorCount;
  if (ratio >= 0.7) return 3; // 高难度
  if (ratio >= 0.3) return 2; // 中等难度
  return 1; // 低难度
};

/**
 * 获取游戏名称
 * @param {string} gameId - 游戏ID
 * @returns {string} - 游戏名称
 */
const getGameName = (gameId) => {
  const gameNames = {
    Game1: "汉字图片连连看",
    Game2: "汉字偏旁消消乐",
    Game3: "量词贪吃蛇",
  };
  return gameNames[gameId] || gameId;
};

/**
 * 获取全局错误模式分析
 * @param {object} filters - 可选的筛选条件
 * @param {string} filters.gameId - 游戏ID筛选
 * @param {string} filters.studentId - 学生ID筛选
 * @param {Date} filters.startDate - 开始日期
 * @param {Date} filters.endDate - 结束日期
 * @param {number} filters.limit - 结果数量限制
 * @returns {Promise<object>} - 全局错误模式分析数据
 */
export const getGlobalErrorPatterns = async (filters = {}) => {
  try {
    // 基础查询
    let errorPatternQuery = collection(db, "errorPatterns");

    console.log(filters);

    // 应用筛选条件
    if (filters.gameId) {
      // 使用引用类型来匹配GameId
      const gameRef = doc(db, "games", filters.gameId);
      errorPatternQuery = query(
        errorPatternQuery,
        where("GameId", "==", gameRef)
      );
    }

    // 添加学生ID筛选条件
    if (filters.studentId) {
      // 使用引用类型来匹配UserId
      const userRef = doc(db, "users", filters.studentId);
      errorPatternQuery = query(
        errorPatternQuery,
        where("UserId", "==", userRef)
      );
    }

    // 日期范围筛选
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      errorPatternQuery = query(
        errorPatternQuery,
        where("LastUpdated", ">=", startDate)
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      errorPatternQuery = query(
        errorPatternQuery,
        where("LastUpdated", "<=", endDate)
      );
    }

    // 添加排序条件
    if (filters.orderByField) {
      errorPatternQuery = query(
        errorPatternQuery,
        orderBy(filters.orderByField, filters.orderDirection || "asc")
      );
    }

    // 限制结果数量（如果指定）
    if (filters.limit) {
      errorPatternQuery = query(errorPatternQuery, limit(filters.limit));
    }

    const querySnapshot = await getDocs(errorPatternQuery);

    // 处理查询结果
    const errorPatterns = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // 提取GameId的路径信息（如果是引用类型）
      let gameId = "unknown";
      if (data.GameId && data.GameId._key && data.GameId._key.path) {
        const path = data.GameId._key.path;
        if (path.segments && path.segments.length >= 7) {
          gameId = path.segments[6]; // 获取路径中的游戏ID
        }
      }

      // 提取UserId的值（如果是引用类型）
      let userId = null;
      if (data.UserId && data.UserId._key && data.UserId._key.path) {
        const path = data.UserId._key.path;
        if (path.segments && path.segments.length >= 7) {
          userId = path.segments[6]; // 获取路径中的用户ID
        }
      }

      // 规范化错误答案字段
      const errorAnswers = {};
      if (data.ErrorAnswers) {
        Object.entries(data.ErrorAnswers).forEach(([key, value]) => {
          errorAnswers[key] = {
            knowledgePoint: value.KnowledgePoint,
            wrongAnswer: value.WrongAnswer,
            errorCount: value.ErrorCount,
            lastAttemptTime: value.LastAttemptTime,
          };
        });
      }

      // 将数据添加到数组中，使用统一的字段名
      errorPatterns.push({
        id: doc.id,
        gameId,
        userId,
        errorAnswers,
        lastUpdated: data.LastUpdated,
        // 保留原始数据以备调试
        _originalData: data,
      });
    });

    // 添加调试信息
    console.log("Normalized Error Patterns:", errorPatterns);

    // 按游戏类型分组
    const groupedByGame = groupBy(errorPatterns, "gameId");

    // 调试分组结果
    console.log("Grouped By Game:", Object.keys(groupedByGame));

    // 对每种游戏类型进行错误分析
    const gameAnalysis = {};

    for (const [gameId, patterns] of Object.entries(groupedByGame)) {
      if (!gameId || gameId === "undefined") {
        console.warn("发现无效的gameId，跳过分析", patterns.length);
        continue;
      }

      // 收集所有知识点的错误
      const allKnowledgePointErrors = [];
      patterns.forEach((pattern) => {
        if (pattern.errorAnswers) {
          // 确保errorAnswers是对象并且有值
          if (
            typeof pattern.errorAnswers === "object" &&
            pattern.errorAnswers !== null
          ) {
            Object.values(pattern.errorAnswers).forEach((error) => {
              if (error && error.knowledgePoint) {
                allKnowledgePointErrors.push(error);
              }
            });
          }
        }
      });

      // 调试知识点错误
      console.log(
        `GameID ${gameId}: 发现 ${allKnowledgePointErrors.length} 个知识点错误`
      );

      // 按知识点分组
      const groupedByKnowledgePoint = groupBy(
        allKnowledgePointErrors,
        "knowledgePoint"
      );

      // 计算每个知识点的错误统计
      const knowledgePointStats = Object.keys(groupedByKnowledgePoint)
        .map((point) => {
          if (!point || point === "undefined") {
            return null;
          }

          const errors = groupedByKnowledgePoint[point];
          const totalErrors = errors.reduce(
            (sum, error) => sum + (error.errorCount || 0),
            0
          );

          // 统计错误答案分布
          const wrongAnswerMap = {};
          errors.forEach((error) => {
            if (error.wrongAnswer) {
              if (!wrongAnswerMap[error.wrongAnswer]) {
                wrongAnswerMap[error.wrongAnswer] = 0;
              }
              wrongAnswerMap[error.wrongAnswer] += error.errorCount || 0;
            }
          });

          const errorDistribution = Object.entries(wrongAnswerMap)
            .map(([answer, count]) => ({
              answer,
              count,
              percentage:
                totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

          return {
            knowledgePoint: point,
            totalErrors,
            errorDistribution,
          };
        })
        .filter(Boolean) // 过滤掉无效的知识点
        .sort((a, b) => b.totalErrors - a.totalErrors);

      gameAnalysis[gameId] = {
        totalPatterns: patterns.length,
        totalStudents: new Set(patterns.map((p) => p.userId).filter(Boolean))
          .size,
        knowledgePointStats,
        totalErrors: knowledgePointStats.reduce(
          (sum, point) => sum + point.totalErrors,
          0
        ),
      };
    }

    // 按知识点分组错误（为了兼容原来的getStudentErrorPatterns函数输出）
    const groupedByKnowledgePoint = {};
    errorPatterns.forEach((pattern) => {
      if (pattern.errorAnswers) {
        Object.values(pattern.errorAnswers).forEach((error) => {
          if (!groupedByKnowledgePoint[error.knowledgePoint]) {
            groupedByKnowledgePoint[error.knowledgePoint] = [];
          }
          groupedByKnowledgePoint[error.knowledgePoint].push(error);
        });
      }
    });

    // 计算每个知识点的错误频率和最近错误时间（为了兼容原来的输出格式）
    const knowledgePointAnalysis = Object.keys(groupedByKnowledgePoint).map(
      (point) => {
        const errors = groupedByKnowledgePoint[point];
        const totalErrors = errors.reduce(
          (sum, error) => sum + error.errorCount,
          0
        );

        let lastAttemptTime;
        try {
          lastAttemptTime = new Date(
            Math.max(
              ...errors.map((e) =>
                e.lastAttemptTime.toMillis
                  ? e.lastAttemptTime.toMillis()
                  : e.lastAttemptTime instanceof Date
                  ? e.lastAttemptTime.getTime()
                  : new Date(e.lastAttemptTime).getTime()
              )
            )
          );
        } catch (e) {
          lastAttemptTime = new Date();
        }

        // 错误答案分布
        const wrongAnswers = errors
          .map((e) => ({
            answer: e.wrongAnswer,
            count: e.errorCount,
          }))
          .sort((a, b) => b.count - a.count);

        return {
          knowledgePoint: point,
          totalErrors,
          lastAttemptTime,
          wrongAnswers,
        };
      }
    );

    // 生成错误类型分布和错误集中领域数据
    const errorTypeDistribution = generateErrorTypeDistribution(errorPatterns);
    const errorConcentration = generateErrorConcentration(errorPatterns);

    // 构建最终的返回结果，兼容两个函数的输出格式
    const result = {
      filters,
      totalRecords: errorPatterns.length,
      gameAnalysis,
      errorTypeDistribution,
      errorConcentration,
    };

    // 如果是按学生ID筛选，添加学生特定的数据
    if (filters.studentId) {
      result.studentId = filters.studentId;
      result.gameId = filters.gameId;
      result.rawData = errorPatterns;
      result.knowledgePointAnalysis = knowledgePointAnalysis;
      result.totalErrorCount = knowledgePointAnalysis.reduce(
        (sum, point) => sum + point.totalErrors,
        0
      );
    }

    return result;
  } catch (error) {
    console.error("Error in getGlobalErrorPatterns:", error);
    throw error;
  }
};

/**
 * 获取学生在特定时间段内的错误模式趋势
 * @param {string} studentId - 学生ID
 * @param {number} days - 回溯的天数
 * @returns {Promise<Object>} - 错误模式趋势数据
 */
export const getStudentErrorTrends = async (studentId, days = 30) => {
  try {
    const startDate = subDays(new Date(), days);

    // 使用增强后的getGlobalErrorPatterns函数获取数据
    const errorData = await getGlobalErrorPatterns({
      studentId,
      startDate,
      orderByField: "LastUpdated",
      orderDirection: "asc",
    });

    const errorPatterns = errorData.rawData || [];

    // 按日期分组
    const dailyErrors = {};

    errorPatterns.forEach((pattern) => {
      if (pattern.errorAnswers) {
        const lastUpdatedDate = pattern.lastUpdated.toDate
          ? pattern.lastUpdated.toDate()
          : new Date(pattern.lastUpdated);
        const dateKey = format(lastUpdatedDate, "yyyy-MM-dd");

        if (!dailyErrors[dateKey]) {
          dailyErrors[dateKey] = { total: 0, byKnowledgePoint: {} };
        }

        Object.values(pattern.errorAnswers).forEach((error) => {
          dailyErrors[dateKey].total += error.errorCount;

          if (!dailyErrors[dateKey].byKnowledgePoint[error.knowledgePoint]) {
            dailyErrors[dateKey].byKnowledgePoint[error.knowledgePoint] = 0;
          }

          dailyErrors[dateKey].byKnowledgePoint[error.knowledgePoint] +=
            error.errorCount;
        });
      }
    });

    // 生成时间序列数据
    const dateLabels = [];
    const errorCounts = [];

    // 确保有连续的日期数据
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - i - 1);
      const dateKey = format(date, "yyyy-MM-dd");
      dateLabels.push(dateKey);

      if (dailyErrors[dateKey]) {
        errorCounts.push(dailyErrors[dateKey].total);
      } else {
        errorCounts.push(0);
      }
    }

    return {
      studentId,
      dateRange: {
        start: format(startDate, "yyyy-MM-dd"),
        end: format(new Date(), "yyyy-MM-dd"),
      },
      dailyErrors,
      timeSeries: {
        labels: dateLabels,
        data: errorCounts,
      },
      // 添加新的数据结构
      errorTypeDistribution: errorData.errorTypeDistribution,
      errorConcentration: errorData.errorConcentration,
    };
  } catch (error) {
    console.error("Error in getStudentErrorTrends:", error);
    throw error;
  }
};
