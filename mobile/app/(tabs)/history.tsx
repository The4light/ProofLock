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
        .map(a => new Date(a.startDate).toDateString())
    );

    let currentStreak = 0;
    let checkDate = new Date();

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
      setLoading(true);
      const response = await api.get<any>('/alarms?status=completed,failed,missed');
      const data = response.data.data;

      // Grouping into sections (Today, Yesterday, etc.)
      const groups = data.reduce((acc: any, alarm: any) => {
        const date = new Date(alarm.startDate);
        if (isNaN(date.getTime())) return acc;

        let title = format(date, 'MMM dd, yyyy').toUpperCase();
        if (isToday(date)) title = 'TODAY';
        else if (isYesterday(date)) title = 'YESTERDAY';

        if (!acc[title]) acc[title] = [];
        acc[title].push(alarm);
        return acc;
      }, {});

      setSections(Object.keys(groups).map(title => ({ title, data: groups[title] })));
      
      const completedTasks = data.filter((a: any) => a.status === 'completed');
      const totalAttempted = data.length;
      const rate = totalAttempted > 0 ? Math.round((completedTasks.length / totalAttempted) * 100) : 0;
      
      setStats({ 
        streak: calculateStreak(data), 
        rate: rate,
        total: completedTasks.length 
      });

    } catch (err) {
      console.error("History fetch error:", err);
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

        <View style={styles.rateHighlight}>
          <Ionicons name="trending-up" size={16} color={COLORS.primary} />
          <Text style={styles.rateText}>Overall Success Rate: <Text style={{color: COLORS.primary}}>{stats.rate}%</Text></Text>
        </View>

        {sections.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>No records yet. Start your first goal!</Text>
          </View>
        )}

        {/* FIXED: Loop through sections first, then loop through the data inside each section */}
        {sections.map((section) => (
          <View key={section.title} style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            
            {section.data.map((item: any) => {
              const isSuccessfullyCompleted = item.status === 'completed';
              const isFailure = item.status === 'missed' || item.status === 'failed';

              return (
                <View key={item._id} style={[styles.card, isFailure && styles.missedCard]}>
                  <View style={[
                    styles.iconCircle, 
                    { backgroundColor: isSuccessfullyCompleted ? 'rgba(0, 255, 128, 0.1)' : 'rgba(255, 60, 60, 0.1)' }
                  ]}>
                    <Ionicons 
                      name={isSuccessfullyCompleted ? "checkmark-sharp" : "close-outline"} 
                      size={20} 
                      color={isSuccessfullyCompleted ? COLORS.primary : '#FF3C3C'} 
                    />
                  </View>
                  
                  <View style={styles.cardInfo}>
                    <Text style={styles.goalText} numberOfLines={1}>{item.goal || "Untitled Goal"}</Text>
                    <Text style={styles.methodText}>
                      {isSuccessfullyCompleted 
                        ? "Verified • Photo Proof" 
                        : `Missed • $${item.penalty || 10} Penalty`}
                    </Text>
                  </View>
                  
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{item.startTime || "00:00"}</Text>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: isSuccessfullyCompleted ? COLORS.primary : '#FF3C3C' }
                    ]} />
                  </View>
                </View>
              );
            })}
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
  sectionHeader: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 15 },
  card: { backgroundColor: '#121612', flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#1f241f' },
  missedCard: { borderColor: 'rgba(255, 60, 60, 0.2)', opacity: 0.8 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  goalText: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  methodText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  timeContainer: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 70 },
  timeText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { color: 'gray', textAlign: 'center', marginTop: 12 }
});