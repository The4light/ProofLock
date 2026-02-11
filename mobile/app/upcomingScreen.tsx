import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme'; // Using YOUR theme colors
import { useRouter } from 'expo-router';

export default function UpcomingScreen({ navigation }: any) {
    const router = useRouter();
  return (
    <View style={styles.container}>
      {/* NAVIGATION HEADER */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()}style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>UPCOMING</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={22} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* GROUP: TODAY */}
        <Text style={styles.sectionTitle}>TODAY</Text>
        <UpcomingCard time="09:30 AM" title="Deep Work Session" isUrgent={true} />
        <UpcomingCard time="12:00 PM" title="Protein Intake" />
        
        {/* GROUP: TOMORROW */}
        <Text style={styles.sectionTitle}>TOMORROW</Text>
        <UpcomingCard time="06:00 AM" title="Morning Workout" />
        <UpcomingCard time="08:00 AM" title="Daily Standup" />
      </ScrollView>
    </View>
  );
}

const UpcomingCard = ({ time, title, isUrgent }: any) => (
  <TouchableOpacity style={styles.card}>
    <View style={[styles.accentBar, isUrgent && { backgroundColor: COLORS.primary }]} />
    <View style={styles.cardInfo}>
      <Text style={styles.cardTime}>{time}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardFooter}>
         <Ionicons name="camera-outline" size={12} color="rgba(255,255,255,0.3)" />
         <Text style={styles.cardLabel}>PHOTO PROOF</Text>
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
  cardLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }
});