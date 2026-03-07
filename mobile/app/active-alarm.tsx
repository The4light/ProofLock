import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import moment from 'moment';
import api from '../services/api'; // Ensure your API service is imported

export default function ActiveAlarmScreen() {
  const router = useRouter();
  const { id, goal } = useLocalSearchParams();
  const [displayTime, setDisplayTime] = useState(moment().format('HH:mm'));
  const [protocol, setProtocol] = useState<any[]>([]); // New state for Checklist

  useEffect(() => {
    // Update time every second
    const t = setInterval(() => {
      setDisplayTime(moment().format('HH:mm'));
    }, 1000);

    // FETCH PROTOCOL DATA
    const fetchMissionData = async () => {
      try {
        const response = await api.get<any>(`/alarms/${id}`);
        if (response.data.success && response.data.data.protocol) {
          setProtocol(response.data.data.protocol);
        }
      } catch (err) {
        console.error("Failed to load protocol", err);
      }
    };

    fetchMissionData();
    return () => clearInterval(t);
  }, [id]);

  const toggleTask = (index: number) => {
    const newProtocol = [...protocol];
    newProtocol[index].completed = !newProtocol[index].completed;
    setProtocol(newProtocol);
    // Optional: Sync completion to backend here
  };

  const handleOpenCamera = () => {
    router.push({
      pathname: '/camera-verification' as any,
      params: { id }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#000000']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* TACTICAL HEADER */}
          <View style={styles.header}>
            <Text style={styles.activeTag}>STRIKE WINDOW ACTIVE</Text>
            <View style={[styles.indicator, { backgroundColor: COLORS.primary }]} />
          </View>

          {/* MASSIVE TIME DISPLAY */}
          <View style={styles.mainDisplay}>
            <Text style={styles.timeBig}>{displayTime}</Text>
          </View>

          {/* DYNAMIC PROTOCOL SECTION */}
          {protocol.length > 0 && (
            <View style={styles.protocolContainer}>
              <Text style={styles.protocolHeader}>MISSION PROTOCOL</Text>
              {protocol.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.taskItem, item.completed && styles.taskItemDone]}
                  onPress={() => toggleTask(index)}
                >
                  <Ionicons 
                    name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={item.completed ? COLORS.primary : "rgba(255,255,255,0.2)"} 
                  />
                  <Text style={[styles.taskText, item.completed && styles.taskTextDone]}>
                    {item.task}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* GOAL CARD */}
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

          {/* FOOTER ACTIONS */}
          <View style={styles.footer}>
            <Text style={styles.infoText}>SYSTEM LOCKED UNTIL VERIFICATION</Text>
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

        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { flex: 1 },
  scrollContent: { paddingHorizontal: 30, paddingVertical: 60, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  activeTag: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  indicator: { width: 60, height: 2, borderRadius: 1, marginTop: 15 },
  mainDisplay: { alignItems: 'center', width: '100%' },
  timeBig: { color: '#FFF', fontSize: 100, fontWeight: 'bold', letterSpacing: -4 },
  
  // PROTOCOL STYLES
  protocolContainer: { width: '100%', marginBottom: 30 },
  protocolHeader: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 15 },
  taskItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  taskItemDone: { borderColor: 'rgba(0,255,0,0.2)', backgroundColor: 'rgba(0,255,0,0.02)' },
  taskText: { color: '#FFF', marginLeft: 12, fontSize: 14, fontWeight: '500' },
  taskTextDone: { color: 'rgba(255,255,255,0.2)', textDecorationLine: 'line-through' },

  dashedCard: { 
    width: '100%', 
    padding: 25, 
    borderRadius: 24, 
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: '#333', 
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
    marginBottom: 40
  },
  requirementText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  goalText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  proofBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#111', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  proofBadgeText: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  infoText: { color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', fontWeight: '600', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  footer: { width: '100%', alignItems: 'center' },
  submitBtn: { width: '100%', padding: 24, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  emergencyBtn: { marginTop: 25, padding: 10 },
  emergencyText: { color: 'rgba(255,59,48,0.4)', fontSize: 10, fontWeight: '900', letterSpacing: 1 }
});