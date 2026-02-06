import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme'; // Adjust dots if needed!

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profilePic}>
            <Text style={{fontSize: 20}}>👤</Text>
          </View>
          <View style={{flex: 1, marginLeft: 12}}>
            <Text style={styles.greeting}>Good morning, Alex.</Text>
            <Text style={styles.date}>Monday, October 23</Text>
          </View>
          <Ionicons name="settings-outline" size={24} color="white" />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}><Ionicons name="flame" color="#39FF14"/> STREAK</Text>
            <Text style={styles.statValue}>5 Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}><Ionicons name="checkmark-circle" color="#39FF14"/> SUCCESS</Text>
            <Text style={styles.statValue}>98%</Text>
          </View>
        </View>

        {/* Alarms Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Todays Alarms</Text>
          <Text style={styles.remainingText}>2 REMAINING</Text>
        </View>

        {/* Active Alarm Card */}
        <View style={styles.alarmCard}>
          <View style={styles.alarmIndicator} />
          <View style={styles.alarmContent}>
            <View style={styles.alarmTop}>
              <View style={styles.tag}><Text style={styles.tagText}>UPCOMING</Text></View>
              <Text style={styles.timeUntil}>Starts in 42m</Text>
            </View>
            <Text style={styles.alarmTime}>6:00 AM</Text>
            <Text style={styles.alarmTitle}>Morning Workout</Text>
            <View style={styles.proofRow}>
               <Ionicons name="camera-outline" size={16} color="#888" />
               <Text style={styles.proofText}> Proof: Photo of Gym</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>Details</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={30} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  profilePic: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  date: { color: '#666', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statCard: { flex: 1, backgroundColor: '#121212', padding: 20, borderRadius: 16 },
  statLabel: { color: '#888', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'flex-end' },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  remainingText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  alarmCard: { backgroundColor: '#FFF', borderRadius: 20, flexDirection: 'row', padding: 15, alignItems: 'center' },
  alarmIndicator: { width: 4, height: '80%', backgroundColor: COLORS.primary, borderRadius: 2 },
  alarmContent: { flex: 1, paddingLeft: 15 },
  alarmTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  tag: { backgroundColor: '#E0FFE0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { color: '#00A000', fontSize: 10, fontWeight: 'bold' },
  timeUntil: { color: '#888', fontSize: 12 },
  alarmTime: { fontSize: 28, fontWeight: '900', color: '#000' },
  alarmTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  proofRow: { flexDirection: 'row', alignItems: 'center' },
  proofText: { color: '#888', fontSize: 14 },
  detailsBtn: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  detailsBtnText: { fontWeight: 'bold', fontSize: 14 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});