import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface PinModalProps {
  visible: boolean;
  onSubmit: (pin: string) => void;
  onClose: () => void;
  isSetup?: boolean;
}

export function PinModal({ visible, onSubmit, onClose, isSetup }: PinModalProps) {
  const [pin, setPin] = useState('');

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        onSubmit(next);
        setPin('');
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{isSetup ? 'Crée ton code parent' : 'Code parent'}</Text>
          <View style={styles.dots}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled]} />
            ))}
          </View>
          <View style={styles.grid}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.key, !k && styles.keyEmpty]}
                onPress={() => k === '⌫' ? handleDelete() : k ? handlePress(k) : null}
                disabled={!k}
              >
                <Text style={styles.keyText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  container: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', width: 300 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 24, color: '#1a1a2e' },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#2d8a55' },
  dotFilled: { backgroundColor: '#2d8a55' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 220, justifyContent: 'center', gap: 12 },
  key: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  keyEmpty: { backgroundColor: 'transparent' },
  keyText: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  cancel: { marginTop: 16, color: '#999', fontSize: 14 },
});
