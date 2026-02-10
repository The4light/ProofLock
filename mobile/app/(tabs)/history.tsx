import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      // Fetching only 'completed' or 'missed' alarms
      const response = await api.get<any>('/alarms?status=completed,missed');
      setHistory(response.data.data);
    } catch (err) {
      console.error("History fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchHistory} tintColor={COLORS.primary} />}
    >
      <Text style={styles.header}>Activity History</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>COMPLETED</Text>
          <Text style={styles.statValue}>{history.filter(a => a.status === 'completed').length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>SUCCESS RATE</Text>
          <Text style={styles.statValue}>
            {history.length > 0 ? Math.round((history.filter(a => a.status === 'completed').length / history.length) * 100) : 0}%
          </Text>
        </View>
      </View>

      {history.map((item) => (
        <View key={item._id} style={styles.historyItem}>
        <View style={[styles.iconBox, { backgroundColor: item.status === 'completed' ? 'rgba(30, 215, 96, 0.1)' : 'rgba(255, 69, 58, 0.1)' }]}>
        <Ionicons 
            // If it's photo proof, show a camera. If it's a math challenge, show a calculator/grid.
            name={
            item.status === 'missed' ? "close-outline" : 
            item.method?.includes('Photo') ? "camera-outline" : "checkmark-outline"
            } 
            size={22} 
            color={item.status === 'completed' ? COLORS.primary : '#FF453A'} 
        />
        </View>
          <View style={styles.itemInfo}>            
             <Text style={styles.itemTitle}>{item.goal || item.title || "No Title"}</Text>
            <Text style={styles.itemSub}>{item.status === 'completed' ? 'Verified' : 'Missed'}</Text>
          </View>
          <Text style={styles.itemTime}>{item.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
// ... (Styles remain the same as previous)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b120b', padding: 20 },
  header: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { backgroundColor: '#1a1d1a', width: '48%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#333' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 1, marginBottom: 10 },
  statValue: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  unit: { color: COLORS.primary, fontSize: 14 },
  sectionTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginVertical: 15 },
  historyItem: { backgroundColor: '#1a1d1a', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 10 },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemInfo: { flex: 1 },
  itemTitle: { color: 'white', fontSize: 16, fontWeight: '600' },
  itemSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  itemTime: { color: 'rgba(255,255,255,0.6)', fontSize: 14 }
});