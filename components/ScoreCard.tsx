'use client';

interface ScoreCardProps {
  label: string;
  score: number;
  color: string;
}

export default function ScoreCard({ label, score = 0, color }: ScoreCardProps) {
  const isSkipped = score === null;
  const safeScore = isNaN(score as any) || score === null ? 0 : score;
  
  const getScoreColor = (s: number) => {
    if (isSkipped) return 'text-zinc-400';
    if (s >= 90) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getBgColor = (s: number) => {
    if (isSkipped) return 'bg-zinc-100';
    if (s >= 90) return 'bg-emerald-500/10';
    if (s >= 50) return 'bg-amber-500/10';
    return 'bg-rose-500/10';
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
      <div className={`relative w-24 h-24 flex items-center justify-center rounded-full ${getBgColor(safeScore)}`}>
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-100 dark:text-zinc-800"
          />
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - safeScore / 100)}
            strokeLinecap="round"
            className={`${getScoreColor(safeScore)} transition-all duration-1000 ease-out`}
          />
        </svg>
        <span className={`text-2xl font-bold ${getScoreColor(safeScore)}`}>
          {isSkipped ? 'N/A' : Math.round(safeScore)}
        </span>
      </div>
      <h3 className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">{label}</h3>
    </div>
  );
}
