import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Text style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.shieldIcon}>
              <Ionicons name="person-add" size={30} color="#39FF14" />
            </View>
            <Text style={styles.title}>Sign up </Text>
            <Text style={styles.subtitle}>Start your journey toward absolute accountability.</Text>
          </View>

          <View style={styles.form}>
            {/* Username Input - Critical for our Backend! */}
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

            {/* Email Input */}
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

            {/* Password Input */}
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

            {/* Sign Up Button */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.buttonText}>Create Account</Text>
              <Ionicons name="checkmark-circle" size={20} color="#000" style={{ marginLeft: 8 }} />
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
    </Text>
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