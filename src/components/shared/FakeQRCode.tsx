import { useMemo } from 'react';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function FakeQRCode({ seed, size = 176 }: { seed: string; size?: number }) {
  const grid = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    const rand = seededRandom(Math.abs(hash) || 1);
    const dim = 21;
    const cells: boolean[][] = Array.from({ length: dim }, () => Array.from({ length: dim }, () => rand() > 0.5));

    const finder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const onCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          cells[r0 + r][c0 + c] = onBorder || onCore;
        }
      }
    };
    finder(0, 0);
    finder(0, dim - 7);
    finder(dim - 7, 0);
    return cells;
  }, [seed]);

  return (
    <div
      className="grid gap-[1px] rounded-lg bg-white p-3"
      style={{ width: size, height: size, gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
      role="img"
      aria-label="Simulated rotating check-in code"
    >
      {grid.flatMap((row, r) => row.map((on, c) => <div key={`${r}-${c}`} className={on ? 'bg-zinc-950' : 'bg-white'} />))}
    </div>
  );
}
