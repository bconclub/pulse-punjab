/** Pulse of Punjab — native app root.
 *  Brand header + tab nav (Map / Seats / Program / Journey) + detail sheet. */
import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Sora_700Bold } from '@expo-google-fonts/sora';

import { Txt } from './src/components/ui';
import MapCanvas from './src/components/MapCanvas';
import ColorModeBar from './src/components/ColorModeBar';
import Legend from './src/components/Legend';
import SeatList from './src/components/SeatList';
import DetailSheet from './src/components/DetailSheet';
import ProgramScreen from './src/screens/ProgramScreen';
import JourneyScreen from './src/screens/JourneyScreen';

import { api } from './src/lib/api';
import { registerForPush, sendLocal } from './src/lib/notifications';
import type { Pulse } from './src/lib/pulse';
import type { ColorMode } from './src/lib/geo';
import { constituencies, districts } from './src/data';
import { colors, radius } from './src/theme';

type Tab = 'map' | 'seats' | 'program' | 'journey';
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'seats', label: 'Seats', icon: 'list' },
  { id: 'program', label: 'Program', icon: 'layers' },
  { id: 'journey', label: 'Journey', icon: 'smartphone' },
];

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Sora_700Bold,
  });

  const [tab, setTab] = useState<Tab>('map');
  const [colorMode, setColorMode] = useState<ColorMode>('engagement');
  const [pulse, setPulse] = useState<Record<number, Pulse>>({});
  const [activeNo, setActiveNo] = useState<number | null>(null);

  useEffect(() => {
    api.getPulseAll().then(setPulse);
    registerForPush().catch(() => {});
  }, []);

  function select(no: number) {
    setActiveNo(no);
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.app} edges={['top']}>
        {/* Brand header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.mark}>
              <Feather name="map-pin" size={16} color={colors.accent} />
            </View>
            <View>
              <Txt size={16} weight="display">
                Pulse of Punjab
              </Txt>
              <Txt size={10.5} color={colors.accent} weight="semibold" style={{ letterSpacing: 0.3 }}>
                PUNJAB YATRA 2026 · ਪੰਜਾਬੀਅਤ ਦੀ ਲਹਿਰ
              </Txt>
            </View>
          </View>
          <Pressable
            hitSlop={10}
            style={styles.bell}
            onPress={() => sendLocal('Pulse of Punjab', 'Notifications are live on this device. ✓')}
          >
            <Feather name="bell" size={18} color={colors.textDim} />
          </Pressable>
        </View>

        {/* Stat strip (map tab only) */}
        {tab === 'map' && (
          <View style={styles.statRow}>
            <Stat n={String(constituencies.length)} l="Seats" />
            <Stat n={String(districts.length)} l="Districts" />
            <Stat n="2022" l="Baseline" />
            <Stat n="ਸਭ ਦੀ" l="ਸੁਣਾਂਗੇ" />
          </View>
        )}

        {/* Content */}
        <View style={{ flex: 1 }}>
          {tab === 'map' && (
            <View style={{ flex: 1 }}>
              <MapCanvas pulse={pulse} colorMode={colorMode} activeNo={activeNo} onSelect={select} />
              <View style={styles.topOverlay} pointerEvents="box-none">
                <ColorModeBar mode={colorMode} onChange={setColorMode} />
              </View>
              <View style={styles.legendOverlay} pointerEvents="none">
                <Legend mode={colorMode} />
              </View>
            </View>
          )}
          {tab === 'seats' && <SeatList onSelect={select} />}
          {tab === 'program' && <ProgramScreen />}
          {tab === 'journey' && <JourneyScreen activeNo={activeNo} />}
        </View>

        {/* Bottom tab bar */}
        <View style={styles.tabbar}>
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <Pressable key={t.id} style={styles.tabItem} onPress={() => setTab(t.id)}>
                <Feather name={t.icon} size={20} color={active ? colors.accent : colors.faint} />
                <Txt
                  size={10.5}
                  weight={active ? 'semibold' : 'medium'}
                  color={active ? colors.accent : colors.faint}
                  style={{ marginTop: 3 }}
                >
                  {t.label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      <DetailSheet no={activeNo} pulse={pulse} onClose={() => setActiveNo(null)} />
    </SafeAreaProvider>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <View style={styles.stat}>
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
  boot: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  app: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bell: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    alignItems: 'center',
  },
  topOverlay: { position: 'absolute', top: 10, left: 0, right: 0 },
  legendOverlay: { position: 'absolute', left: 12, bottom: 16 },
  tabbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgElev,
    paddingTop: 8,
    paddingBottom: 6,
  },
  tabItem: { flex: 1, alignItems: 'center' },
});
