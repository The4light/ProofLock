import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        {/* Top Visual Identity */}
        <View style={styles.shieldWrapper}>
          <View style={styles.shieldOutline}>
             <View style={styles.shieldInner}>
                <Text style={{fontSize: 20}}>✅</Text>
             </View>
          </View>
        </View>

        {/* Main Onboarding Card */}
        <View style={styles.card}>
          <View style={styles.visualContainer}>
            {/* The Alarm/Clock Icon Visual from your design */}
            <View style={styles.glowCircle}>
              <View style={styles.alarmIcon}>
                <Text style={{fontSize: 40}}>⏰</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.title}>Commitment{"\n"}through action.</Text>
          
          <Text style={styles.subtitle}>
            No more snoozing. To silence your alarm, you must provide proof—whether it’s a photo, a puzzle, or a physical task.
          </Text>
          
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Begin Setup</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>ACCOUNTABILITY ENFORCEMENT</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  content: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  shieldWrapper: {
    marginBottom: 30,
  },
  shieldOutline: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1A3A1A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#051005'
  },
  shieldInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0A200A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: { 
    backgroundColor: '#0A0A0A', 
    borderRadius: 32, 
    padding: 30, 
    width: '100%', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: 40 
  },
  visualContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#050505',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden'
  },
  glowCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#39FF1433',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  alarmIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#39FF14',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: { 
    color: '#FFF', 
    fontSize: 32, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 16,
    lineHeight: 38
  },
  subtitle: { 
    color: '#888', 
    textAlign: 'center', 
    fontSize: 15,
    lineHeight: 22, 
    paddingHorizontal: 10,
    marginBottom: 24 
  },
  pagination: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 8
  },
  dot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#222' 
  },
  activeDot: { 
    backgroundColor: '#39FF14', 
    width: 18 
  },
  button: { 
    backgroundColor: '#39FF14', 
    width: '100%', 
    padding: 20, 
    borderRadius: 18, 
    alignItems: 'center',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonText: { 
    color: '#000', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  footerText: { 
    color: '#333', 
    fontSize: 11, 
    marginTop: 30, 
    letterSpacing: 3,
    fontWeight: '600'
  }
});