/** Web map — SVG choropleth of all 117 ACs. react-native-maps is native-only,
 *  so on web we project the geojson rings and draw them with react-native-svg.
 *  Click a seat to zoom to it; click empty space to zoom out.
 *
 *  Zoom is applied as a View transform (scale + translate) on a wrapper, not
 *  via the SVG viewBox/<G> transform — react-native-svg only re-renders leaf
 *  paint props (fill/stroke), so its own transforms won't animate. A View
 *  transform is plain CSS on web and updates reliably. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Rect } from 'react-native-svg';
import { polygons, fillFor, type ColorMode } from '../lib/geo';
import type { Pulse } from '../lib/pulse';
import { colors } from '../theme';

type Props = {
  pulse: Record<number, Pulse>;
  colorMode: ColorMode;
  activeNo: number | null;
  onSelect: (no: number) => void;
};

// Geographic bounds across every ring → SVG viewBox (latitude flipped).
const B = (() => {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  polygons.forEach((p) =>
    p.coords.forEach((c) => {
      if (c.longitude < minLon) minLon = c.longitude;
      if (c.longitude > maxLon) maxLon = c.longitude;
      if (c.latitude < minLat) minLat = c.latitude;
      if (c.latitude > maxLat) maxLat = c.latitude;
    }),
  );
  const pad = 0.05;
  return { minLon: minLon - pad, maxLon: maxLon + pad, minLat: minLat - pad, maxLat: maxLat + pad };
})();
const VB_W = B.maxLon - B.minLon;
const VB_H = B.maxLat - B.minLat;

type Box = [number, number, number, number];

// Prebuild path strings + per-seat bbox once (x = lon, y = maxLat - lat).
const PATHS = polygons.map((p) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const d =
    p.coords
      .map((c, i) => {
        const x = c.longitude - B.minLon;
        const y = B.maxLat - c.latitude;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(4)} ${y.toFixed(4)}`;
      })
      .join(' ') + ' Z';
  return { no: p.no, d, bbox: [minX, minY, maxX - minX, maxY - minY] as Box };
});
const BBOX: Record<number, Box> = Object.fromEntries(PATHS.map((p) => [p.no, p.bbox]));

// Pad a seat bbox; clamp so tiny urban seats don't over-zoom.
function focusBox(b: Box): Box {
  const padX = b[2] * 0.6 + 0.02;
  const padY = b[3] * 0.6 + 0.02;
  let [x, y, w, h] = [b[0] - padX, b[1] - padY, b[2] + padX * 2, b[3] + padY * 2];
  const MINW = 0.2, MINH = 0.16;
  if (w < MINW) { x -= (MINW - w) / 2; w = MINW; }
  if (h < MINH) { y -= (MINH - h) / 2; h = MINH; }
  return [x, y, w, h];
}

type Cam = { s: number; tx: number; ty: number };
const IDENTITY: Cam = { s: 1, tx: 0, ty: 0 };

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

function hexA(hex: string, a: number): string {
  if (!hex.startsWith('#') || hex.length < 7) return hex;
  const alpha = Math.round(a * 255).toString(16).padStart(2, '0');
  return `${hex.slice(0, 7)}${alpha}`;
}

export default function MapCanvas({ pulse, colorMode, activeNo, onSelect }: Props) {
  const fills = useMemo(() => {
    const m: Record<number, string> = {};
    PATHS.forEach((p) => (m[p.no] = fillFor(p.no, colorMode, pulse)));
    return m;
  }, [colorMode, pulse]);

  const wrapRef = useRef<any>(null);
  const [resizeTick, setResizeTick] = useState(0);
  const [cam, setCam] = useState<Cam>(IDENTITY);
  const camRef = useRef<Cam>(IDENTITY);
  const rafRef = useRef<number>(0);

  // onLayout is unreliable on the web export, so measure the container DOM node.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onR = () => setResizeTick((x) => x + 1);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);

  useEffect(() => {
    const el = wrapRef.current as { clientWidth?: number; clientHeight?: number } | null;
    const w = el?.clientWidth || 0;
    const h = el?.clientHeight || 0;
    let target: Cam = IDENTITY;
    if (w > 0 && h > 0 && activeNo != null && BBOX[activeNo]) {
      // SVG content scale under preserveAspectRatio="meet" + centering offset.
      const k = Math.min(w / VB_W, h / VB_H);
      const ox = (w - VB_W * k) / 2;
      const oy = (h - VB_H * k) / 2;
      const [fx, fy, fw, fh] = focusBox(BBOX[activeNo]);
      const s = Math.min(w / (fw * k), h / (fh * k)); // zoom so the seat fills the view
      const px = ox + (fx + fw / 2) * k; // seat center in container px
      const py = oy + (fy + fh / 2) * k;
      // transform-origin top-left: mapped(P) = s*P + t; center the seat → t = C - s*P
      target = { s, tx: w / 2 - s * px, ty: h / 2 - s * py };
    }
    const start = camRef.current;
    const t0 = now();
    const dur = 420;
    clearTimeout(rafRef.current);
    // setTimeout (not requestAnimationFrame) so the tween still completes when
    // the tab is backgrounded/throttled; foreground stays smooth at ~60fps.
    const step = () => {
      const t = Math.min(1, (now() - t0) / dur);
      const e = easeInOut(t);
      const cur: Cam = {
        s: start.s + (target.s - start.s) * e,
        tx: start.tx + (target.tx - start.tx) * e,
        ty: start.ty + (target.ty - start.ty) * e,
      };
      camRef.current = cur;
      setCam(cur);
      if (t < 1) rafRef.current = setTimeout(step, 16) as unknown as number;
    };
    step();
    return () => clearTimeout(rafRef.current);
  }, [activeNo, resizeTick]);

  return (
    <View style={styles.wrap} ref={wrapRef}>
      <View
        style={[
          styles.stage,
          // @ts-ignore transformOrigin is supported by react-native-web
          { transformOrigin: 'left top', transform: [{ translateX: cam.tx }, { translateY: cam.ty }, { scale: cam.s }] },
        ]}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
          {/* Background — click empty space to zoom out / deselect */}
          <Rect x={0} y={0} width={VB_W} height={VB_H} fill={colors.mapBg} onPress={() => onSelect(-1)} />
          <G>
            {PATHS.map((p) => {
              const active = p.no === activeNo;
              return (
                <Path
                  key={p.no}
                  d={p.d}
                  fill={hexA(fills[p.no], active ? 0.98 : 0.85)}
                  stroke={active ? colors.accent : 'rgba(255,255,255,0.4)'}
                  strokeWidth={active ? 0.011 : 0.005}
                  onPress={() => onSelect(p.no)}
                />
              );
            })}
          </G>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: 'hidden', backgroundColor: colors.mapBg },
  stage: { width: '100%', height: '100%' },
});
