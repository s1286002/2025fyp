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
 * 获取学生的错误模式数据
 * @param {string} studentId - 学生ID
 * @param {string} gameId - 游戏ID (可选)
 * @returns {Promise<Object>} - 错误模式数据
 */
export const getStudentErrorPatterns = async (studentId, gameId = null) => {
  try {
    // 创建用户引用
    const userRef = doc(db, "users", studentId);

    // 查询条件
    const q = query(
      collection(db, "errorPatterns"),
      where("userId", "==", userRef)
    );
    if (gameId) {
      const gameRef = doc(db, "games", gameId);
      q = query(
        collection(db, "errorPatterns"),
        where("userId", "==", userRef),
        where("gameId", "==", gameRef)
      );
    }

    const querySnapshot = await getDocs(q);

    console.log("querySnapshot", querySnapshot);

    // 如果没有记录，返回空数据
    if (querySnapshot.empty) {
      return { errorTypeDistribution: [], errorFrequencyTrend: [] };
    }

    // 处理错误模式数据
    const errorPatterns = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // 确保 lastUpdated 被转换为日期对象
      lastUpdated: doc.data().lastUpdated?.toDate(),
    }));

    // 按游戏类型分组
    const patternsByGame = {};
    for (const pattern of errorPatterns) {
      // 获取游戏信息
      const gameDoc = await getDoc(pattern.gameId);
      const gameData = gameDoc.exists() ? gameDoc.data() : null;
      const gameType = gameData ? gameDoc.id : "unknown";

      if (!patternsByGame[gameType]) {
        patternsByGame[gameType] = {
          gameType,
          gameName: gameData?.name || gameType,
          patterns: [],
        };
      }

      patternsByGame[gameType].patterns.push(pattern);
    }

    // 错误类型分布
    const errorTypeDistribution = Object.values(patternsByGame).map(
      (gameGroup) => {
        // 处理每个游戏的错误模式
        const errorPatterns = [];

        gameGroup.patterns.forEach((pattern) => {
          if (pattern.errorAnswers) {
            Object.values(pattern.errorAnswers).forEach((error) => {
              errorPatterns.push({
                wrongAnswer: error.wrongAnswer,
                count: error.errorCount,
                knowledgePoint: error.knowledgePoint,
              });
            });
          }
        });

        // 按错误次数排序
        const sortedPatterns = _orderBy(errorPatterns, ["count"], ["desc"]);

        return {
          gameType: gameGroup.gameType,
          gameName: gameGroup.gameName,
          errorPatterns: sortedPatterns.slice(0, 5), // 取前5个最常见错误
        };
      }
    );

    // 错误频率趋势 - 生成过去7天的趋势
    const errorFrequencyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const dailyErrors = Object.values(patternsByGame)
        .map((gameGroup) => {
          // 计算该日期的错误数
          let errorCount = 0;
          const commonErrors = [];

          gameGroup.patterns.forEach((pattern) => {
            if (pattern.errorAnswers) {
              Object.values(pattern.errorAnswers).forEach((error) => {
                if (error.lastAttemptTime) {
                  const errorDate = format(
                    error.lastAttemptTime.toDate(),
                    "yyyy-MM-dd"
                  );
                  if (errorDate === date) {
                    errorCount += error.errorCount;
                    commonErrors.push(error.wrongAnswer);
                  }
                }
              });
            }
          });

          return {
            gameType: gameGroup.gameType,
            gameName: gameGroup.gameName,
            errorCount,
            commonErrors: commonErrors.slice(0, 3), // 最多显示3个常见错误
          };
        })
        .filter((gameError) => gameError.errorCount > 0); // 只保留有错误的游戏

      errorFrequencyTrend.push({ date, dailyErrors });
    }

    return {
      errorTypeDistribution,
      errorFrequencyTrend,
    };
  } catch (error) {
    console.error("Error in getStudentErrorPatterns:", error);
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
    // 基础查询
    const q = query(
      collection(db, "errorPatterns"),
      orderBy("lastUpdated", "desc"),
      limit(100) // 限制查询，避免过多数据
    );

    // 应用游戏类型筛选条件
    if (filters.gameType) {
      const gameRef = doc(db, "games", filters.gameType);
      q = query(
        collection(db, "errorPatterns"),
        where("gameId", "==", gameRef),
        orderBy("lastUpdated", "desc"),
        limit(100)
      );
    }

    const querySnapshot = await getDocs(q);

    // 如果没有记录，返回空数据
    if (querySnapshot.empty) {
      return { errorTypeDistribution: [], errorFrequencyTrend: [] };
    }

    // 处理错误模式数据
    const errorPatterns = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // 获取用户信息
        const userRef = data.userId;
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : null;

        // 获取游戏信息
        const gameRef = data.gameId;
        const gameDoc = await getDoc(gameRef);
        const gameData = gameDoc.exists() ? gameDoc.data() : null;

        return {
          id: doc.id,
          ...data,
          userName: userData?.userName || "Unknown User",
          gameType: gameDoc.id,
          gameName: gameData?.name || "Unknown Game",
          // 确保 lastUpdated 被转换为日期对象
          lastUpdated: data.lastUpdated?.toDate(),
        };
      })
    );

    // 应用日期筛选条件
    let filteredPatterns = errorPatterns;
    if (filters.startDate && filters.endDate) {
      filteredPatterns = errorPatterns.filter((pattern) => {
        const patternDate = pattern.lastUpdated;
        return (
          patternDate >= new Date(filters.startDate) &&
          patternDate <= new Date(filters.endDate)
        );
      });
    }

    // 按游戏类型分组
    const patternsByGame = groupBy(filteredPatterns, "gameType");

    // 错误类型分布
    const errorTypeDistribution = Object.keys(patternsByGame).map(
      (gameType) => {
        const patterns = patternsByGame[gameType];
        const gameName = patterns[0]?.gameName || "Unknown Game";

        // 收集所有错误
        const allErrors = [];
        patterns.forEach((pattern) => {
          if (pattern.errorAnswers) {
            Object.values(pattern.errorAnswers).forEach((error) => {
              allErrors.push({
                wrongAnswer: error.wrongAnswer,
                count: error.errorCount,
                knowledgePoint: error.knowledgePoint,
              });
            });
          }
        });

        // 合并相同错误答案的记录
        const mergedErrors = {};
        allErrors.forEach((error) => {
          const key = `${error.knowledgePoint}_${error.wrongAnswer}`;
          if (!mergedErrors[key]) {
            mergedErrors[key] = { ...error };
          } else {
            mergedErrors[key].count += error.count;
          }
        });

        // 按错误次数排序
        const sortedPatterns = _orderBy(
          Object.values(mergedErrors),
          ["count"],
          ["desc"]
        );

        return {
          gameType,
          gameName,
          errorPatterns: sortedPatterns.slice(0, 10), // 取前10个最常见错误
        };
      }
    );

    // 错误频率趋势 - 生成过去7天的趋势
    const errorFrequencyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const dailyErrors = Object.keys(patternsByGame)
        .map((gameType) => {
          const patterns = patternsByGame[gameType];
          const gameName = patterns[0]?.gameName || "Unknown Game";

          // 计算该日期的错误数
          let errorCount = 0;
          const commonErrors = new Set();

          patterns.forEach((pattern) => {
            if (pattern.errorAnswers) {
              Object.values(pattern.errorAnswers).forEach((error) => {
                if (error.lastAttemptTime) {
                  const errorDate = format(
                    error.lastAttemptTime.toDate(),
                    "yyyy-MM-dd"
                  );
                  if (errorDate === date) {
                    errorCount += error.errorCount;
                    commonErrors.add(error.wrongAnswer);
                  }
                }
              });
            }
          });

          return {
            gameType,
            gameName,
            errorCount,
            commonErrors: Array.from(commonErrors).slice(0, 3), // 最多显示3个常见错误
          };
        })
        .filter((gameError) => gameError.errorCount > 0); // 只保留有错误的游戏

      errorFrequencyTrend.push({ date, dailyErrors });
    }

    // 按知识点分析错误集中度
    const errorConcentration = Object.keys(patternsByGame).map((gameType) => {
      const patterns = patternsByGame[gameType];
      const gameName = patterns[0]?.gameName || "Unknown Game";

      // 收集按知识点分组的错误
      const knowledgePointErrors = {};
      patterns.forEach((pattern) => {
        if (pattern.errorAnswers) {
          Object.values(pattern.errorAnswers).forEach((error) => {
            const kp = error.knowledgePoint;
            if (!knowledgePointErrors[kp]) {
              knowledgePointErrors[kp] = {
                point: kp,
                errorCount: 0,
                uniqueStudents: new Set(),
                wrongAnswers: {},
              };
            }

            knowledgePointErrors[kp].errorCount += error.errorCount;
            knowledgePointErrors[kp].uniqueStudents.add(pattern.userName);

            // 记录错误答案频率
            if (!knowledgePointErrors[kp].wrongAnswers[error.wrongAnswer]) {
              knowledgePointErrors[kp].wrongAnswers[error.wrongAnswer] = 0;
            }
            knowledgePointErrors[kp].wrongAnswers[error.wrongAnswer] +=
              error.errorCount;
          });
        }
      });

      // 将知识点转换为数组并计算难度和改进空间
      const knowledgePoints = Object.values(knowledgePointErrors).map((kp) => {
        // 难度 = 错误次数 / 学生数
        const difficulty = kp.errorCount / kp.uniqueStudents.size;

        // 改进空间 = 按错误次数排名的位置
        const improvement = kp.errorCount;

        return {
          point: kp.point,
          errorCount: kp.errorCount,
          difficulty,
          improvement,
          uniqueStudents: kp.uniqueStudents.size,
          // 最常见的错误答案
          commonWrongAnswers: Object.entries(kp.wrongAnswers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([answer, count]) => ({ answer, count })),
        };
      });

      return {
        gameType,
        gameName,
        knowledgePoints: _orderBy(knowledgePoints, ["errorCount"], ["desc"]),
      };
    });

    return {
      errorTypeDistribution,
      errorFrequencyTrend,
      errorConcentration,
    };
  } catch (error) {
    console.error("Error in getGlobalErrorPatterns:", error);
    throw error;
  }
};

/**
 * 分析错误模式中的常见问题
 * @param {Array} errorPatterns - 错误模式数据
 * @returns {Object} - 分析结果
 */
export const analyzeErrorPatterns = (errorPatterns) => {
  // 实现错误模式分析逻辑
  // 例如：识别重复错误、错误趋势、常见错误类型等

  return {
    // 分析结果
  };
};
