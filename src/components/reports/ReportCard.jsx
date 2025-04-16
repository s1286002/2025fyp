import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 报告卡片组件 - 用于展示统计数据
 */
export function StatCard({ title, value, description, className, icon: Icon }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 分数分布卡片 - 用于展示分数分布
 */
export function ScoreDistributionCard({
  title,
  distribution,
  className,
  colors = ["bg-blue-100", "bg-green-100", "bg-yellow-100"],
}) {
  // 确保有数据
  if (!distribution || Object.keys(distribution).length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-gray-500">暂无分布数据</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(distribution).map(([range, count], index) => (
            <div
              key={range}
              className={`p-2 rounded-md ${colors[index % colors.length]}`}
            >
              <p className="text-xs font-medium">{range}</p>
              <p className="text-sm font-bold">{count} 次</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 游戏统计卡片 - 用于展示单个游戏的详细统计
 */
export function GameStatCard({ gameData, className }) {
  if (!gameData) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{gameData.gameName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">游戏次数</p>
            <p className="text-lg font-medium">{gameData.playCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">平均分数</p>
            <p className="text-lg font-medium">
              {gameData.avgScore?.toFixed(1) || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">最高分数</p>
            <p className="text-lg font-medium">
              {gameData.highestScore || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">完成率</p>
            <p className="text-lg font-medium">
              {(gameData.completionRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {gameData.scoreDistribution && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">分数分布</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(gameData.scoreDistribution).map(
                ([range, count], index) => (
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
      </CardContent>
    </Card>
  );
}
