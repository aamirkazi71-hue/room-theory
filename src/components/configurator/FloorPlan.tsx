/**
 * Architectural plan drawn from a design: walls with openings and door
 * swings, furniture footprints, dimension lines and a scale bar.
 */
import { getProduct } from '@/data/furniture';
import type { DesignSnapshot, Opening } from '@/store/types';
import { t } from '@/i18n';

const T = 0.14;

function wallSegments(len: number, openings: Opening[], flip: boolean) {
  const gaps = openings.map((o) => {
    const u = flip ? -o.offset : o.offset;
    return [u - o.width / 2, u + o.width / 2] as const;
  }).sort((a, b) => a[0] - b[0]);
  const segs: [number, number][] = [];
  let s = -len / 2 - T;
  for (const [a, b] of gaps) { segs.push([s, a]); s = b; }
  segs.push([s, len / 2 + T]);
  return segs;
}

export function FloorPlan({ design, className = '', showLabels = true }: { design: DesignSnapshot; className?: string; showLabels?: boolean }) {
  const { room, items } = design;
  const W = room.width, D = room.depth;
  const pad = 1.0;
  const vb = `${-W / 2 - pad} ${-D / 2 - pad} ${W + pad * 2} ${D + pad * 2}`;
  const ink = '#252522';
  const by = (wall: number) => room.openings.filter((o) => o.wall === wall);

  return (
    <svg viewBox={vb} className={className} direction="ltr" role="img" aria-label={t('Plan of the room, {w} by {d} metres', { w: W.toFixed(1), d: D.toFixed(1) })}>
      {/* Floor */}
      <rect x={-W / 2} y={-D / 2} width={W} height={D} fill="#EAE5DB" />
      {/* Furniture */}
      {items.map((it) => {
        const p = getProduct(it.productId);
        if (!p || p.placement === 'ceiling') return null;
        const w = p.dims.w / 100, d = p.dims.d / 100;
        const isRug = p.placement === 'rug';
        return (
          <g key={it.uid} transform={`translate(${it.x} ${it.z}) rotate(${(-it.rotation * 180) / Math.PI})`}>
            <rect
              x={-w / 2}
              y={-d / 2}
              width={w}
              height={d}
              rx={p.model === 'ottoman' || p.model === 'sideTable' || p.model === 'plant' || p.model === 'accentChair' ? Math.min(w, d) / 2 : 0.02}
              fill={isRug ? 'none' : p.placement === 'surface' ? '#D9D2C4' : '#F7F5F0'}
              stroke={ink}
              strokeOpacity={isRug ? 0.35 : 0.75}
              strokeDasharray={isRug ? '0.06 0.05' : undefined}
              strokeWidth={0.018}
            />
            {!isRug && p.placement === 'floor' && w > 0.6 && <line x1={-w / 2 + 0.06} x2={w / 2 - 0.06} y1={d / 2 - 0.06} y2={d / 2 - 0.06} stroke={ink} strokeOpacity={0.25} strokeWidth={0.012} />}
          </g>
        );
      })}
      {/* Walls (poché) */}
      {([0, 2] as const).map((wall) => {
        const z = wall === 0 ? -D / 2 - T : D / 2;
        return wallSegments(W, by(wall), false).map(([a, b], i) => <rect key={`${wall}-${i}`} x={a} y={z} width={Math.max(0, b - a)} height={T} fill={ink} />);
      })}
      {([1, 3] as const).map((wall) => {
        const x = wall === 1 ? W / 2 : -W / 2 - T;
        return wallSegments(D, by(wall), false).map(([a, b], i) => <rect key={`${wall}-${i}`} x={x} y={a} width={T} height={Math.max(0, b - a)} fill={ink} />);
      })}
      {/* Openings */}
      {room.openings.map((o, i) => {
        const horizontal = o.wall % 2 === 0;
        const u = o.offset;
        const inner = o.wall === 0 ? -D / 2 : o.wall === 2 ? D / 2 : o.wall === 1 ? W / 2 : -W / 2;
        const outer = inner + (o.wall === 0 ? -T : o.wall === 2 ? T : o.wall === 1 ? T : -T);
        if (o.kind === 'window') {
          return horizontal ? (
            <g key={i} stroke={ink} strokeWidth={0.012}>
              <line x1={u - o.width / 2} x2={u + o.width / 2} y1={inner} y2={inner} />
              <line x1={u - o.width / 2} x2={u + o.width / 2} y1={(inner + outer) / 2} y2={(inner + outer) / 2} />
              <line x1={u - o.width / 2} x2={u + o.width / 2} y1={outer} y2={outer} />
            </g>
          ) : (
            <g key={i} stroke={ink} strokeWidth={0.012}>
              <line y1={u - o.width / 2} y2={u + o.width / 2} x1={inner} x2={inner} />
              <line y1={u - o.width / 2} y2={u + o.width / 2} x1={(inner + outer) / 2} x2={(inner + outer) / 2} />
              <line y1={u - o.width / 2} y2={u + o.width / 2} x1={outer} x2={outer} />
            </g>
          );
        }
        // Door: leaf + quarter swing into the room
        const r = o.width;
        const dir = o.wall === 0 || o.wall === 3 ? 1 : -1;
        if (horizontal) {
          const hx = u - o.width / 2;
          return (
            <g key={i} fill="none" stroke={ink} strokeWidth={0.014}>
              <line x1={hx} y1={inner} x2={hx} y2={inner + dir * r} />
              <path d={`M ${hx} ${inner + dir * r} A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${hx + r} ${inner}`} strokeOpacity={0.5} strokeDasharray="0.04 0.03" />
            </g>
          );
        }
        const hz = u - o.width / 2;
        return (
          <g key={i} fill="none" stroke={ink} strokeWidth={0.014}>
            <line x1={inner} y1={hz} x2={inner + dir * r} y2={hz} />
            <path d={`M ${inner + dir * r} ${hz} A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${inner} ${hz + r}`} strokeOpacity={0.5} strokeDasharray="0.04 0.03" />
          </g>
        );
      })}
      {/* Dimensions */}
      {showLabels && (
        <g stroke={ink} strokeWidth={0.01} fill={ink} fontFamily="Inter Tight, sans-serif" fontSize={0.2}>
          <line x1={-W / 2} x2={W / 2} y1={-D / 2 - 0.55} y2={-D / 2 - 0.55} />
          <line x1={-W / 2} x2={-W / 2} y1={-D / 2 - 0.65} y2={-D / 2 - 0.45} />
          <line x1={W / 2} x2={W / 2} y1={-D / 2 - 0.65} y2={-D / 2 - 0.45} />
          <text x={0} y={-D / 2 - 0.65} textAnchor="middle" stroke="none">{(W * 1000).toFixed(0)}</text>
          <line y1={-D / 2} y2={D / 2} x1={W / 2 + 0.55} x2={W / 2 + 0.55} />
          <line y1={-D / 2} y2={-D / 2} x1={W / 2 + 0.45} x2={W / 2 + 0.65} />
          <line y1={D / 2} y2={D / 2} x1={W / 2 + 0.45} x2={W / 2 + 0.65} />
          <text x={W / 2 + 0.7} y={0} stroke="none" transform={`rotate(90 ${W / 2 + 0.7} 0)`} textAnchor="middle">{(D * 1000).toFixed(0)}</text>
          {/* North arrow & scale */}
          <g transform={`translate(${-W / 2} ${D / 2 + 0.6})`}>
            <rect x={0} y={-0.05} width={1} height={0.05} />
            <rect x={1} y={-0.05} width={1} height={0.05} fill="none" />
            <text x={0} y={0.25} stroke="none" fontSize={0.16}>0</text>
            <text x={1} y={0.25} stroke="none" fontSize={0.16} textAnchor="middle">1</text>
            <text x={2} y={0.25} stroke="none" fontSize={0.16} textAnchor="middle">2 m</text>
          </g>
        </g>
      )}
    </svg>
  );
}
