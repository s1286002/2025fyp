# 游戏进度报告设计规范

## 1. 报告概述

游戏进度报告提供了学生在不同游戏类型中随时间推移的全面表现和进度视图。该报告旨在帮助教育工作者和学生追踪学习成果并确定需要改进的领域。

## 2. 报告范围

### 包含元素：

- 个人学生表现指标
- 时间进度追踪
- 游戏类型特定分析
- 比较性表现指标
- 成就里程碑
- 学习轨迹可视化

### 排除元素：

- 班级整体比较（在单独报告中涵盖）
- 详细的游戏会话日志
- 未经分析的原始数据点
- 教师特定分析

## 3. 报告组件

### 3.1 标题部分

- 学生信息
  - UserName
  - email
- 报告信息
  - 报告周期
  - 报告生成日期
- 快速统计摘要
  - 总游戏次数
  - 平均分数
  - 进步率

### 3.2 表现概览

- 总体进度图表
  - 时间序列可视化
  - 趋势线分析
  - 关键里程碑标记
- 表现分布
  - 分数范围
  - 一致性指标
    - 定义：衡量学生表现稳定性的指标
    - 实际例子：
      - 在 10 次游戏中，有 8 次得分在 80-90 分之间，说明表现非常稳定
      - 标准差计算：如果分数波动很小（如标准差<5），说明一致性高
      - 连续成功次数：连续 5 次游戏都达到目标分数
  - 峰值表现指标
    - 定义：记录学生在特定游戏中的最佳表现
    - 实际例子：
      - 最高分记录：在"数学速算"游戏中获得 95 分
      - 最高连胜记录：在"逻辑推理"游戏中连续完成 10 个关卡

### 3.3 游戏类型分析

- 个人游戏表现
  - 每种游戏类型的成功率
  - 错误模式分析
    - 常见错误类型统计
    - 错误频率趋势
    - 错误集中领域
- 优势和劣势
  - 表现最佳的游戏
  - 需要改进的领域
  - 错误模式分析

### 3.4 进度指标

- 学习轨迹
  - 进步率
  - 学习曲线可视化
  - 预测性表现指标
- 成就追踪
  - 已达成里程碑
  - 设定目标与达成情况
  - 下一个里程碑预测

### 3.5 建议

- 个性化学习路径
  - 建议关注领域
  - 游戏推荐
  - 练习策略
- 改进目标
  - 短期目标
  - 长期目标
  - 可执行步骤

## 4. 数据要求

### 4.1 数据模型

#### 游戏记录 (UserGameData)

```javascript
{
  gameId: "string",      // 游戏引用文档
  isCompleted: "boolean", // 是否完成游戏
  level: "number",       // 关卡
  score: "number",       // 分数
  userId: "string",      // 用户引用文档
  datetime: "timestamp"  // 游戏时间
}
```

#### 错误模式 (ErrorPattern)

```javascript
{
  userId: "string",      // 用户引用文档
  gameId: "string",      // 游戏引用文档
  errorAnswers: {        // 错误答案模式
    [knowledgePoint]: {  // 以知识点为键
      wrongAnswer: "string",    // 错误答案内容
      errorCount: "number",     // 错误次数
      knowledgePoint: "string", // 相关知识点
      lastAttemptTime: "timestamp" // 最后尝试时间
    }
  },
  lastUpdated: "timestamp"      // 最后更新时间
}
```

#### 游戏配置

```javascript
{
  Game1: {  // 汉字图片连连看
    name: "汉字图片连连看",
    scoreRanges: 100,  // 满分
    errorPattern: {
      index: "unitNumber",      // 使用单元编号作为索引
      wrongAnswer: "string",    // 错误答案格式：数字字符串，例如 "1"
      knowledgePoint: "unitNumber" // 知识点格式：单元编号，例如 "1"
    }
  },
  Game2: {  // 汉字偏旁消消乐
    name: "汉字偏旁消消乐",
    scoreRanges: [
      { min: 0, max: 25, color: "bg-gray-200" },
      { min: 25, max: 50, color: "bg-green-200" },
      { min: 50, max: 75, color: "bg-green-300" },
      { min: 75, max: 100, color: "bg-green-400" },
      { min: 100, max: Infinity, color: "bg-green-500" }
    ],
    errorPattern: {
      // 未实现
    }
  },
  Game3: {  // 量词贪吃蛇
    name: "量词贪吃蛇",
    scoreRanges: [
      { min: 0, max: 1000, color: "bg-red-500" },
      { min: 1000, max: 2000, color: "bg-yellow-500" },
      { min: 2000, max: Infinity, color: "bg-green-500" }
    ],
    errorPattern: {
      index: "classifier",      // 使用量词作为索引
      wrongAnswer: "word",      // 错误答案格式：单词，例如 "報告"
      knowledgePoint: "classifier" // 知识点格式：量词，例如 "份"
    }
  }
}
```

### 4.2 数据处理

- 每日/每周/每月汇总
- 趋势分析
- 错误模式分析
  - 按游戏类型分类
  - 按知识点分类
  - 按错误频率排序
- 表现标准化
  - 根据游戏类型使用不同的评分标准
  - 考虑关卡难度因素

## 5. 技术规范

### 5.1 可视化组件

- 进度追踪的折线图
- 游戏比较的柱状图
- 错误模式分析图表
  - 错误类型分布饼图
    - 数据结构：
      ```typescript
      interface ErrorTypeDistribution {
        gameType: string;
        errorPatterns: {
          wrongAnswer: string;
          count: number;
          knowledgePoint: string;
        }[];
      }
      ```
    - 展示内容：
      - 按游戏类型分类的错误分布
      - 每个错误答案的占比
      - 可点击查看详细错误信息
    - 示例：
      ```
      数学速算游戏错误分布：
      - 计算错误：45%
      - 符号错误：30%
      - 单位错误：15%
      - 其他错误：10%
      ```
  - 错误频率趋势图
    - 数据结构：
      ```typescript
      interface ErrorFrequencyTrend {
        date: string;
        dailyErrors: {
          gameType: string;
          errorCount: number;
          commonErrors: string[];
        }[];
      }
      ```
    - 展示内容：
      - 每日错误总数趋势
      - 按游戏类型分类的趋势
      - 特定日期详细错误情况
    - 示例：
      ```
      过去7天错误趋势：
      - 周一：15次错误
      - 周二：12次错误
      - 周三：8次错误
      ...
      ```
  - 错误集中领域雷达图
    - 数据结构：
      ```typescript
      interface ErrorConcentration {
        knowledgePoints: {
          point: string;
          errorCount: number;
          difficulty: number;
          improvement: number;
        }[];
      }
      ```
    - 展示内容：
      - 知识点错误集中程度
      - 错误难度分布
      - 改进空间分析
    - 示例：
      ```
      知识点错误分析：
      - 分数运算：高错误率
      - 几何图形：中等错误率
      - 代数方程：低错误率
      ```

### 5.2 导出选项

- PDF 格式
- CSV 数据导出
- 打印友好版本
- 移动设备优化视图

## 6. 用户体验考虑

### 6.1 可访问性

- 响应式设计
- 高对比度选项

### 6.2 交互性

- 悬停提示
- 筛选选项
- 自定义日期范围

## 7. 实施阶段

### 第一阶段：核心组件

- 基本报告布局
- 基本图表
- 数据处理流程

### 第二阶段：增强功能

- 交互元素
- 高级可视化
- 导出功能

### 第三阶段：优化

- 性能改进
- 移动设备优化
- 可访问性增强
