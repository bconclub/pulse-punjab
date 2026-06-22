import React, { useEffect, useRef } from 'react';
import { ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { Txt } from './ui';
import { COLOR_MODES, type ColorMode } from '../lib/geo';
import { colors, radius } from '../theme';

export default function ColorModeBar({
  mode,
  onChange,
}: {
  mode: ColorMode;
  onChange: (m: ColorMode) => void;
}) {
  const ref = useRef<any>(null);

  // On web, translate vertical mouse-wheel into horizontal scroll so the chip
  // row is scrollable with a normal mouse (not just trackpad/touch).
  useEffect(() => {
    if (Platform.OS !== 'web' || !ref.current) return;
    const node = ref.current.getScrollableNode ? ref.current.getScrollableNode() : ref.current;
    if (!node || !node.addEventListener) return;
    const onWheel = (e: any) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        node.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {COLOR_MODES.map((m) => {
        const active = m.id === mode;
        return (
          <Pressable
            key={m.id}
            onPress={() => onChange(m.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Txt
              size={12.5}
              weight={active ? 'semibold' : 'medium'}
              color={active ? colors.bg : colors.textDim}
            >
              {m.label}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 7, paddingHorizontal: 14, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(20,28,42,0.85)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
});
