import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { Copy, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { getProduct } from '@/data/furniture';
import { footprint, itemBaseY } from '@/lib/placement';
import { useStudio } from '@/store/studio';
import { ProductModel } from '../Furniture/ProductModel';
import { t } from '@/i18n';

/* ------------------------------------------------------------------ */
/* Drag controller: moves the selected item across a horizontal plane  */
/* at the height where it was grabbed, so it stays under the pointer.  */
/* ------------------------------------------------------------------ */

let startDrag: ((uid: string, e: ThreeEvent<PointerEvent>) => void) | null = null;

export function DragController() {
  const { camera, gl } = useThree();
  const controls = useThree((st) => st.controls) as { enabled: boolean } | null;
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    let state: { uid: string; plane: THREE.Plane; offset: THREE.Vector3; pointerId: number } | null = null;
    let frame = 0;
    let last: PointerEvent | null = null;

    const project = (ev: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect();
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.ray.intersectPlane(state!.plane, hit);
    };
    const apply = () => {
      frame = 0;
      if (!state || !last) return;
      if (project(last)) useStudio.getState().dragTo(state.uid, hit.x + state.offset.x, hit.z + state.offset.z);
    };
    const move = (ev: PointerEvent) => {
      if (!state || ev.pointerId !== state.pointerId) return;
      last = ev;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const up = (ev: PointerEvent) => {
      if (!state || ev.pointerId !== state.pointerId) return;
      state = null;
      cancelAnimationFrame(frame);
      frame = 0;
      gl.domElement.style.cursor = '';
      if (controls) controls.enabled = true;
      useStudio.getState().endDrag();
    };

    startDrag = (uid, e) => {
      const it = useStudio.getState().items.find((i) => i.uid === uid);
      if (!it) return;
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -e.point.y);
      state = { uid, plane, offset: new THREE.Vector3(it.x - e.point.x, 0, it.z - e.point.z), pointerId: e.pointerId };
      gl.domElement.style.cursor = 'grabbing';
      // Disable orbiting synchronously: the controls already saw this pointerdown.
      if (controls) controls.enabled = false;
      useStudio.getState().beginDrag();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      startDrag = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [camera, gl, controls]);
  return null;
}

/* ------------------------------------------------------------------ */
/* Selection footprint                                                 */
/* ------------------------------------------------------------------ */

function Footprint({ w, d, y, color, corners }: { w: number; d: number; y: number; color: string; corners: boolean }) {
  const geo = useMemo(() => {
    const pad = 0.05;
    const hx = w / 2 + pad, hz = d / 2 + pad;
    const pts: number[] = [];
    if (corners) {
      const l = Math.min(0.22, hx * 0.6, hz * 0.6);
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const cx = sx * hx, cz = sz * hz;
        pts.push(cx, 0, cz, cx - sx * l, 0, cz, cx, 0, cz, cx, 0, cz - sz * l);
      }
    } else {
      const c = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]];
      for (let i = 0; i < 4; i++) {
        const a = c[i], b = c[(i + 1) % 4];
        pts.push(a[0], 0, a[1], b[0], 0, b[1]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [w, d, corners]);
  return (
    <lineSegments geometry={geo} position={[0, y, 0]} renderOrder={10}>
      <lineBasicMaterial color={color} depthTest={false} transparent opacity={0.95} />
    </lineSegments>
  );
}

function ActionBar({ uid, name, height }: { uid: string; name: string; height: number }) {
  const s = useStudio.getState;
  const isWall = getProduct(useStudio.getState().items.find((i) => i.uid === uid)?.productId ?? '')?.placement === 'wall';
  const stop = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation();
  const btn = 'grid h-8 w-8 place-items-center text-ivory/80 transition-colors hover:bg-white/10 hover:text-ivory focus-visible:bg-white/10';
  return (
    <Html position={[0, height + 0.25, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="pointer-events-auto flex select-none items-center bg-ink/95 text-ivory shadow-[0_8px_30px_rgba(0,0,0,0.18)]" onPointerDown={stop} onClick={stop}>
        <span className="whitespace-nowrap px-3 font-sans text-[0.72rem] tracking-[0.02em]">{name}</span>
        <span className="h-5 w-px bg-white/15" />
        {!isWall && (
          <>
            <button aria-label={t('Rotate left 45°')} title={t('Rotate left (Shift+R)')} className={btn} onClick={() => s().rotateItem(uid, Math.PI / 4)}><RotateCcw size={14} strokeWidth={1.5} /></button>
            <button aria-label={t('Rotate right 45°')} title={t('Rotate right (R)')} className={btn} onClick={() => s().rotateItem(uid, -Math.PI / 4)}><RotateCw size={14} strokeWidth={1.5} /></button>
          </>
        )}
        <button aria-label={t('Duplicate')} title={t('Duplicate (Ctrl+D)')} className={btn} onClick={() => s().duplicateItem(uid)}><Copy size={14} strokeWidth={1.5} /></button>
        <button aria-label={t('Remove')} title={t('Remove (Delete)')} className={btn} onClick={() => s().removeItem(uid)}><Trash2 size={14} strokeWidth={1.5} /></button>
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------------ */
/* Placed item                                                         */
/* ------------------------------------------------------------------ */

const Item = memo(function Item({ uid, interactive }: { uid: string; interactive: boolean }) {
  const item = useStudio((s) => s.items.find((i) => i.uid === uid)!);
  const baseY = useStudio((s) => {
    const it = s.items.find((i) => i.uid === uid);
    const p = it && getProduct(it.productId);
    return it && p ? itemBaseY(it, p, s.items, s.room) : 0;
  });
  const roomHeight = useStudio((s) => s.room.height);
  const selected = useStudio((s) => s.selectedId === uid);
  const hovered = useStudio((s) => s.hoveredId === uid);
  const capturing = useStudio((s) => s.capturing);
  const preview = useStudio((s) => s.preview);
  const product = getProduct(item?.productId ?? '');
  const groupRef = useRef<THREE.Group>(null);
  if (!item || !product) return null;

  const w = product.dims.w / 100, d = product.dims.d / 100, h = product.dims.h / 100;
  const showHelpers = interactive && !capturing && !preview;

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive || preview) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    useStudio.getState().select(uid);
    startDrag?.(uid, e);
  };

  const isWall = product.placement === 'wall';
  const isCeiling = product.placement === 'ceiling';
  const footY = isWall || isCeiling ? 0.012 - baseY : 0.012;

  return (
    <group position={[item.x, baseY, item.z]} rotation={[0, item.rotation, 0]}>
      <group
        ref={groupRef}
        onPointerDown={onDown}
        onClick={interactive ? (e) => e.stopPropagation() : undefined}
        onPointerOver={interactive ? (e) => { e.stopPropagation(); useStudio.getState().hover(uid); } : undefined}
        onPointerOut={interactive ? () => { if (useStudio.getState().hoveredId === uid) useStudio.getState().hover(null); } : undefined}
      >
        <ProductModel productId={item.productId} materials={item.materials} ceiling={roomHeight - baseY} />
      </group>
      {showHelpers && (selected || hovered) && (
        <Footprint w={isWall ? w : w} d={isWall ? 0.12 : d} y={footY} color={selected ? '#777D63' : '#B8AD9D'} corners={selected} />
      )}
      {showHelpers && selected && <ActionBar uid={uid} name={product.name} height={isCeiling ? -baseY + 0.1 : h} />}
    </group>
  );
});

export function Items({ interactive = true }: { interactive?: boolean }) {
  const ids = useStudio((s) => s.items.map((i) => i.uid).join('|'));
  const list = useMemo(() => (ids ? ids.split('|') : []), [ids]);
  return (
    <group>
      {list.map((uid) => <Item key={uid} uid={uid} interactive={interactive} />)}
    </group>
  );
}

export { footprint };
