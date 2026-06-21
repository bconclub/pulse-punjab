/** Native choropleth — all 117 constituency polygons on a dark map. */
import React, { useMemo } from 'react';
import { StyleSheet, Platform } from 'react-native';
import MapView, { Polygon, Region } from 'react-native-maps';
import { polygons, fillFor, type ColorMode } from '../lib/geo';
import type { Pulse } from '../lib/pulse';
import { colors } from '../theme';
import { DARK_MAP_STYLE } from './mapStyle';

const PUNJAB: Region = {
  latitude: 30.95,
  longitude: 75.4,
  latitudeDelta: 3.0,
  longitudeDelta: 2.8,
};

type Props = {
  pulse: Record<number, Pulse>;
  colorMode: ColorMode;
  activeNo: number | null;
  onSelect: (no: number) => void;
};

export default function MapCanvas({ pulse, colorMode, activeNo, onSelect }: Props) {
  // Recompute fills only when mode / data / selection change.
  const styled = useMemo(
    () =>
      polygons.map((p) => ({
        ...p,
        fill: fillFor(p.no, colorMode, pulse),
      })),
    [colorMode, pulse],
  );

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={PUNJAB}
      customMapStyle={DARK_MAP_STYLE}
      userInterfaceStyle="dark"
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      showsBuildings={false}
      mapType={Platform.OS === 'android' ? 'standard' : 'mutedStandard'}
    >
      {styled.map((p) => {
        const active = p.no === activeNo;
        return (
          <Polygon
            key={p.no}
            coordinates={p.coords}
            fillColor={hexA(p.fill, active ? 0.95 : 0.82)}
            strokeColor={active ? colors.accent : 'rgba(255,255,255,0.35)'}
            strokeWidth={active ? 2.5 : 0.6}
            tappable
            onPress={() => onSelect(p.no)}
            zIndex={active ? 10 : 1}
          />
        );
      })}
    </MapView>
  );
}

/** Apply alpha to a #RRGGBB color → #RRGGBBAA. */
function hexA(hex: string, a: number): string {
  if (!hex.startsWith('#') || hex.length < 7) return hex;
  const alpha = Math.round(a * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex.slice(0, 7)}${alpha}`;
}
