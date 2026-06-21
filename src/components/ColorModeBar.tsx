import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
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
  // Wrap rather than horizontal-scroll: every mode stays visible (horizontal
  // scroll is unreachable with a mouse and overflowed the narrow rail).
  return (
    <View style={styles.row}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 14, paddingVertical: 2 },
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
