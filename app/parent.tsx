import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Switch, ScrollView, Alert, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useParentStore } from '../src/store/parentStore';
import { useGameStore } from '../src/store/gameStore';
import { useMissionStore } from '../src/store/missionStore';
import { DEFAULT_MISSIONS, Mission } from '../src/data/missions';
import { cancelAllNotifications, scheduleInactivityNotification } from '../src/utils/notifications';

const BEDTIME_HOURS = [19, 20, 21, 22, 23];

export default function ParentScreen() {
  const {
    sessionDurationMinutes, setSessionDuration,
    notificationsEnabled, toggleNotifications,
    lock,
    dinoName, setDinoName,
    bedtimeHour, setBedtimeHour,
  } = useParentStore();

  const {
    totalXP, streak, gamesWon,
    weeklyXP, weeklyMissions, weeklyGames,
  } = useGameStore();

  const { completedToday, addCustomMission } = useMissionStore();

  const [nameInput, setNameInput] = useState(dinoName);

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

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      setDinoName(trimmed);
      Alert.alert('Nom sauvegardé !', `Votre dino s'appelle maintenant "${trimmed}".`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Statistiques globales ── */}
        <Text style={styles.section}>📊 Statistiques</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>{totalXP}</Text><Text style={styles.statLabel}>XP total</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{completedToday}</Text><Text style={styles.statLabel}>Missions auj.</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{streak}</Text><Text style={styles.statLabel}>Jours de suite</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{gamesWon}</Text><Text style={styles.statLabel}>Jeux gagnés</Text></View>
        </View>

        {/* ── Rapport hebdomadaire ── */}
        <Text style={styles.section}>📈 Rapport hebdomadaire</Text>
        <View style={styles.weeklyCard}>
          <View style={styles.weeklyRow}>
            <Text style={styles.weeklyIcon}>⭐</Text>
            <View style={styles.weeklyInfo}>
              <Text style={styles.weeklyLabel}>XP gagné cette semaine</Text>
              <Text style={styles.weeklyValue}>{weeklyXP} XP</Text>
            </View>
          </View>
          <View style={styles.weeklyDivider} />
          <View style={styles.weeklyRow}>
            <Text style={styles.weeklyIcon}>🎯</Text>
            <View style={styles.weeklyInfo}>
              <Text style={styles.weeklyLabel}>Missions complétées</Text>
              <Text style={styles.weeklyValue}>{weeklyMissions}</Text>
            </View>
          </View>
          <View style={styles.weeklyDivider} />
          <View style={styles.weeklyRow}>
            <Text style={styles.weeklyIcon}>🎮</Text>
            <View style={styles.weeklyInfo}>
              <Text style={styles.weeklyLabel}>Jeux gagnés</Text>
              <Text style={styles.weeklyValue}>{weeklyGames}</Text>
            </View>
          </View>
        </View>

        {/* ── Nom du dino ── */}
        <Text style={styles.section}>🦕 Nom du dino</Text>
        <View style={styles.nameRow}>
          <TextInput
            style={styles.nameInput}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Nom de votre dino"
            placeholderTextColor="#aaa"
            maxLength={20}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName}>
            <Text style={styles.saveBtnText}>Sauvegarder</Text>
          </TouchableOpacity>
        </View>

        {/* ── Durée de session ── */}
        <Text style={styles.section}>⏱️ Durée de session</Text>
        <View style={styles.durationRow}>
          {([5, 10, 15] as const).map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.durationBtn, sessionDurationMinutes === d && styles.durationBtnActive]}
              onPress={() => setSessionDuration(d)}
            >
              <Text style={[styles.durationText, sessionDurationMinutes === d && styles.durationTextActive]}>
                {d} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Heure du coucher ── */}
        <Text style={styles.section}>🌙 Heure du coucher</Text>
        <Text style={styles.bedtimeDesc}>
          L'application sera verrouillée à partir de l'heure choisie.
        </Text>
        <View style={styles.bedtimeRow}>
          <TouchableOpacity
            style={[styles.bedtimeBtn, bedtimeHour === null && styles.bedtimeBtnActive]}
            onPress={() => setBedtimeHour(null)}
          >
            <Text style={[styles.bedtimeText, bedtimeHour === null && styles.bedtimeTextActive]}>
              Désactivé
            </Text>
          </TouchableOpacity>
          {BEDTIME_HOURS.map(h => (
            <TouchableOpacity
              key={h}
              style={[styles.bedtimeBtn, bedtimeHour === h && styles.bedtimeBtnActive]}
              onPress={() => setBedtimeHour(h)}
            >
              <Text style={[styles.bedtimeText, bedtimeHour === h && styles.bedtimeTextActive]}>
                {h}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Notifications ── */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>🔔 Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ true: '#2d8a55' }}
          />
        </View>

        {/* ── Ajouter une mission ── */}
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

  weeklyCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  weeklyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  weeklyIcon: { fontSize: 28, marginRight: 14 },
  weeklyInfo: { flex: 1 },
  weeklyLabel: { fontSize: 13, color: '#555', marginBottom: 2 },
  weeklyValue: { fontSize: 20, fontWeight: '800', color: '#166534' },
  weeklyDivider: { height: 1, backgroundColor: '#bbf7d0' },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveBtn: {
    backgroundColor: '#2d8a55',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  durationRow: { flexDirection: 'row', gap: 12 },
  durationBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, alignItems: 'center' },
  durationBtnActive: { backgroundColor: '#2d8a55' },
  durationText: { fontWeight: 'bold', color: '#555' },
  durationTextActive: { color: '#fff' },

  bedtimeDesc: { fontSize: 13, color: '#888', marginBottom: 10 },
  bedtimeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  bedtimeBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  bedtimeBtnActive: { backgroundColor: '#1a1a2e' },
  bedtimeText: { fontWeight: 'bold', color: '#555', fontSize: 13 },
  bedtimeTextActive: { color: '#fff' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginTop: 16,
  },
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
