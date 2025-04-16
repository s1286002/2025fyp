"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * 游戏活动趋势图 - 显示一段时间内游戏活动的趋势
 */
export const GameActivityTrend = ({
  data,
  dataKey = "playCount",
  nameKey = "date",
}) => {
  // 确保有数据
  if (!data || data.length === 0) {
    return <div className="text-center p-4 text-gray-500">暂无数据</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * 分数趋势图 - 显示分数随时间的变化
 */
export const ScoreTrend = ({ data }) => {
  // 确保有数据
  if (!data || data.length === 0) {
    return <div className="text-center p-4 text-gray-500">暂无数据</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="avgScore"
          stroke="#82ca9d"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * 游戏比较柱状图 - 比较不同游戏之间的数据
 */
export const GameComparisonChart = ({
  data,
  dataKey = "playCount",
  nameKey = "gameName",
  barColor = "#8884d8",
}) => {
  // 确保有数据
  if (!data || data.length === 0) {
    return <div className="text-center p-4 text-gray-500">暂无数据</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={barColor} />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * 分数分布图 - 显示分数在不同区间的分布
 */
export const ScoreDistributionChart = ({
  data,
  colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"],
}) => {
  // 数据格式转换
  const chartData = Object.entries(data).map(([range, count]) => ({
    name: range,
    value: count,
  }));

  if (chartData.length === 0) {
    return <div className="text-center p-4 text-gray-500">暂无数据</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} 次`, "数量"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * 多游戏活动对比图 - 在同一图表中比较多个游戏的活动
 */
export const MultiGameActivityChart = ({ data, games }) => {
  if (!data || data.length === 0 || !games || games.length === 0) {
    return <div className="text-center p-4 text-gray-500">暂无数据</div>;
  }

  // 为每个游戏分配不同颜色
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {games.map((game, index) => (
          <Line
            key={game.gameType}
            type="monotone"
            dataKey={`${game.gameType}_count`}
            name={game.gameName}
            stroke={colors[index % colors.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
