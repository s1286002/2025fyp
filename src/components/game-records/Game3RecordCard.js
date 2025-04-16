import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Game3RecordCard({ record }) {
  // Define score ranges for color coding
  const scoreRanges = [
    { min: 0, max: 1000, color: "bg-gray-200" },
    { min: 1000, max: 2000, color: "bg-yellow-500" },
    { min: 2000, max: Infinity, color: "bg-green-500" },
  ];

  // Calculate progress percentage (capped at 100%)
  const maxScore = 2000; // Set a reasonable maximum score for progress calculation
  const progressPercentage = Math.min(
    (record.highestScore / maxScore) * 100,
    100
  );

  // Get color based on score
  const getScoreColor = (score) => {
    const range = scoreRanges.find(
      (range) => score >= range.min && score < range.max
    );
    return range ? range.color : "bg-gray-200";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 p-4">
        <div className="font-medium">{record.studentName}</div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Play Count
            </label>
            <div className="text-gray-900 font-medium">{record.playCount}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Best Score
            </label>
            <div className="flex items-center gap-2">
              <Progress value={progressPercentage} className="flex-1" />
              <span className="text-sm text-gray-600">
                {record.highestScore}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Score Progress
            </label>
            <div className="grid grid-cols-3 gap-2">
              {scoreRanges.map((range, index) => (
                <div
                  key={index}
                  className={`h-4 rounded ${getScoreColor(
                    record.highestScore
                  )}`}
                  title={`${range.min}-${
                    range.max === Infinity ? "∞" : range.max
                  } points`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {record.highestScore} points
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
