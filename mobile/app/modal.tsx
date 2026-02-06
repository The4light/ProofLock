import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import api from '../services/api';

export default function NewCommitmentModal() {
  const router = useRouter();
  
  // Form State
  const [goal, setGoal] = useState('');
  const [proofMethod, setProofMethod] = useState<'photo' | 'ai_chat'>('photo');
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');
  const [loading, setLoading] = useState(false);

  // Time state (simplifying for the UI demo, usually you'd use a Picker)
  const [time, setTime] = useState('06:30');
  const [ampm, setAmpm] = useState('AM');

  const handleCreateCommitment = async () => {
    if (!goal) return Alert.alert("Hold up", "What is the goal for this commitment?");
    
    setLoading(true);
    try {
      const date = new Date();
      if (selectedDate === 'tomorrow') date.setDate(date.getDate() + 1);

      const response = await api.post('/alarms', {
        goal,
        startTime: `${time} ${ampm}`,
        startDate: date,
        proofMethod,
        status: 'upcoming'
      });

      if (response.data.success) {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Could not save commitment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.stepText}>STEP 1 OF 3</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>New Commitment</Text>
        <Text style={styles.subtitle}>Set a task that requires proof to be dismissed.</Text>

        {/* GOAL SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>What’s the goal?</Text>
          </View>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Morning Gym Session"
            placeholderTextColor="#444"
            value={goal}
            onChangeText={setGoal}
          />
        </View>

        {/* TIME SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>When does it start?</Text>
          </View>
          
          <View style={styles.dateRow}>
            <TouchableOpacity 
              style={[styles.dateBtn, selectedDate === 'today' && styles.dateBtnActive]}
              onPress={() => setSelectedDate('today')}
            >
              <Text style={[styles.dateBtnText, selectedDate === 'today' && styles.textBlack]}>TODAY</Text>
              <Text style={[styles.dateSubtext, selectedDate === 'today' && styles.textBlack]}>Oct 24</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dateBtn, selectedDate === 'tomorrow' && styles.dateBtnActive]}
              onPress={() => setSelectedDate('tomorrow')}
            >
              <Text style={styles.dateBtnText}>TOMORROW</Text>
              <Text style={styles.dateSubtext}>Oct 25</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>{time}</Text>
            <View style={styles.ampmBadge}>
              <Text style={styles.ampmText}>{ampm}</Text>
            </View>
          </View>
        </View>

        {/* PROOF METHOD SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Method of Proof</Text>
          </View>

          <TouchableOpacity 
            style={[styles.methodItem, proofMethod === 'photo' && styles.methodActive]}
            onPress={() => setProofMethod('photo')}
          >
            <Ionicons name="camera" size={24} color={proofMethod === 'photo' ? COLORS.primary : '#444'} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.methodTitle}>Take a Photo</Text>
              <Text style={styles.methodDesc}>Capture your environment to stop alarm.</Text>
            </View>
            {proofMethod === 'photo' && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          🔒 Once the commitment begins, the alarm will only cease when the selected proof method is successfully submitted.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.createBtn} 
          onPress={handleCreateCommitment}
          disabled={loading}
        >
          <Text style={styles.createBtnText}>{loading ? 'Saving...' : 'Create Commitment'}</Text>
          <Ionicons name="arrow-forward" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  stepText: { color: '#444', fontSize: 12, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: 16, marginTop: 8, marginBottom: 25 },
  card: { backgroundColor: '#0A0A0A', borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#111' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  input: { backgroundColor: '#000', borderRadius: 15, padding: 18, color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: '#222' },
  dateRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  dateBtn: { flex: 1, padding: 15, borderRadius: 15, backgroundColor: '#111', alignItems: 'center' },
  dateBtnActive: { backgroundColor: COLORS.primary },
  dateBtnText: { color: '#666', fontWeight: 'bold', fontSize: 12 },
  dateSubtext: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  textBlack: { color: '#000' },
  timeDisplay: { backgroundColor: '#111', padding: 20, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333' },
  timeText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  ampmBadge: { backgroundColor: '#222', padding: 8, borderRadius: 8 },
  ampmText: { color: '#FFF', fontWeight: 'bold' },
  methodItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, backgroundColor: '#000', borderWidth: 1, borderColor: '#222' },
  methodActive: { borderColor: COLORS.primary, backgroundColor: '#0A1A0A' },
  methodTitle: { color: '#FFF', fontWeight: 'bold' },
  methodDesc: { color: '#444', fontSize: 12 },
  footerNote: { color: '#333', fontSize: 12, textAlign: 'center', marginTop: 10 },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#000' },
  createBtn: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  createBtnText: { fontSize: 18, fontWeight: 'bold' }
});