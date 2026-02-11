import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [nextAlarm, setNextAlarm] = useState<any>(null);
  const [stats, setStats] = useState({ remaining: 0, completed: 0, missed: 0 });
  const [previewAlarms, setPreviewAlarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  // 1. Unified Fetching
  const fetchData = async () => {
    try {
      const [alarmRes, userRes] = await Promise.all<any>([
        api.get('/alarms'),
        api.get('/auth/me')
      ]);

      if (userRes.data.success) setUser(userRes.data.data);

      if (alarmRes.data.success) {
        const now = new Date();
        const alarms = alarmRes.data.data;

        console.log('📊 Raw alarms from backend:', alarms);

        // CRITICAL FIX: Use startDate instead of time
        const futureAlarms = alarms
          .filter((a: any) => {
            const alarmTime = new Date(a.startDate);
            const isFuture = alarmTime > now;
            console.log(`⏰ Alarm "${a.goal}" - Time: ${alarmTime.toLocaleString()}, Future: ${isFuture}`);
            return isFuture;
          })
          .sort((a: any, b: any) => {
            const timeA = new Date(a.startDate).getTime();
            const timeB = new Date(b.startDate).getTime();
            return timeA - timeB;
          });

        console.log('✅ Future alarms:', futureAlarms.length);

        setNextAlarm(futureAlarms[0] || null);
        setPreviewAlarms(futureAlarms.slice(1, 3));

        setStats({
          remaining: futureAlarms.length,
          completed: alarms.filter((a: any) => a.status === 'completed').length,
          missed: alarms.filter((a: any) => {
            const alarmTime = new Date(a.startDate);
            return alarmTime < now && a.status === 'upcoming';
          }).length
        });
      }
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Initial Data Load
  useEffect(() => {
    fetchData();
  }, []);

  // 3. REFRESH when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  // 4. The "Master" Alarm Timer (Handles Countdown + Trigger)
  useEffect(() => {
    if (!nextAlarm) {
      setCountdown("");
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      // CRITICAL FIX: Use startDate instead of time
      const alarmTime = new Date(nextAlarm.startDate).getTime();
      const diff = alarmTime - now;

      // console.log(`⏱️ Countdown check - Now: ${new Date(now).toLocaleString()}, Alarm: ${new Date(alarmTime).toLocaleString()}, Diff: ${diff}ms`);

      if (diff <= 0) {
        setCountdown("DUE NOW");
        clearInterval(timer);
        console.log('🚨 ALARM TRIGGERED!');
        
        // TRIGGER MISSION
        router.push({
          pathname: '/active-alarm',
          params: { id: nextAlarm._id, goal: nextAlarm.goal }
        });
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Show seconds if under 1 minute for extra intensity
        if (h === 0 && m === 0) {
          setCountdown(`${s}s`);
        } else {
          setCountdown(`${h > 0 ? h + 'h ' : ''}${m}m`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextAlarm]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, {user?.name || 'User'}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text>
        </View>
        <TouchableOpacity><Ionicons name="ellipsis-vertical" size={24} color="rgba(255,255,255,0.4)" /></TouchableOpacity>
      </View>

      {/* QUICK STATS ROW */}
      <View style={styles.statsRow}>
        <StatBox label="REMAINING" value={stats.remaining.toString().padStart(2, '0')} color="white" />
        <StatBox label="COMPLETED" value={stats.completed.toString().padStart(2, '0')} color={COLORS.primary} />
        <StatBox label="MISSED" value={stats.missed.toString().padStart(2, '0')} color="#FF3B30" />
      </View>

      {/* HERO SECTION - UPCOMING OBJECTIVE */}
      <View style={styles.heroContainer}>
        <Text style={styles.sectionLabel}>UPCOMING OBJECTIVE</Text>
        <View style={styles.heroCard}>
          {/* CRITICAL FIX: Use startDate instead of time */}
          <Text style={styles.heroTime}>
            {nextAlarm ? new Date(nextAlarm.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
          </Text>
          <Text style={styles.heroTitle}>
            {nextAlarm ? nextAlarm.goal : "SYSTEM CLEAR"}
          </Text>
        
          <View style={styles.countdownRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            <Text style={[styles.countdownText, {color: COLORS.primary}]}>STARTS IN {countdown || "..."}</Text>
          </View>

          <View style={styles.proofBtn}>
            <Ionicons 
              name={nextAlarm?.proofMethod === 'photo' ? "camera" : "barcode-outline"} 
              size={18} 
              color="rgba(255,255,255,0.6)" 
            />
            <Text style={styles.proofText}>
              {nextAlarm 
                ? `PROOF: ${nextAlarm.proofMethod?.toUpperCase()} REQUIRED` 
                : "NO PROOF REQUIRED"}
            </Text>
          </View>
        </View>
      </View>

      {/* UPCOMING SECTION */}
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewLabel}>THE HORIZON</Text>
          <TouchableOpacity onPress={() => router.push('/upcomingScreen')}>
            <Text style={styles.viewAllText}>VIEW ALL →</Text>
          </TouchableOpacity>
        </View>

        {previewAlarms.length > 0 ? (
          previewAlarms.map((alarm, index) => (
            <View key={index} style={styles.previewItem}>
              <View style={styles.previewLeft}>
                {/* CRITICAL FIX: Use startDate instead of time */}
                <Text style={styles.previewTime}>
                  {new Date(alarm.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.previewTitle} numberOfLines={1}>{alarm.goal}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
            </View>
          ))
        ) : (
          <View style={styles.noMoreBox}>
            <Text style={styles.noMoreText}>NO OTHER THREATS DETECTED</Text>
          </View>
        )}
      </View>

      {/* DISCIPLINE PANEL */}
      <View style={styles.metricsCard}>
        <View style={styles.metricHeader}>
          <View>
            <Text style={styles.metricSubLabel}>DISCIPLINE SCORE</Text>
            <Text style={styles.metricMainValue}>{user?.disciplineScore || 100}%</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.metricSubLabel}>CURRENT STREAK</Text>
            <Text style={[styles.metricMainValue, { color: COLORS.primary }]}>{user?.streak || 0} Days</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${user?.disciplineScore ?? 0}%` } 
            ]} 
          />
        </View>

        <View style={styles.riskNotice}>
          <Ionicons name="warning" size={14} color="#FF9500" />
          <Text style={styles.riskText}>
            {user?.disciplineScore < 50 
              ? "CRITICAL STATUS. MISSION FAILURE IMMINENT. RECOVER DISCIPLINE IMMEDIATELY." 
              : "HIGH RISK WINDOW DETECTED. MISSING THE NEXT OBJECTIVE WILL RESULT IN A 12% SCORE PENALTY."
            }
          </Text>
        </View>
      </View>

      {/* CREATE NEW ALARM BUTTON */}
      <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/create-alarm')}>
        <Ionicons name="add" size={24} color={COLORS.primary} />
        <Text style={styles.createBtnText}>CREATE NEW ALARM</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Sub-component for small stat boxes
const StatBox = ({ label, value, color }: any) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 60, marginBottom: 30 },
  greeting: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  dateText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5, marginTop: 4 },
  
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  statBox: { flex: 1, backgroundColor: '#111', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '900', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 'bold' },

  heroContainer: { marginBottom: 25 },
  sectionLabel: { color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 2, textAlign: 'center', marginBottom: 15 },
  heroCard: { backgroundColor: '#0A0A0A', padding: 35, borderRadius: 24, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333' },
  heroTime: { color: 'white', fontSize: 64, fontWeight: 'bold' },
  heroAmPm: { fontSize: 24, color: 'rgba(255,255,255,0.3)' },
  heroTitle: { color: 'white', fontSize: 20, marginTop: 5 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 25 },
  countdownText: { color: 'rgba(255,255,255,0.4)', fontSize: 16 },
  proofBtn: { backgroundColor: '#151515', flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, marginTop: 25, width: '100%', justifyContent: 'center' },
  proofText: { color: 'rgba(255,255,255,0.6)', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  metricsCard: { backgroundColor: '#0A0A0A', padding: 20, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  metricSubLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '900' },
  metricMainValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  progressTrack: { height: 6, backgroundColor: '#1A1A1A', borderRadius: 3, marginBottom: 20, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary },
  riskNotice: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(255,149,0,0.05)', padding: 12, borderRadius: 8 },
  riskText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, flex: 1, lineHeight: 14 },

  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 25, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(0,255,128,0.2)' },
  createBtnText: { color: COLORS.primary, fontWeight: '900', letterSpacing: 1.5, fontSize: 14 },
  previewSection: { marginBottom: 30 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  previewLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  viewAllText: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold' },
  previewItem: { 
    backgroundColor: '#111', 
    padding: 16, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a'
  },
  previewLeft: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
  previewTime: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  previewTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, flex: 1 },
  noMoreBox: { padding: 20, alignItems: 'center', backgroundColor: '#0A0A0A', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#222' },
  noMoreText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 'bold' },
});