/** Desktop 3-pane dashboard: left nav rail · center map · right detail panel.
 *  Rendered at width >= 960; below that App falls back to the mobile tab layout. */
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from './ui';
import MapCanvas from './MapCanvas';
import ColorModeBar from './ColorModeBar';
import Legend from './Legend';
import SeatList from './SeatList';
import DetailContent from './DetailContent';
import { constituencies, districts } from '../data';
import { colors, radius } from '../theme';
import type { Pulse } from '../lib/pulse';
import type { ColorMode } from '../lib/geo';

type Props = {
  pulse: Record<number, Pulse>;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  activeNo: number | null;
  onSelect: (no: number) => void;
  onOpenProgram: () => void;
  onOpenJourney: () => void;
  onBell: () => void;
};

export default function DesktopLayout({
  pulse,
  colorMode,
  setColorMode,
  activeNo,
  onSelect,
  onOpenProgram,
  onOpenJourney,
  onBell,
}: Props) {
  return (
    <View style={styles.root}>
      {/* LEFT — nav rail */}
      <View style={styles.left}>
        <View style={styles.brandRow}>
          <View style={styles.mark}>
            <Feather name="map-pin" size={15} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt size={15} weight="display">
              Pulse of Punjab
            </Txt>
            <Txt size={9.5} color={colors.accent} weight="semibold" style={{ letterSpacing: 0.3 }}>
              PUNJAB YATRA 2026
            </Txt>
          </View>
          <Pressable style={styles.iconBtn} onPress={onBell} hitSlop={8}>
            <Feather name="bell" size={16} color={colors.textDim} />
          </Pressable>
        </View>

        <View style={styles.cmWrap}>
          <Txt size={10} weight="bold" faint style={{ letterSpacing: 0.6, marginLeft: 16, marginBottom: 6 }}>
            COLOR MODE
          </Txt>
          <ColorModeBar mode={colorMode} onChange={setColorMode} />
        </View>

        <View style={{ flex: 1, minHeight: 0 }}>
          <SeatList onSelect={onSelect} activeNo={activeNo} />
        </View>

        <View style={styles.navBtns}>
          <Pressable style={styles.navBtn} onPress={onOpenProgram}>
            <Feather name="layers" size={15} color={colors.accent} />
            <Txt size={12.5} weight="semibold">
              Program
            </Txt>
          </Pressable>
          <Pressable style={styles.navBtn} onPress={onOpenJourney}>
            <Feather name="smartphone" size={15} color={colors.accent} />
            <Txt size={12.5} weight="semibold">
              Journey
            </Txt>
          </Pressable>
        </View>
      </View>

      {/* CENTER — map */}
      <View style={styles.center}>
        <View style={styles.statRow}>
          <Stat n={String(constituencies.length)} l="Seats" />
          <Stat n={String(districts.length)} l="Districts" />
          <Stat n="2022" l="Baseline" />
          <Stat n="ਸਭ ਦੀ ਸੁਣਾਂਗੇ" l="We listen to everyone" wide />
        </View>
        <View style={{ flex: 1 }}>
          <MapCanvas pulse={pulse} colorMode={colorMode} activeNo={activeNo} onSelect={onSelect} />
          <View style={styles.legendOverlay} pointerEvents="none">
            <Legend mode={colorMode} />
          </View>
        </View>
      </View>

      {/* RIGHT — detail / insights */}
      <View style={styles.right}>
        <View style={styles.rightHead}>
          <Txt size={11} weight="bold" faint style={{ letterSpacing: 0.6 }}>
            CONSTITUENCY DETAIL
          </Txt>
          {activeNo != null && (
            <Pressable onPress={() => onSelect(-1)} hitSlop={8}>
              <Txt size={11.5} color={colors.accent} weight="semibold">
                Clear
              </Txt>
            </Pressable>
          )}
        </View>
        <View style={{ flex: 1, paddingHorizontal: 18 }}>
          <DetailContent no={activeNo} pulse={pulse} />
        </View>
      </View>
    </View>
  );
}

function Stat({ n, l, wide }: { n: string; l: string; wide?: boolean }) {
  return (
    <View style={[styles.stat, wide && { flex: 1.6 }]}>
      <Txt size={15} weight="bold">
        {n}
      </Txt>
      <Txt size={9.5} faint style={{ letterSpacing: 0.4, marginTop: 1 }}>
        {l.toUpperCase()}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },
  left: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.bgElev,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mark: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cmWrap: { paddingTop: 12, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  navBtns: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 11,
  },
  center: { flex: 1, minWidth: 0 },
  statRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  legendOverlay: { position: 'absolute', left: 16, bottom: 18 },
  right: {
    width: 372,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    backgroundColor: colors.bgElev,
  },
  rightHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
