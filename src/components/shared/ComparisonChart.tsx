import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { useThemeStore } from '../../store/useThemeStore';
import type { ComparisonDatum } from '../../data/mockData';

export function ComparisonChart({
  data,
  thresholdPct = 75,
  onItemClick,
}: {
  data: ComparisonDatum[];
  thresholdPct?: number;
  onItemClick?: (id: string) => void;
}) {
  const isDark = useThemeStore((s) => s.theme === 'dark');
  const gridColor = isDark ? '#27272a' : '#e4e4e7';
  const tickColor = isDark ? '#a1a1aa' : '#71717a';

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip
            cursor={{ fill: isDark ? 'rgba(37,99,235,0.18)' : 'rgba(37,99,235,0.08)' }}
            formatter={(value) => [`${Number(value)}%`, 'Attendance']}
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
              fontSize: 12,
              background: isDark ? '#18181b' : '#ffffff',
              color: isDark ? '#fafafa' : '#09090b',
            }}
          />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            cursor={onItemClick ? 'pointer' : 'default'}
            onClick={(barData) => {
              const id = (barData as unknown as ComparisonDatum)?.id;
              if (id) onItemClick?.(id);
            }}
          >
            {data.map((d) => (
              <Cell key={d.id} fill={d.value >= thresholdPct ? '#10b981' : '#f59e0b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
