import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday, subDays } from 'date-fns';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';

export default function HistoryScreen() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ streak: 0, rate: 0, total: 0 });

  const calculateStreak = (data: any[]) => {
    const completedDates = new Set(
      data
        .filter(a => a.status === 'completed')
        .map(a => new Date(a.verifiedAt || a.updatedAt).toDateString())
    );

    let currentStreak = 0;
    let checkDate = new Date();

    // If they haven't done anything today, check starting from yesterday
    if (!completedDates.has(checkDate.toDateString())) {
      checkDate = subDays(checkDate, 1);
    }

    while (completedDates.has(checkDate.toDateString())) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
    return currentStreak;
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get<any>('/alarms?status=completed,missed');
      const data = response.data.data;

      // Grouping Logic
      const groups = data.reduce((acc: any, alarm: any) => {
        const dateSource = alarm.verifiedAt || alarm.updatedAt || new Date();
        const date = new Date(dateSource);
        if (isNaN(date.getTime())) return acc;

        let title = format(date, 'MMM dd, yyyy').toUpperCase();
        if (isToday(date)) title = 'TODAY';
        else if (isYesterday(date)) title = 'YESTERDAY';

        if (!acc[title]) acc[title] = [];
        acc[title].push(alarm);
        return acc;
      }, {});

      setSections(Object.keys(groups).map(title => ({ title, data: groups[title] })));
      
      // Real Stats Calculation
      const completed = data.filter((a: any) => a.status === 'completed');
      const rate = data.length > 0 ? Math.round((completed.length / data.length) * 100) : 0;
      
      setStats({ 
        streak: calculateStreak(data), 
        rate: rate,
        total: completed.length 
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity><Ionicons name="chevron-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerText}>Activity History</Text>
        <TouchableOpacity><Ionicons name="options-outline" size={24} color="white" /></TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchHistory} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Real Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CURRENT STREAK</Text>
            <Text style={styles.statValue}>{stats.streak} <Text style={styles.unit}>Days</Text></Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL COMPLETED</Text>
            <Text style={styles.statValue}>{stats.total} <Text style={styles.unit}>Tasks</Text></Text>
          </View>
        </View>

        {/* Success Rate Sub-header */}
        <View style={styles.rateHighlight}>
          <Ionicons name="trending-up" size={16} color={COLORS.primary} />
          <Text style={styles.rateText}>Overall Success Rate: <Text style={{color: COLORS.primary}}>{stats.rate}%</Text></Text>
        </View>

        {sections.length === 0 && !loading && (
          <Text style={styles.emptyText}>No records yet. Start your first goal!</Text>
        )}

        {sections.map((section) => (
          <View key={section.title} style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            {section.data.map((item: any) => (
              <View key={item._id} style={[styles.card, item.status === 'missed' && styles.missedCard]}>
                <View style={[styles.iconCircle, { 
                  backgroundColor: item.status === 'completed' ? 'rgba(0, 255, 128, 0.1)' : 'rgba(255, 255, 255, 0.05)' 
                }]}>
                  <Ionicons 
                    name={item.status === 'missed' ? "close" : "checkmark-sharp"} 
                    size={20} 
                    color={item.status === 'completed' ? COLORS.primary : 'rgba(255,255,255,0.3)'} 
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.goalText}>{item.goal || "Untitled Goal"}</Text>
                  <Text style={styles.methodText}>
                    {item.status === 'completed' ? `Verified Proof` : `Missed Goal`}
                  </Text>
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <View style={[styles.statusDot, { backgroundColor: item.status === 'completed' ? COLORS.primary : '#333' }]} />
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050805', paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statCard: { backgroundColor: '#121612', width: '48%', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#1f241f' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  unit: { color: COLORS.primary, fontSize: 12 },
  rateHighlight: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121612', padding: 12, borderRadius: 12, marginBottom: 25, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#1f241f' },
  rateText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 8, fontWeight: '600' },
  sectionContainer: { marginBottom: 25 },
  sectionHeader: { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 15 },
  card: { backgroundColor: '#121612', flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#1f241f' },
  missedCard: { opacity: 0.6 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardInfo: { flex: 1 },
  goalText: { color: 'white', fontSize: 17, fontWeight: '600', marginBottom: 4 },
  methodText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  timeContainer: { alignItems: 'flex-end', justifyContent: 'center' },
  timeText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  emptyText: { color: 'gray', textAlign: 'center', marginTop: 50 }
});