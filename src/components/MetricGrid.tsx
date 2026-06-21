import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Txt } from './ui';
import type { Pulse } from '../lib/pulse';
import { colors, radius, phase } from '../theme';

function Metric({
  v,
  k,
  accent,
  bar,
}: {
  v: string | number;
  k: string;
  accent: string;
  bar?: number;
}) {
  return (
    <View style={[styles.cell, { borderLeftColor: accent }]}>
      <Txt size={19} weight="bold">
        {v}
      </Txt>
      <Txt size={10} faint style={{ letterSpacing: 0.3, marginTop: 1 }}>
        {k.toUpperCase()}
      </Txt>
      {bar != null && (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, bar)}%`, backgroundColor: accent }]} />
        </View>
      )}
    </View>
  );
}

export default function MetricGrid({ p }: { p: Pulse }) {
  return (
    <View style={styles.grid}>
      <Metric v={p.interactions} k="Interactions" accent={phase.P1} />
      <Metric v={p.comments} k="Comments" accent={phase.P1} />
      <Metric v={p.volunteers} k="Volunteers" accent={phase.P1} />
      <Metric v={p.grievances} k="Grievances" accent={phase.P2} />
      <Metric v={`${p.resolved}/${p.grievances}`} k="Resolved" accent={phase.P2} />
      <Metric v={`${p.conversion}%`} k="Conv. intent" accent={phase.P3} bar={p.conversion} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: {
    width: '31.5%',
    flexGrow: 1,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: 9,
  },
  track: { height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
});
