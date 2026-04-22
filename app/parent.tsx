import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Switch, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useParentStore } from '../src/store/parentStore';
import { useGameStore } from '../src/store/gameStore';
import { useMissionStore } from '../src/store/missionStore';
import { DEFAULT_MISSIONS, Mission } from '../src/data/missions';
import { cancelAllNotifications, scheduleInactivityNotification } from '../src/utils/notifications';

export default function ParentScreen() {
  const { sessionDurationMinutes, setSessionDuration, notificationsEnabled, toggleNotifications, lock } = useParentStore();
  const { totalXP, streak, gamesWon } = useGameStore();
  const { completedToday, addCustomMission } = useMissionStore();

  const handleClose = () => { lock(); router.back(); };

  const handleToggleNotifications = async () => {
    toggleNotifications();
    if (notificationsEnabled) await cancelAllNotifications();
    else await scheduleInactivityNotification();
  };

  const handleAddMission = (mission: Mission) => {
    addCustomMission({ ...mission, id: `custom_${Date.now()}`, isCustom: true });
    Alert.alert('Mission ajoutée !', `"${mission.dinoTitle}" a été ajoutée aux missions du jour.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>📊 Statistiques</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>{totalXP}</Text><Text style={styles.statLabel}>XP total</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{completedToday}</Text><Text style={styles.statLabel}>Missions auj.</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{streak}</Text><Text style={styles.statLabel}>Jours de suite</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{gamesWon}</Text><Text style={styles.statLabel}>Jeux gagnés</Text></View>
        </View>

        <Text style={styles.section}>⏱️ Durée de session</Text>
        <View style={styles.durationRow}>
          {([5, 10, 15] as const).map(d => (
            <TouchableOpacity key={d} style={[styles.durationBtn, sessionDurationMinutes === d && styles.durationBtnActive]} onPress={() => setSessionDuration(d)}>
              <Text style={[styles.durationText, sessionDurationMinutes === d && styles.durationTextActive]}>{d} min</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>🔔 Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={handleToggleNotifications} trackColor={{ true: '#2d8a55' }} />
        </View>

        <Text style={styles.section}>➕ Ajouter une mission</Text>
        {DEFAULT_MISSIONS.filter(m => m.type === 'real').map(m => (
          <TouchableOpacity key={m.id} style={styles.missionRow} onPress={() => handleAddMission(m)}>
            <Text style={styles.missionIcon}>{m.icon}</Text>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{m.realTitle}</Text>
              <Text style={styles.missionSub}>{m.dinoTitle}</Text>
            </View>
            <Text style={styles.addBtn}>+</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeBtnText}>Fermer le mode parent</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },
  section: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', marginTop: 24, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },
  durationRow: { flexDirection: 'row', gap: 12 },
  durationBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, alignItems: 'center' },
  durationBtnActive: { backgroundColor: '#2d8a55' },
  durationText: { fontWeight: 'bold', color: '#555' },
  durationTextActive: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLabel: { fontSize: 15, color: '#1a1a2e' },
  missionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  missionIcon: { fontSize: 28, marginRight: 12 },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a2e' },
  missionSub: { fontSize: 12, color: '#888' },
  addBtn: { fontSize: 24, color: '#2d8a55', fontWeight: 'bold', paddingHorizontal: 8 },
  closeBtn: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 32, marginBottom: 20 },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
