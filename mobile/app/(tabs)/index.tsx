import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── HELPER: Get the next effective Date object from any alarm type ───────────
function getEffectiveAlarmTime(alarm: any): Date | null {
  if (alarm.type === 'advanced') {
    const now = new Date();
    // Find the next date in the dates array that hasn't passed yet
    const upcoming = (alarm.dates || [])
      .map((d: string) => {
        // Combine YYYY-MM-DD date with HH:MM startTime
        const [h, m] = (alarm.startTime || '00:00').split(':').map(Number);
        const dt = new Date(d);
        dt.setHours(h, m, 0, 0);
        return dt;
      })
      .filter((dt: Date) => dt > now)
      .sort((a: Date, b: Date) => a.getTime() - b.getTime());

    // If indefinite and no future dates left, just use today with startTime
    if (upcoming.length === 0 && alarm.isIndefinite) {
      const [h, m] = (alarm.startTime || '00:00').split(':').map(Number);
      const fallback = new Date();
      fallback.setHours(h, m, 0, 0);
      if (fallback < now) fallback.setDate(fallback.getDate() + 1);
      return fallback;
    }

    return upcoming[0] || null;
  }

  // Basic alarm — just use startDate
  return alarm.startDate ? new Date(alarm.startDate) : null;
}

// ─── HELPER: Format a HH:MM string to readable 12h ──────────────────────────
function formatTimeString(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function DashboardScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [nextAlarm, setNextAlarm] = useState<any>(null);
  const [stats, setStats] = useState({ remaining: 0, completed: 0, missed: 0 });
  const [previewAlarms, setPreviewAlarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

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

        // Attach effectiveTime to every alarm so we can sort uniformly
        const withTimes = alarms
          .map((a: any) => ({ ...a, _effectiveTime: getEffectiveAlarmTime(a) }))
          .filter((a: any) => {
            if (!a._effectiveTime) return false;
            return a._effectiveTime > now && (a.status === 'upcoming' || a.status === 'scheduled');
          })
          .sort((a: any, b: any) => a._effectiveTime.getTime() - b._effectiveTime.getTime());

        setNextAlarm(withTimes[0] || null);
        setPreviewAlarms(withTimes.slice(1, 3));

        setStats({
          remaining: withTimes.length,
          completed: alarms.filter((a: any) => a.status === 'completed').length,
          missed: alarms.filter((a: any) => {
            const t = getEffectiveAlarmTime(a);
            return t && t < now && a.status === 'upcoming';
          }).length
        });
      }
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useFocusEffect(
    React.useCallback(() => { fetchData(); }, [])
  );

  // Countdown — works off _effectiveTime now
  useEffect(() => {
    if (!nextAlarm?._effectiveTime) { setCountdown(""); return; }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const alarmTime = new Date(nextAlarm._effectiveTime).getTime();
      const diff = alarmTime - now;

      if (diff <= 0) {
        setCountdown("DUE NOW");
        clearInterval(timer);
        router.push({
          pathname: '/active-alarm',
          params: { id: nextAlarm._id, goal: nextAlarm.goal }
        });
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(h === 0 && m === 0 ? `${s}s` : `${h > 0 ? h + 'h ' : ''}${m}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextAlarm]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isAdvanced = (alarm: any) => alarm?.type === 'advanced';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, {user?.name || 'User'}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text>
        </View>
        <TouchableOpacity><Ionicons name="ellipsis-vertical" size={24} color="rgba(255,255,255,0.4)" /></TouchableOpacity>
      </View>

      {/* QUICK STATS */}
      <View style={styles.statsRow}>
        <StatBox label="REMAINING" value={stats.remaining.toString().padStart(2, '0')} color="white" />
        <StatBox label="COMPLETED" value={stats.completed.toString().padStart(2, '0')} color={COLORS.primary} />
        <StatBox label="MISSED" value={stats.missed.toString().padStart(2, '0')} color="#FF3B30" />
      </View>

      {/* HERO — UPCOMING OBJECTIVE */}
      <View style={styles.heroContainer}>
        <Text style={styles.sectionLabel}>UPCOMING OBJECTIVE</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (nextAlarm) {
              router.push({ pathname: "/app-details/[id]", params: { id: nextAlarm._id } });
            }
          }}
        >
          <View style={styles.heroCard}>

            {/* ── Advanced badge row ── */}
            {isAdvanced(nextAlarm) && (
              <View style={styles.advancedBadgeRow}>
                <View style={styles.advancedBadge}>
                  <Ionicons name="rocket" size={11} color="#000" />
                  <Text style={styles.advancedBadgeText}>ADVANCED</Text>
                </View>
                {nextAlarm.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{nextAlarm.category.toUpperCase()}</Text>
                  </View>
                )}
              </View>
            )}

            {/* ── Time display ── */}
            {isAdvanced(nextAlarm) ? (
              // Advanced: show START → END session window
            <View style={styles.sessionTimeline}>
              <View style={styles.timeBlock}>
                <Text style={styles.sessionLabel}>START</Text>
                <Text style={styles.timeValue}>{formatTimeString(nextAlarm.startTime)}</Text>
              </View>
              
              {/* The Dash/Separator */}
              <View style={styles.timelineDivider}>
                <View style={styles.dashLine} />
                <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
                <View style={styles.dashLine} />
              </View>

              <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
                <Text style={styles.sessionLabel}>END</Text>
                <Text style={styles.timeValue}>{formatTimeString(nextAlarm.endTime)}</Text>
              </View>
            </View>
            ) : (
              // Basic: single large time
              <Text
                style={styles.heroTime}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {nextAlarm
                  ? new Date(nextAlarm.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : "--:--"}
              </Text>
            )}

            <Text style={styles.heroTitle}>
              {nextAlarm ? nextAlarm.goal : "SYSTEM CLEAR"}
            </Text>

            {/* ── Protocol preview (advanced only) ── */}
            {isAdvanced(nextAlarm) && nextAlarm.protocol?.length > 0 && (
              <View style={styles.protocolPreview}>
                {nextAlarm.protocol.slice(0, 2).map((step: any, i: number) => (
                  <View key={i} style={styles.protocolPreviewItem}>
                    <View style={styles.protocolPreviewDot} />
                    <Text style={styles.protocolPreviewText} numberOfLines={1}>{step.task}</Text>
                  </View>
                ))}
                {nextAlarm.protocol.length > 2 && (
                  <Text style={styles.protocolMore}>+{nextAlarm.protocol.length - 2} more steps</Text>
                )}
              </View>
            )}

            <View style={styles.countdownRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={[styles.countdownText, { color: COLORS.primary }]}>
                STARTS IN {countdown || "..."}
              </Text>
            </View>

            <View style={styles.proofBtn}>
              <Ionicons
                name={nextAlarm?.proofMethod === 'photo' ? "camera" : isAdvanced(nextAlarm) ? "checkmark-done" : "barcode-outline"}
                size={18}
                color="rgba(255,255,255,0.6)"
              />
              <Text style={styles.proofText}>
                {isAdvanced(nextAlarm)
                  ? `CHECKLIST · ${nextAlarm.protocol?.length || 0} STEPS`
                  : nextAlarm
                    ? `PROOF: ${nextAlarm.proofMethod?.toUpperCase()} REQUIRED`
                    : "NO PROOF REQUIRED"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* THE HORIZON */}
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewLabel}>THE HORIZON</Text>
          <TouchableOpacity onPress={() => router.push('/upcomingScreen')}>
            <Text style={styles.viewAllText}>VIEW ALL →</Text>
          </TouchableOpacity>
        </View>

        {previewAlarms.length > 0 ? (
          previewAlarms.map((alarm, index) => (
            <TouchableOpacity
              key={index}
              style={styles.previewItem}
              onPress={() => router.push({ pathname: "/alarm-details/[id]" as any, params: { id: alarm._id } })}
            >
              <View style={styles.previewLeft}>
                {/* Time — single for basic, start time for advanced */}
                <Text style={styles.previewTime}>
                  {isAdvanced(alarm)
                    ? formatTimeString(alarm.startTime)
                    : new Date(alarm.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewTitle} numberOfLines={1}>{alarm.goal}</Text>
                  {/* Advanced: show end time underneath */}
                  {isAdvanced(alarm) && (
                    <Text style={styles.previewEndTime}>
                      ends {formatTimeString(alarm.endTime)}
                      {alarm.category ? `  ·  ${alarm.category}` : ''}
                    </Text>
                  )}
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {isAdvanced(alarm) && (
                  <View style={styles.horizonAdvBadge}>
                    <Ionicons name="rocket" size={10} color={COLORS.primary} />
                  </View>
                )}
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
              </View>
            </TouchableOpacity>
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
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${user?.disciplineScore ?? 0}%` }]} />
        </View>
        <View style={styles.riskNotice}>
          <Ionicons name="warning" size={14} color="#FF9500" />
          <Text style={styles.riskText}>
            {(user?.disciplineScore || 0) < 50
              ? "CRITICAL STATUS. MISSION FAILURE IMMINENT. RECOVER DISCIPLINE IMMEDIATELY."
              : "HIGH RISK WINDOW DETECTED. MISSING THE NEXT OBJECTIVE WILL RESULT IN A PENALTY."}
          </Text>
        </View>
      </View>

      {/* CREATE BUTTON */}
      <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/create-alarm')}>
        <Ionicons name="add" size={24} color={COLORS.primary} />
        <Text style={styles.createBtnText}>CREATE NEW ALARM</Text>
      </TouchableOpacity>

    </ScrollView>
    {/* THE FLOATING ACTION BUTTON */}
    <TouchableOpacity 
      style={styles.fab} 
      activeOpacity={0.8}
      onPress={() => router.push('/create-alarm')} // Or your modal route
    >
      <Ionicons name="add" size={32} color="#000" />
    </TouchableOpacity>
  </SafeAreaView>
  );
}

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
  heroTitle: { color: 'white', fontSize: 20, marginTop: 5 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 25 },
  countdownText: { color: 'rgba(255,255,255,0.4)', fontSize: 16 },
  proofBtn: { backgroundColor: '#151515', flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, marginTop: 25, width: '100%', justifyContent: 'center' },
  proofText: { color: 'rgba(255,255,255,0.6)', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  // ── Advanced badge row ──
  advancedBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, alignSelf: 'flex-start' },
  advancedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  advancedBadgeText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  categoryBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  categoryBadgeText: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  // ── Session window hero ──
  sessionWindowHero: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%', justifyContent: 'space-between' },
  sessionTimeBlock: { alignItems: 'flex-start' },
  sessionHeroLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 2 },
  sessionHeroTime: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  sessionHeroArrow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' },
  sessionHeroLine: { flex: 1, height: 1, backgroundColor: '#333', maxWidth: 30 },
  sessionTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  timeBlock: {
    flexDirection: 'column',
  },
  sessionLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  timeValue: {
    color: 'white',
    fontSize: 24, // Reduced from 36 to prevent collision
    fontWeight: 'bold',
  },
  timelineDivider: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    opacity: 0.3,
  },
  dashLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.primary,
    marginHorizontal: 5,
  },

  // ── Protocol preview ──
  protocolPreview: { width: '100%', marginTop: 14, marginBottom: 4, gap: 6 },
  protocolPreviewItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  protocolPreviewDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary },
  protocolPreviewText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, flex: 1 },
  protocolMore: { color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 2, marginLeft: 13 },

  // ── Metrics ──
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

  // ── Horizon ──
  previewSection: { marginBottom: 30 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  previewLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  viewAllText: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold' },
  previewItem: { backgroundColor: '#111', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#1a1a1a' },
  previewLeft: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
  previewTime: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  previewTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  previewEndTime: { color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 2 },
  horizonAdvBadge: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(0,255,128,0.08)', borderWidth: 1, borderColor: 'rgba(0,255,128,0.2)', justifyContent: 'center', alignItems: 'center' },
  noMoreBox: { padding: 20, alignItems: 'center', backgroundColor: '#0A0A0A', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#222' },
  noMoreText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 'bold' },

  //floating action button
 fab: {
    position: 'absolute',
    bottom: 25, 
    right: 20, 
    // FOCAL COLOR: Mid-shade Teal (High tech, steady feel)
    backgroundColor: 'rgb(13, 229, 204)', 
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#008080', // Matching shadow for a subtle "glow" effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)', // Light border to define the edge
  },
});