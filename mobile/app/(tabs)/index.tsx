import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import moment from 'moment'; // Recommended for easier time comparison
import { Alarm } from '@/types/alarm';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [alarms, setAlarms] = useState<Alarm[]>([]); // 2. Set the type
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlarms = async () => {
    try {
     const response = await api.get('/alarms');
      if (response.data.success) {
        setAlarms(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch alarms", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);
  
useEffect(() => {
  const checkAlarms = () => {
  // Get current hour and minute as numbers (e.g., 15 and 41)
  const nowHour = moment().hour();
  const nowMinute = moment().minute();

  console.log(`--- CHECKING ${nowHour}:${nowMinute} ---`);

  alarms.forEach(a => {
    // Convert the alarm string (like "3:41 PM") into a moment object
    // 'LT' or 'h:mm A' handles those weird hidden spaces much better
    const alarmTime = moment(a.startTime, ['h:mm A', 'hh:mm A', 'LT']);
    const alarmHour = alarmTime.hour();
    const alarmMinute = alarmTime.minute();

    const isTimeMatch = (nowHour === alarmHour && nowMinute === alarmMinute);
    const isStatusMatch = a.status === 'upcoming';

    console.log(`Comparing Clock [${nowHour}:${nowMinute}] to Alarm [${alarmHour}:${alarmMinute}] | Match: ${isTimeMatch}`);

    if (isTimeMatch && isStatusMatch) {
      console.log("🎯 TARGET LOCKED! Triggering navigation...");
      router.push({
        pathname: '/active-alarm' as any,
        params: { id: a._id, goal: a.goal }
      });
    }
  });
};

    // Check every 10 seconds
    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [alarms, router]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlarms();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profilePic}>
            <Text style={{fontSize: 20}}>👤</Text>
          </View>
          <View style={{flex: 1, marginLeft: 12}}>
            <Text style={styles.greeting}>Good morning, {user?.username || 'User'}.</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings' as any)}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}><Ionicons name="flame" color={COLORS.primary}/> STREAK</Text>
            <Text style={styles.statValue}>{user?.streak || 0} Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}><Ionicons name="checkmark-circle" color={COLORS.primary}/> SCORE</Text>
            <Text style={styles.statValue}>{user?.behaviorScore || 100}</Text>
          </View>
        </View>

        {/* Alarms Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Todays Alarms</Text>
          <Text style={styles.remainingText}>{alarms.length} TOTAL</Text>
        </View>

        {/* Dynamic Alarm List */}
        {alarms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{color: '#444'}}>No commitments set for today.</Text>
          </View>
        ) : (
          alarms.map((alarm: any) => (
            <TouchableOpacity key={alarm._id} style={styles.alarmCard}>
              <View style={styles.alarmIndicator} />
              <View style={styles.alarmContent}>
                <View style={styles.alarmTop}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{alarm.status.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.timeUntil}>
                    {alarm.proofMethod === 'photo' ? 'Photo Required' : 'AI Chat Required'}
                  </Text>
                </View>
                <Text style={styles.alarmTime}>{alarm.startTime}</Text>
                <Text style={styles.alarmTitle}>{alarm.goal}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/modal' as any)}>
        <Ionicons name="add" size={30} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  profilePic: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  date: { color: '#666', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statCard: { flex: 1, backgroundColor: '#0A0A0A', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#111' },
  statLabel: { color: '#888', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'flex-end' },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  remainingText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  alarmCard: { backgroundColor: '#FFF', borderRadius: 20, flexDirection: 'row', padding: 15, alignItems: 'center', marginBottom: 12 },
  alarmIndicator: { width: 4, height: '80%', backgroundColor: COLORS.primary, borderRadius: 2 },
  alarmContent: { flex: 1, paddingLeft: 15 },
  alarmTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  tag: { backgroundColor: '#E0FFE0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { color: '#00A000', fontSize: 10, fontWeight: 'bold' },
  timeUntil: { color: '#888', fontSize: 12 },
  alarmTime: { fontSize: 28, fontWeight: '900', color: '#000' },
  alarmTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  emptyState: { padding: 40, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#222', borderRadius: 20 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});