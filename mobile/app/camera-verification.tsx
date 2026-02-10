import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import api from '../services/api';

export default function CameraVerification() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const [isFinished, setIsFinished] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>
          We need permission to use your camera
        </Text>
        <TouchableOpacity style={styles.captureBtn} onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.3, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      setPhoto(data);
    }
  };

  const uploadVerification = async () => {
    try {
      const response = await api.patch<any>(`/alarms/${id}/status`, {
        status: 'completed',
        verifiedAt: new Date(),
        image: photo.base64
      });

      if (response.data.success) {
        setIsFinished(true);
      }
    } catch (error) {
      console.error("Upload failed", error);
      Alert.alert("Error", "Failed to verify. Try again.");
    }
  };

  // --- THIS IS THE "PROOF ACCEPTED" SCREEN FROM YOUR DESIGN ---
  if (isFinished) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>VERIFICATION</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <View style={styles.content}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={40} color={COLORS.primary} />
          </View>

          <Text style={styles.successTitle}>Proof Accepted</Text>
          <Text style={styles.successSub}>Commitment Fulfilled.</Text>

          <View style={styles.imageCard}>
            <Image source={{ uri: photo.uri }} style={styles.finalImage} />
          </View>

          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.brandingText}>ACCOUNTABILITY SECURED</Text>
      </View>
    );
  }

  // --- THIS IS THE CAMERA / PREVIEW UI ---
  return (
    <View style={styles.container}>
      {!photo ? (
        <>
          <CameraView style={styles.camera} ref={cameraRef} />
          <View style={[StyleSheet.absoluteFill, styles.overlay]}>
            <View style={styles.camHeader}>
               <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons name="close-circle" size={40} color="rgba(255,255,255,0.5)" />
               </TouchableOpacity>
               <Text style={styles.camTitle}>Submit Proof</Text>
               <View style={{width: 40}} />
            </View>
            
            <View style={styles.camBottom}>
               <Text style={styles.camInstruction}>Show your routine clearly to dismiss the alarm.</Text>
               <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                  <Ionicons name="camera" size={32} color="black" />
               </TouchableOpacity>
               <Text style={styles.timeText}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
               <Text style={styles.timeLabel}>CURRENT TIME</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} />
          <View style={styles.footer}>
            <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhoto(null)}>
              <Text style={{ color: 'white', fontWeight: '600' }}>RETAKE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={uploadVerification}>
              <Text style={{ color: 'black', fontWeight: 'bold' }}>SUBMIT PROOF</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b120b' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 40 },
  camHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  camTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  camBottom: { alignItems: 'center', marginBottom: 20 },
  camInstruction: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  timeText: { color: COLORS.primary, fontSize: 42, fontWeight: 'bold', marginTop: 20 },
  timeLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1 },
  
  // Success Screen Styles (Matching your screenshot)
  successContainer: { flex: 1, backgroundColor: '#0b120b', padding: 25 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 },
  headerTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, letterSpacing: 2 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(30, 215, 96, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary, marginBottom: 30 },
  successTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  successSub: { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 40 },
  imageCard: { width: '100%', height: 250, borderRadius: 15, overflow: 'hidden', backgroundColor: '#1a1a1a', marginBottom: 40, borderWidth: 1, borderColor: '#333' },
  finalImage: { width: '100%', height: '100%', opacity: 0.8 },
  doneButton: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  doneText: { color: 'black', fontSize: 18, fontWeight: 'bold' },
  brandingText: { color: 'rgba(255,255,255,0.2)', textAlign: 'center', fontSize: 12, letterSpacing: 3, marginBottom: 20 },

  // Camera Buttons
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
  previewContainer: { flex: 1, backgroundColor: '#000' },
  preview: { flex: 1, resizeMode: 'cover' },
  footer: { flexDirection: 'row', padding: 30, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b120b' },
  retakeBtn: { padding: 15 },
  confirmBtn: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10 }
});