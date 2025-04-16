import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Chart colors
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ff7c43",
  "#665191",
  "#ffa600",
  "#6a0572",
  "#1a8cff",
];

/**
 * Format knowledge point/wrong answer for Game1
 * @param {string} value - The value to format
 * @returns {string} - Formatted value
 */
export const formatGame1Value = (value) => {
  // Check if the value is a numeric string (like "1", "2", etc.)
  if (/^\d+$/.test(value)) {
    return `单元${value}`;
  }
  return value;
};

/**
 * Error pattern card for Game1
 * @param {Object} props - Component props
 * @param {Object} props.gameError - Game error data
 * @returns {JSX.Element} - Rendered component
 */
export const Game1ErrorPatternCard = ({ gameError }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{gameError.gameName}</CardTitle>
        <CardDescription>
          Total Errors: {gameError.totalErrors} | Sample Count:{" "}
          {gameError.sampleCount}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pie Chart for Error Distribution */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gameError.errorPatterns.slice(0, 8).map((pattern) => ({
                  ...pattern,
                  displayName: formatGame1Value(pattern.wrongAnswer),
                }))}
                dataKey="count"
                nameKey="displayName"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ displayName, percentage }) =>
                  `${displayName}: ${percentage}%`
                }
              >
                {gameError.errorPatterns.slice(0, 8).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} (${props.payload.percentage}%)`,
                  `Wrong Answer: ${name}`,
                ]}
              />
              <Legend
                payload={gameError.errorPatterns
                  .slice(0, 8)
                  .map((item, index) => ({
                    value: `${formatGame1Value(item.wrongAnswer)} (${
                      item.percentage
                    }%)`,
                    type: "circle",
                    color: COLORS[index % COLORS.length],
                  }))}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Error Details Table */}
        <div className="mt-4 max-h-60 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="text-left p-2">单元</th>
                <th className="text-right p-2">错误次数</th>
                <th className="text-right p-2">百分比</th>
              </tr>
            </thead>
            <tbody>
              {gameError.errorPatterns.map((error) => (
                <tr key={error.wrongAnswer} className="border-t">
                  <td className="p-2 font-medium">
                    {formatGame1Value(error.wrongAnswer)}
                  </td>
                  <td className="p-2 text-right">{error.count}</td>
                  <td className="p-2 text-right">{error.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Standard error pattern card for other games
 * @param {Object} props - Component props
 * @param {Object} props.gameError - Game error data
 * @returns {JSX.Element} - Rendered component
 */
export const StandardErrorPatternCard = ({ gameError }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{gameError.gameName}</CardTitle>
        <CardDescription>
          Total Errors: {gameError.totalErrors} | Sample Count:{" "}
          {gameError.sampleCount}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pie Chart for Error Distribution */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gameError.errorPatterns.slice(0, 8)}
                dataKey="count"
                nameKey="wrongAnswer"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ wrongAnswer, percentage }) =>
                  `${wrongAnswer}: ${percentage}%`
                }
              >
                {gameError.errorPatterns.slice(0, 8).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} (${props.payload.percentage}%)`,
                  `Wrong Answer: ${name}`,
                ]}
              />
              <Legend
                payload={gameError.errorPatterns
                  .slice(0, 8)
                  .map((item, index) => ({
                    value: `${item.wrongAnswer} (${item.percentage}%)`,
                    type: "circle",
                    color: COLORS[index % COLORS.length],
                  }))}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Error Details Table */}
        <div className="mt-4 max-h-60 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="text-left p-2">Wrong Answer</th>
                <th className="text-right p-2">Count</th>
                <th className="text-right p-2">Percentage</th>
                <th className="text-left p-2">Knowledge Points</th>
              </tr>
            </thead>
            <tbody>
              {gameError.errorPatterns.map((error) => (
                <tr key={error.wrongAnswer} className="border-t">
                  <td className="p-2 font-medium">{error.wrongAnswer}</td>
                  <td className="p-2 text-right">{error.count}</td>
                  <td className="p-2 text-right">{error.percentage}%</td>
                  <td className="p-2 text-xs">
                    {error.knowledgePoint.slice(0, 3).join(", ")}
                    {error.knowledgePoint.length > 3 && "..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Error Patterns section component
 * @param {Object} props - Component props
 * @param {Object} props.errorPatternData - Error pattern data
 * @returns {JSX.Element} - Rendered component
 */
export const ErrorPatternsSection = ({ errorPatternData }) => {
  if (!errorPatternData) return <div>No error pattern data available</div>;

  return (
    <div className="space-y-8">
      {/* Error Type Distribution Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Error Type Distribution</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {errorPatternData.errorTypeDistribution.map((gameError) =>
            gameError.gameType === "Game1" ? (
              <Game1ErrorPatternCard
                key={gameError.gameType}
                gameError={gameError}
              />
            ) : (
              <StandardErrorPatternCard
                key={gameError.gameType}
                gameError={gameError}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};
