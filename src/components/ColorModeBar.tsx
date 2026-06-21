import React from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
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
  return (
    <ScrollView
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
  row: { gap: 8, paddingHorizontal: 14, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(20,28,42,0.85)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
});
