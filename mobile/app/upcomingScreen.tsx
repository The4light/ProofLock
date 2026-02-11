import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useRouter } from 'expo-router';
import api from '../services/api'; // Import your api service
import { useFocusEffect } from '@react-navigation/native';

export default function UpcomingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<{ today: any[]; tomorrow: any[]; later: any[] }>({
    today: [],
    tomorrow: [],
    later: [],
  });

  const fetchUpcomingAlarms = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/alarms?status=upcoming');
      
      if (response.data.success) {
        const alarms = response.data.data;
        const now = new Date();
        const tomorrowDate = new Date();
        tomorrowDate.setDate(now.getDate() + 1);

        const categorized = alarms.reduce(
          (acc: any, alarm: any) => {
            const alarmDate = new Date(alarm.startDate);
            
            // Logic to group by date
            if (alarmDate.toDateString() === now.toDateString()) {
              acc.today.push(alarm);
            } else if (alarmDate.toDateString() === tomorrowDate.toDateString()) {
              acc.tomorrow.push(alarm);
            } else if (alarmDate > now) {
              acc.later.push(alarm);
            }
            return acc;
          },
          { today: [], tomorrow: [], later: [] }
        );

        // Sort each group by time
        const sorter = (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        setGroups({
          today: categorized.today.sort(sorter),
          tomorrow: categorized.tomorrow.sort(sorter),
          later: categorized.later.sort(sorter),
        });
      }
    } catch (error) {
      console.error("Failed to fetch upcoming alarms:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUpcomingAlarms();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* NAVIGATION HEADER */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>UPCOMING</Text>
        <TouchableOpacity onPress={fetchUpcomingAlarms}>
          <Ionicons name="refresh-outline" size={22} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {groups.today.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>TODAY</Text>
              {groups.today.map((item) => (
                <UpcomingCard key={item._id} alarm={item} isUrgent={true} />
              ))}
            </>
          )}

          {groups.tomorrow.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>TOMORROW</Text>
              {groups.tomorrow.map((item) => (
                <UpcomingCard key={item._id} alarm={item} />
              ))}
            </>
          )}

          {groups.later.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>LATER THIS WEEK</Text>
              {groups.later.map((item) => (
                <UpcomingCard key={item._id} alarm={item} />
              ))}
            </>
          )}

          {groups.today.length === 0 && groups.tomorrow.length === 0 && groups.later.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No upcoming commitments.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const UpcomingCard = ({ alarm, isUrgent }: any) => (
  <TouchableOpacity style={styles.card}>
    <View style={[styles.accentBar, isUrgent && { backgroundColor: COLORS.primary }]} />
    <View style={styles.cardInfo}>
      <Text style={styles.cardTime}>{alarm.startTime}</Text>
      <Text style={styles.cardTitle}>{alarm.goal}</Text>
      <View style={styles.cardFooter}>
        <Ionicons 
          name={alarm.proofMethod === 'photo' ? "camera-outline" : "mic-outline"} 
          size={12} 
          color="rgba(255,255,255,0.3)" 
        />
        <Text style={styles.cardLabel}>
          {(alarm.proofMethod || 'PHOTO').toUpperCase()} PROOF • ${alarm.penalty || 10} STAKE
        </Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.1)" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  navHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, marginBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  navTitle: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginTop: 30, marginBottom: 15 },
  card: { backgroundColor: '#161616', borderRadius: 22, flexDirection: 'row', alignItems: 'center', paddingRight: 20, marginBottom: 12, overflow: 'hidden' },
  accentBar: { width: 4, height: '100%', backgroundColor: '#222' },
  cardInfo: { flex: 1, padding: 20 },
  cardTime: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  cardTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 4 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  cardLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' },
  emptyState: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 }
});