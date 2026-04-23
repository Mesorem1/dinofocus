import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Switch, TextInput, Alert,
} from 'react-native';
import { useParentStore } from '../../src/store/parentStore';
import { useGameStore } from '../../src/store/gameStore';
import { useMissionStore } from '../../src/store/missionStore';
import { useWeeklyStore } from '../../src/store/weeklyStore';
import { cancelAllNotifications, scheduleInactivityNotification } from '../../src/utils/notifications';
import { clearData } from '../../src/utils/storage';

// ── Section header ─────────────────────────────────────────────────────────
function Section({ title }: { title: string }) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}

// ── Row avec switch ─────────────────────────────────────────────────────────
function SwitchRow({ emoji, label, sub, value, onValueChange }: {
  emoji: string; label: string; sub?: string;
  value: boolean; onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={s.row}>
      <Text style={s.rowEmoji}>{emoji}</Text>
      <View style={s.rowInfo}>
        <Text style={s.rowLabel}>{label}</Text>
        {sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#374151', true: '#2d8a55' }}
        thumbColor={value ? '#fff' : '#9ca3af'}
      />
    </View>
  );
}

// ── Row simple (bouton) ─────────────────────────────────────────────────────
function BtnRow({ emoji, label, sub, onPress, danger }: {
  emoji: string; label: string; sub?: string;
  onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={s.rowEmoji}>{emoji}</Text>
      <View style={s.rowInfo}>
        <Text style={[s.rowLabel, danger && { color: '#ef4444' }]}>{label}</Text>
        {sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ── Sélecteur boutons ───────────────────────────────────────────────────────
function OptionRow({ emoji, label, options, value, onChange }: {
  emoji: string; label: string;
  options: { label: string; value: number | null }[];
  value: number | null; onChange: (v: number | null) => void;
}) {
  return (
    <View style={s.optRow}>
      <View style={s.optHeader}>
        <Text style={s.rowEmoji}>{emoji}</Text>
        <Text style={s.rowLabel}>{label}</Text>
      </View>
      <View style={s.optBtns}>
        {options.map(opt => (
          <TouchableOpacity
            key={String(opt.value)}
            style={[s.optBtn, opt.value === value && s.optBtnActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[s.optBtnText, opt.value === value && s.optBtnTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Screen ──────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const {
    musicEnabled, toggleMusic,
    notificationsEnabled, toggleNotifications,
    soundEnabled, toggleSound,
    dinoName, setDinoName,
    sessionDurationMinutes, setSessionDuration,
    bedtimeHour, setBedtimeHour,
  } = useParentStore();

  const [nameInput, setNameInput] = useState(dinoName ?? 'Rex');
  const [nameSaved, setNameSaved] = useState(false);

  const handleToggleNotifications = async () => {
    toggleNotifications();
    if (notificationsEnabled) await cancelAllNotifications();
    else await scheduleInactivityNotification();
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setDinoName(trimmed);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleReset = () => {
    Alert.alert(
      '⚠️ Réinitialiser',
      'Toute la progression (XP, missions, jeux) sera effacée. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser', style: 'destructive',
          onPress: async () => {
            await clearData('dinofocus:game');
            await clearData('dinofocus:missions');
            await clearData('dinofocus:weekly');
            Alert.alert('✅ Réinitialisé', 'Redémarrez l\'application pour appliquer.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <Text style={s.title}>⚙️ Paramètres</Text>

        {/* ── Son & Musique ── */}
        <Section title="🔊 Son & Musique" />
        <View style={s.card}>
          <SwitchRow
            emoji="🔊" label="Sons" sub="Effets sonores des actions"
            value={soundEnabled ?? true}
            onValueChange={toggleSound}
          />
          <View style={s.divider} />
          <SwitchRow
            emoji="🎵" label="Musique de fond" sub="Mélodie douce sur l'accueil"
            value={musicEnabled ?? true}
            onValueChange={toggleMusic}
          />
        </View>

        {/* ── Notifications ── */}
        <Section title="🔔 Notifications" />
        <View style={s.card}>
          <SwitchRow
            emoji="🔔" label="Rappels" sub="Rappel quand Rex t'attend"
            value={notificationsEnabled ?? true}
            onValueChange={handleToggleNotifications}
          />
        </View>

        {/* ── Dino ── */}
        <Section title="🦕 Mon Dino" />
        <View style={s.card}>
          <View style={s.nameRow}>
            <Text style={s.rowEmoji}>✏️</Text>
            <View style={s.nameInput}>
              <Text style={s.rowLabel}>Nom du dino</Text>
              <TextInput
                style={s.input}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Rex"
                placeholderTextColor="#6b7280"
                maxLength={12}
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
            </View>
            <TouchableOpacity style={[s.saveBtn, nameSaved && s.saveBtnDone]} onPress={handleSaveName}>
              <Text style={s.saveBtnText}>{nameSaved ? '✓' : 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Session ── */}
        <Section title="⏱️ Durée de session" />
        <View style={s.card}>
          <OptionRow
            emoji="⏱️" label="Limite de jeu"
            options={[
              { label: '5 min', value: 5 },
              { label: '10 min', value: 10 },
              { label: '15 min', value: 15 },
              { label: 'Illimité', value: null },
            ]}
            value={sessionDurationMinutes}
            onChange={(v) => setSessionDuration((v ?? 10) as 5 | 10 | 15)}
          />
        </View>

        {/* ── Verrouillage nocturne ── */}
        <Section title="🌙 Heure du coucher" />
        <View style={s.card}>
          <OptionRow
            emoji="🌙" label="Bloquer l'app après"
            options={[
              { label: '19h', value: 19 },
              { label: '20h', value: 20 },
              { label: '21h', value: 21 },
              { label: '22h', value: 22 },
              { label: 'Non', value: null },
            ]}
            value={bedtimeHour}
            onChange={setBedtimeHour}
          />
        </View>

        {/* ── À propos ── */}
        <Section title="ℹ️ À propos" />
        <View style={s.card}>
          <View style={s.aboutRow}>
            <Text style={s.aboutEmoji}>🦕</Text>
            <View>
              <Text style={s.aboutTitle}>DinoFocus</Text>
              <Text style={s.aboutSub}>Version 1.0.0</Text>
              <Text style={s.aboutSub}>Fait avec ❤️ pour les enfants</Text>
            </View>
          </View>
        </View>

        {/* ── Danger zone ── */}
        <Section title="⚠️ Zone dangereuse" />
        <View style={s.card}>
          <BtnRow
            emoji="🗑️"
            label="Réinitialiser la progression"
            sub="Efface tout l'XP, les missions et les jeux"
            onPress={handleReset}
            danger
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  scroll: { padding: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#1a1a2e', marginBottom: 20 },

  sectionTitle: {
    fontSize: 12, fontWeight: '800', color: '#64748b',
    letterSpacing: 1, textTransform: 'uppercase',
    marginBottom: 8, marginTop: 20, marginLeft: 4,
  },

  card: {
    backgroundColor: '#fff', borderRadius: 18,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
    overflow: 'hidden',
  },

  divider: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 52 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowEmoji: { fontSize: 22, width: 36 },
  rowInfo: { flex: 1, marginRight: 8 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  rowSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  chevron: { fontSize: 22, color: '#cbd5e1' },

  optRow: { paddingHorizontal: 16, paddingVertical: 14 },
  optHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  optBtns: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optBtn: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, backgroundColor: '#f1f5f9',
    borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  optBtnActive: { backgroundColor: '#0d3b2e', borderColor: '#0d3b2e' },
  optBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  optBtnTextActive: { color: '#fff' },

  nameRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  nameInput: { flex: 1, marginRight: 12 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 15, color: '#1a1a2e', marginTop: 6,
    backgroundColor: '#f8faff',
  },
  saveBtn: {
    backgroundColor: '#0d3b2e', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  saveBtnDone: { backgroundColor: '#22c55e' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  aboutRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  aboutEmoji: { fontSize: 44 },
  aboutTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a2e' },
  aboutSub: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
});
