import React from 'react';
import { Modal, View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt, Divider } from './ui';
import MetricGrid from './MetricGrid';
import AgeBars from './AgeBars';
import { byNo, framework, results } from '../data';
import { winnerOf } from '../lib/geo';
import { party as PARTY, phase as PHASE, colors, radius, space } from '../theme';
import type { Pulse } from '../lib/pulse';
import { api } from '../lib/api';
import { sendLocal } from '../lib/notifications';

const FEATURE_ICON: Record<string, any> = {
  volunteer: 'users',
  stay_updated: 'bell',
  share_voice: 'mic',
  join_events: 'calendar',
  location: 'map-pin',
};

export default function DetailSheet({
  no,
  pulse,
  onClose,
}: {
  no: number | null;
  pulse: Record<number, Pulse>;
  onClose: () => void;
}) {
  const open = no != null;
  const c = no != null ? byNo[no] : null;
  const p = no != null ? pulse[no] : null;
  const w = no != null ? winnerOf(no) : null;

  async function notify() {
    if (no == null) return;
    await api.subscribe({ no, channel: 'push' });
    await sendLocal(
      `${c?.name} · you're subscribed`,
      'Constituency updates will reach you here. Demo alert.',
    );
  }

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grab} />
          {c && p && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              <View style={styles.headRow}>
                <View style={{ flex: 1 }}>
                  <Txt size={22} weight="display">
                    {c.no}. {c.name}
                  </Txt>
                  <Txt size={12.5} dim style={{ marginTop: 3 }}>
                    {c.district} district · {c.lha} (LS)
                    {c.reserved ? ` · ${c.reserved} reserved` : ''}
                  </Txt>
                </View>
                <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
                  <Feather name="x" size={20} color={colors.textDim} />
                </Pressable>
              </View>

              {w && (
                <View style={styles.winner}>
                  <View style={[styles.partyDot, { backgroundColor: PARTY[w.party] || colors.faint }]} />
                  <Txt size={12.5} dim>
                    2022 MLA{'  '}
                    <Txt size={12.5} weight="semibold" color={colors.text}>
                      {w.winner}
                    </Txt>{' '}
                    <Txt size={12.5} weight="semibold" color={PARTY[w.party] || colors.text}>
                      ({w.party})
                    </Txt>
                  </Txt>
                </View>
              )}

              <View style={{ height: 14 }} />
              <MetricGrid p={p} />
              <AgeBars age={p.age} />

              <Divider />
              <Txt size={11} weight="bold" dim style={styles.section}>
                SCAN-CARD FEATURES
              </Txt>
              <View style={styles.chips}>
                {framework.scanCard.features.map((f: any) => (
                  <View key={f.id} style={styles.chip}>
                    <Feather name={FEATURE_ICON[f.id] || 'circle'} size={14} color={colors.accent} />
                    <Txt size={12} weight="medium">
                      {f.label}
                    </Txt>
                  </View>
                ))}
              </View>

              <Txt size={11} weight="bold" dim style={styles.section}>
                GRIEVANCE PIPELINE
              </Txt>
              <View style={styles.flow}>
                {framework.grievancePipeline.stages.map((s: any, i: number) => (
                  <React.Fragment key={s.id}>
                    <View style={styles.node}>
                      <Txt size={11} dim>
                        {s.label}
                      </Txt>
                    </View>
                    {i < framework.grievancePipeline.stages.length - 1 && (
                      <Feather name="chevron-right" size={13} color={colors.faint} />
                    )}
                  </React.Fragment>
                ))}
              </View>

              <Pressable style={styles.cta} onPress={notify}>
                <Feather name="bell" size={16} color={colors.bg} />
                <Txt size={14.5} weight="bold" color={colors.bg}>
                  Subscribe to updates
                </Txt>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(4,7,12,0.6)' },
  sheet: {
    maxHeight: '86%',
    backgroundColor: colors.bgElev,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border2, marginBottom: 12 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  close: { padding: 4 },
  winner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  partyDot: { width: 10, height: 10, borderRadius: 5 },
  section: { letterSpacing: 0.6, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.surface2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  flow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 6 },
  node: {
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 9,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 13,
    marginTop: space(6),
  },
});
