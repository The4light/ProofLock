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
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      setPhoto(data);
    }
  };

  const uploadVerification = async () => {
    try {
      // Logic: Update alarm status to completed in backend
      const response = await api.patch(`/alarms/${id}/status`, {
        status: 'completed',
        verifiedAt: new Date(),
        image: photo.base64 // Send base64 to backend
      });

      if (response.data.success) {
        Alert.alert("Success!", "Accountability verified. Alarm dismissed.", [
          { text: "OK", onPress: () => router.replace('/(tabs)/dashboard' as any) }
        ]);
      }
    } catch (error) {
      console.error("Upload failed", error);
      Alert.alert("Error", "Failed to verify. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      {!photo ? (
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.overlay}>
            <Text style={styles.instruction}>Take a photo of your task</Text>
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} />
          <View style={styles.footer}>
            <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhoto(null)}>
              <Text style={{ color: 'white' }}>RETAKE</Text>
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
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  instruction: { color: 'white', fontSize: 18, marginBottom: 20, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 },
  captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary },
  previewContainer: { flex: 1 },
  preview: { flex: 1, resizeMode: 'cover' },
  footer: { flexDirection: 'row', padding: 30, justifyContent: 'space-between', backgroundColor: '#000' },
  retakeBtn: { padding: 20 },
  confirmBtn: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10 }
});