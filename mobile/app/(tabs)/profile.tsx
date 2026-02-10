import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';

export default function SettingsScreen() {
  const [user, setUser] = useState({
    name: "Alex Johnson",
    avatar: "https://via.placeholder.com/150",
    reliability: 98,
    streak: 15
  });
  const [hardcoreMode, setHardcoreMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get<any>('/auth/me');
      if (response.data.success) {
        setUser({
          name: response.data.data.name,
          avatar: response.data.data.avatar || "https://via.placeholder.com/150",
          reliability: response.data.data.reliability || 98,
          streak: response.data.data.streak || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need access to your photos to change your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      const formData = new FormData();
      
      const fileToUpload: any = {
        uri: uri,
        type: 'image/jpeg',
        name: 'profile-picture.jpg',
      };

      formData.append('avatar', fileToUpload);

      const response = await api.post<any>('/user/update-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const newAvatarUrl = response.data.avatarUrl;
        setUser(prev => ({ ...prev, avatar: newAvatarUrl }));
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      // Optional: Clear token from AsyncStorage
      // await AsyncStorage.removeItem('userToken'); 
      
      // Redirect to Login (if using expo-router)
      // router.replace('/login');
      
      Alert.alert("Logged Out", "You have been logged out successfully.");
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color="white" />
        <Ionicons name="notifications" size={24} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>Settings</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image 
            key={user.avatar}
            source={{ uri: user.avatar }} 
            style={styles.avatar} 
            defaultSource={{ uri: 'https://via.placeholder.com/150' }}
          />
          <View style={styles.editBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.userName}>{user.name}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.badgeGreen}><Text style={styles.badgeText}>{user.reliability}% RELIABILITY</Text></View>
          <View style={styles.badgeGray}><Text style={styles.badgeText}>{user.streak} DAY STREAK</Text></View>
        </View>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>ACCOUNT</Text>
      <SettingItem icon="person-outline" label="Edit Profile" />
      <SettingItem icon="cash-outline" label="Subscription" rightLabel="Pro Plan" labelColor={COLORS.primary} />

      {/* Accountability Rules */}
      <Text style={styles.sectionTitle}>ACCOUNTABILITY RULES</Text>
      <SettingItem icon="camera-outline" label="Proof Method" rightLabel="Photo Proof" labelColor={COLORS.primary} />
      
      <View style={styles.settingRow}>
        <View style={styles.leftSide}>
          <View style={styles.iconBox}><Ionicons name="refresh-outline" size={20} color="white" /></View>
          <View>
            <Text style={styles.label}>Hardcore Mode</Text>
            <Text style={styles.subLabel}>Prevent device shutdown</Text>
          </View>
        </View>
        <Switch 
          value={hardcoreMode} 
          onValueChange={setHardcoreMode}
          trackColor={{ false: '#333', true: COLORS.primary }}
        />
      </View>

      <SettingItem icon="time-outline" label="Penalty History" />

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>Delete Account & Forfeit Data</Text>
      <Text style={styles.versionText}>VERSION 2.4.1 (HARDCORE EDITION)</Text>
    </ScrollView>
  );
}

// Reusable component for the list items
const SettingItem = ({ icon, label, rightLabel, labelColor }: any) => (
  <TouchableOpacity style={styles.settingRow}>
    <View style={styles.leftSide}>
      <View style={styles.iconBox}><Ionicons name={icon} size={20} color="white" /></View>
      <View>
        <Text style={styles.label}>{label}</Text>
        {label === "Proof Method" && <Text style={styles.subLabel}>Required to dismiss alarm</Text>}
      </View>
    </View>
    <View style={styles.rightSide}>
      {rightLabel && <Text style={[styles.rightLabel, { color: labelColor || 'rgba(255,255,255,0.4)' }]}>{rightLabel}</Text>}
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
    </View>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050805', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 50, marginBottom: 20 },
  title: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 25 },
  profileCard: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: COLORS.primary, padding: 5, marginBottom: 15 },
  avatar: { width: '100%', height: '100%', borderRadius: 60 },
  editBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#050805', borderRadius: 12 },
  userName: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10 },
  badgeGreen: { backgroundColor: 'rgba(0,255,128,0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,255,128,0.2)' },
  badgeGray: { backgroundColor: '#1A1A1A', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  sectionTitle: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.2, marginTop: 25, marginBottom: 15 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#121612', padding: 16, borderRadius: 16, marginBottom: 10 },
  leftSide: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { width: 40, height: 40, backgroundColor: '#1f241f', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  label: { color: 'white', fontSize: 16, fontWeight: '500' },
  subLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  rightSide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rightLabel: { fontSize: 14, fontWeight: '600' },
  logoutBtn: { marginTop: 40, backgroundColor: 'rgba(255,59,48,0.1)', padding: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)' },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16 },
  footerText: { color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 20, fontSize: 12 },
  versionText: { color: 'rgba(255,255,255,0.1)', textAlign: 'center', marginTop: 40, marginBottom: 40, fontSize: 10, letterSpacing: 1 }
});