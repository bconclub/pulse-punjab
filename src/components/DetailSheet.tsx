/** Mobile detail - bottom-sheet modal wrapping the shared DetailContent. */
import React from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import DetailContent from './DetailContent';
import { colors, radius } from '../theme';
import type { Pulse } from '../lib/pulse';

export default function DetailSheet({
  no,
  pulse,
  onClose,
}: {
  no: number | null;
  pulse: Record<number, Pulse>;
  onClose: () => void;
}) {
  return (
    <Modal visible={no != null} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grab} />
          <DetailContent no={no} pulse={pulse} onClose={onClose} />
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
});
