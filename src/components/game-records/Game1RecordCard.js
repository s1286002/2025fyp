import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Game1RecordCard({ record }) {
  const totalLevels = 8; // Game1 has 8 levels
  const maxScore = 50; // Maximum score per level

  // Helper function to convert from 0-based to 1-based index
  const getLevelNumber = (index) => index + 1;

  // Count completed levels based on high scores
  const completedLevels = Object.entries(record.levelHighScores || {}).filter(
    ([level, score]) => score > 0
  ).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 p-4">
        <div className="font-medium">{record.studentName}</div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Progress
            </label>
            <div className="flex items-center gap-2">
              <Progress
                value={(completedLevels / totalLevels) * 100}
                className="flex-1"
              />
              <span className="text-sm text-gray-600">
                {completedLevels}/{totalLevels} Levels
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Total Score
            </label>
            <div className="text-gray-900 font-medium">{record.totalScore}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Level Completion
            </label>
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: totalLevels }).map((_, index) => {
                const levelNumber = getLevelNumber(index);
                const score = record.levelHighScores[levelNumber] || 0;
                const isCompleted = score > 0;
                const isPerfectScore = score === maxScore;

                return (
                  <div
                    key={index}
                    className={`h-4 rounded ${
                      isCompleted
                        ? isPerfectScore
                          ? "bg-green-500"
                          : "bg-yellow-500"
                        : "bg-gray-200"
                    }`}
                    title={`Level ${levelNumber}`}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Level High Scores
            </label>
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: totalLevels }).map((_, index) => {
                const levelNumber = getLevelNumber(index);
                return (
                  <div
                    key={index}
                    className="text-center text-sm bg-gray-50 p-1 rounded"
                  >
                    <div className="font-medium">
                      {record.levelHighScores[levelNumber] || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      Level {levelNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
