'use client';

interface MetricsGridProps {
  metrics: {
    firstContentfulPaint: string;
    speedIndex: string;
    largestContentfulPaint: string;
    interactive: string;
    totalBlockingTime: string;
    cumulativeLayoutShift: string;
  };
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const items = [
    { label: 'First Contentful Paint', value: metrics.firstContentfulPaint },
    { label: 'Speed Index', value: metrics.speedIndex },
    { label: 'Largest Contentful Paint', value: metrics.largestContentfulPaint },
    { label: 'Time to Interactive', value: metrics.interactive },
    { label: 'Total Blocking Time', value: metrics.totalBlockingTime },
    { label: 'Cumulative Layout Shift', value: metrics.cumulativeLayoutShift },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">{item.label}</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
