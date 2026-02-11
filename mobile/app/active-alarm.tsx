import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import moment from 'moment';

export default function ActiveAlarmScreen() {
  const router = useRouter();
  const { id, goal } = useLocalSearchParams();
  const [displayTime, setDisplayTime] = React.useState(moment().format('HH:mm'));

  React.useEffect(() => {
    const t = setInterval(() => {
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleOpenCamera = () => {
    router.push({
      pathname: '/camera-verification' as any,
      params: { id }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#000000']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* TACTICAL HEADER */}
          <View style={styles.header}>
            <Text style={styles.activeTag}>STRIKE WINDOW ACTIVE</Text>
            <View style={[styles.indicator, { backgroundColor: COLORS.primary }]} />
          </View>

          {/* MASSIVE TIME DISPLAY */}
          <View style={styles.mainDisplay}>
            <Text style={styles.timeBig}>{displayTime}</Text>
            
            <View style={styles.dashedCard}>
              <Text style={styles.requirementText}>REQUIRED OBJECTIVE</Text>
              <Text style={[styles.goalText, { color: COLORS.primary }]}>
                {goal?.toString().toUpperCase() || 'OBJECTIVE MISSING'}
              </Text>
              <View style={styles.proofBadge}>
                <Ionicons name="camera" size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.proofBadgeText}>PHOTO PROOF REQUIRED</Text>
              </View>
            </View>
          </View>

          {/* FOOTER ACTIONS */}
          <View style={styles.footer}>
            <Text style={styles.infoText}>
              SYSTEM LOCKED UNTIL VERIFICATION IS RECEIVED
            </Text>

            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: COLORS.primary }]}
              onPress={handleOpenCamera}
            >
              <Ionicons name="camera" size={24} color="#000" />
              <Text style={styles.submitBtnText}>EXECUTE PROOF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.emergencyBtn}>
               <Text style={styles.emergencyText}>EMERGENCY OVERRIDE (12% PENALTY)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 30, paddingVertical: 60, alignItems: 'center', justifyContent: 'space-between' },
  header: { alignItems: 'center' },
  activeTag: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  indicator: { width: 60, height: 2, borderRadius: 1, marginTop: 15 },
  
  mainDisplay: { alignItems: 'center', width: '100%' },
  timeBig: { color: '#FFF', fontSize: 110, fontWeight: 'bold', letterSpacing: -4, marginBottom: 20 },
  
  dashedCard: { 
    width: '100%', 
    padding: 30, 
    borderRadius: 24, 
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: '#333', 
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  requirementText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  goalText: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  proofBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#111', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  proofBadgeText: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  infoText: { color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', fontWeight: '600', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  
  footer: { width: '100%', alignItems: 'center' },
  submitBtn: { 
    width: '100%', 
    padding: 24, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12,
  },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  emergencyBtn: { marginTop: 25, padding: 10 },
  emergencyText: { color: 'rgba(255,59,48,0.4)', fontSize: 10, fontWeight: '900', letterSpacing: 1 }
});