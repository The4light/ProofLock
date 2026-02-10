import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          router.replace('/login' as any); // Send back to start
        } 
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SYSTEM</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Coming Soon")}>
          <Text style={styles.settingText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
// ... (Styles remain the same)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b120b', padding: 25 },
  header: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 30 },
  section: { marginBottom: 35 },
  sectionLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2, marginBottom: 15 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  settingText: { color: 'white', fontSize: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  menuText: { color: 'white', fontSize: 16, flex: 1, marginLeft: 15 },
  logoutBtn: { marginTop: 'auto', paddingVertical: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#222' },
  logoutText: { color: '#FF453A', fontSize: 16, fontWeight: 'bold' }
});