import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme'; // Using your theme now

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.shieldIcon, { borderColor: COLORS.border }]}>
              <Ionicons name="shield-checkmark" size={30} color={COLORS.primary} />
            </View>
            <Text style={[styles.title, { color: COLORS.text }]}>Sign In</Text>
            <Text style={[styles.subtitle, { color: COLORS.textSecondary }]}>Enter your details to stay accountable.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputCard}>
              <Text style={[styles.label, { color: COLORS.textSecondary }]}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={[styles.label, { color: COLORS.textSecondary }]}>PASSWORD</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <Ionicons name="eye-outline" size={20} color={COLORS.textSecondary} />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: COLORS.primary }]} 
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={[styles.forgotText, { color: COLORS.textSecondary }]}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerBaseText, { color: COLORS.textSecondary }]}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={[styles.signUpText, { color: COLORS.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24 },
  backButton: { marginBottom: 20 },
  header: { marginBottom: 40 },
  shieldIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    backgroundColor: '#0A1A0A', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    borderWidth: 1
  },
  title: { fontSize: 36, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { gap: 16 },
  inputCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  label: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
  input: { color: '#000', fontSize: 16, fontWeight: '500' },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  button: { 
    padding: 20, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  forgotText: { textAlign: 'center', marginTop: 15, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingBottom: 10 },
  footerBaseText: { },
  signUpText: { fontWeight: 'bold' }
});