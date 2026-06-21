/** Web map — SVG choropleth of all 117 ACs. react-native-maps is native-only,
 *  so on web we project the geojson rings ourselves and draw them with
 *  react-native-svg. Same props/contract as the native MapCanvas. */
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
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

// Prebuild path strings once: x = lon, y = (maxLat - lat) so north is up.
const PATHS = polygons.map((p) => ({
  no: p.no,
  d:
    p.coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'}${(c.longitude - B.minLon).toFixed(4)} ${(B.maxLat - c.latitude).toFixed(4)}`)
      .join(' ') + ' Z',
}));

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

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        <G>
          {PATHS.map((p) => {
            const active = p.no === activeNo;
            return (
              <Path
                key={p.no}
                d={p.d}
                fill={hexA(fills[p.no], active ? 0.98 : 0.85)}
                stroke={active ? colors.accent : 'rgba(255,255,255,0.4)'}
                strokeWidth={active ? 0.013 : 0.005}
                onPress={() => onSelect(p.no)}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.mapBg },
});
