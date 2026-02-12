import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import api from '../../services/api';
import { format } from 'date-fns';

export default function AlarmDetailScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams(); // This gets the ID from the URL
  
  const [alarm, setAlarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlarmDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get<any>(`/alarms/${id}`);
        if (response.data.success) {
          setAlarm(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching alarm details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAlarmDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!alarm) return null;

  // Format the time for the Hero section
  const alarmDate = new Date(alarm.startDate);
  const displayTime = format(alarmDate, 'hh:mm');
  const displayAmPm = format(alarmDate, 'aa');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ALARM DETAILS</Text>
        <TouchableOpacity>
          <Ionicons name="pencil" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Main Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroGoal}>{alarm.goal}</Text>
              <View style={styles.timeRow}>
                <Text style={styles.heroTime}>{displayTime}</Text>
                <Text style={styles.heroAmPm}>{displayAmPm}</Text>
              </View>
              <View style={styles.repeatRow}>
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.5)" />
                <Text style={styles.repeatText}>
                    {alarm.repeat || "Once"}
                </Text>
              </View>
            </View>
            <View style={styles.badgeContainer}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{alarm.status?.toUpperCase() || 'ACTIVE'}</Text>
              </View>
              <Ionicons name="alarm-outline" size={60} color="rgba(255,255,255,0.05)" style={styles.bgIcon} />
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>CONFIGURATION</Text>

        {/* Config List */}
        <View style={styles.configBox}>
          <ConfigItem 
            icon="camera-outline" 
            label="Proof Type" 
            value={alarm.proofMethod === 'photo' ? "Photo" : "Text"} 
            color="#3498db" 
          />
          <ConfigItem 
            icon="timer-outline" 
            label="Grace Period" 
            value={alarm.gracePeriod || "None"} 
            color="#f1c40f" 
          />
          <ConfigItem 
            icon="trending-up-outline" 
            label="Escalation" 
            value={alarm.escalationRule || "Default"} 
            color="#e74c3c" 
          />
        </View>

        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
        <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
                {alarm.description || "No additional instructions provided for this objective."}
            </Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => {/* Add Delete Logic */}}>
          <Ionicons name="trash-outline" size={18} color="#e74c3c" />
          <Text style={styles.deleteText}>Delete Alarm</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ConfigItem({ icon, label, value, color }: any) {
  return (
    <View style={styles.configItem}>
      <View style={styles.configLeft}>
        <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.configLabel}>{label}</Text>
      </View>
      <Text style={styles.configValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050805' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: 'white', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  heroCard: { backgroundColor: '#121612', borderRadius: 24, padding: 24, marginVertical: 20, borderWidth: 1, borderColor: '#1f241f' },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  heroGoal: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  timeRow: { flexDirection: 'row', alignItems: 'baseline' },
  heroTime: { color: 'white', fontSize: 48, fontWeight: 'bold' },
  heroAmPm: { color: 'rgba(255,255,255,0.3)', fontSize: 24, marginLeft: 8, fontWeight: '600' },
  repeatRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  repeatText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginLeft: 6 },
  badgeContainer: { alignItems: 'flex-end', justifyContent: 'space-between' },
  statusBadge: { backgroundColor: 'rgba(52, 152, 219, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(52, 152, 219, 0.3)' },
  statusBadgeText: { color: '#3498db', fontSize: 10, fontWeight: 'bold' },
  bgIcon: { position: 'absolute', bottom: -10, right: -5 },
  sectionLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 15, marginTop: 10 },
  configBox: { backgroundColor: '#121612', borderRadius: 20, padding: 8, marginBottom: 25, borderWidth: 1, borderColor: '#1f241f' },
  configItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  configLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  configLabel: { color: 'white', fontSize: 16, fontWeight: '500' },
  configValue: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  descriptionBox: { backgroundColor: '#121612', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#1f241f' },
  descriptionText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 20 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, padding: 15 },
  deleteText: { color: '#e74c3c', fontSize: 14, fontWeight: 'bold', marginLeft: 8 }
});