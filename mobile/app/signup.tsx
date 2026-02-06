import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function SignUpScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Hits your POST /api/v1/auth/register
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });

      if (response.data.success) {
        await AsyncStorage.setItem('userToken', response.data.token);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Registration failed";
      Alert.alert("Signup Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.shieldIcon}>
              <Ionicons name="person-add" size={30} color="#39FF14" />
            </View>
            <Text style={styles.title}>Sign up</Text>
            <Text style={styles.subtitle}>Start your journey toward absolute accountability.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputCard}>
              <Text style={styles.label}>USERNAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Alex_Proof"
                placeholderTextColor="#A0A0A0"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, { opacity: loading ? 0.7 : 1 }]} 
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
              {!loading && <Ionicons name="checkmark-circle" size={20} color="#000" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerBaseText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 24, flexGrow: 1 },
  backButton: { marginBottom: 20 },
  header: { marginBottom: 30 },
  shieldIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    backgroundColor: '#0A1A0A', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1A3A1A'
  },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 16, lineHeight: 22 },
  form: { gap: 16 },
  inputCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16 
  },
  label: { color: '#888', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  input: { color: '#000', fontSize: 16, fontWeight: '500' },
  button: { 
    backgroundColor: '#39FF14', 
    padding: 20, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, paddingBottom: 20 },
  footerBaseText: { color: '#666' },
  signInText: { color: '#39FF14', fontWeight: 'bold' }
});