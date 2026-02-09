import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // npx expo install expo-linear-gradient
import { COLORS } from '../constants/theme';
import moment from 'moment'; 

export default function ActiveAlarmScreen() {
  const router = useRouter();
  const { id, goal } = useLocalSearchParams();
  const [displayTime, setDisplayTime] = React.useState(moment().format('hh:mm'));

  React.useEffect(() => {
    const t = setInterval(() => {
      setDisplayTime(moment().format('hh:mm'));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleOpenCamera = () => {
    // We will build this screen next!
    router.push({
      pathname: '/camera-verification' as any,
      params: { id }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#051505', '#000000']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.activeTag}>ACTIVE ALARM</Text>
            <View style={styles.indicator} />
          </View>

          <View style={styles.mainDisplay}>
            <Text style={styles.timeBig}>{displayTime}</Text>
            
            <View style={styles.goalContainer}>
              <Text style={styles.requirementText}>Required: Photo of your</Text>
              <Text style={styles.goalText}>{goal || 'Morning Routine'}</Text>
            </View>

            <Text style={styles.infoText}>
              The alarm will continue until proof is verified.
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.submitBtn}
              onPress={handleOpenCamera}
            >
              <Ionicons name="camera" size={24} color="#000" />
              <Text style={styles.submitBtnText}>SUBMIT PROOF</Text>
            </TouchableOpacity>

            <Text style={styles.enforcementText}>ACCOUNTABILITY ENFORCEMENT ACTIVE</Text>
            <TouchableOpacity>
               <Text style={styles.emergencyText}>EMERGENCY: DISMISS WITH PENALTY</Text>
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
  content: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 20 },
  activeTag: { color: '#32D74B', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  indicator: { width: 40, height: 4, backgroundColor: '#32D74B', borderRadius: 2, marginTop: 10 },
  mainDisplay: { alignItems: 'center', width: '100%' },
  timeBig: { color: '#F2F2F7', fontSize: 120, fontWeight: 'bold', letterSpacing: -5 },
  goalContainer: { alignItems: 'center', marginVertical: 30 },
  requirementText: { color: '#FFF', fontSize: 24, fontWeight: '600', textAlign: 'center' },
  goalText: { color: '#FFF', fontSize: 24, fontWeight: '900', textAlign: 'center', textDecorationLine: 'underline' },
  infoText: { color: '#8E8E93', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  footer: { width: '100%', alignItems: 'center', gap: 20, marginBottom: 20 },
  submitBtn: { 
    backgroundColor: '#32D74B', 
    width: '100%', 
    padding: 22, 
    borderRadius: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12,
    shadowColor: '#32D74B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  submitBtnText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  enforcementText: { color: '#444', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  emergencyText: { color: '#222', fontSize: 10, fontWeight: '600' }
});