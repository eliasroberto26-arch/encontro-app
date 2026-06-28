import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONFIG } from '../../../App';

export default function SelfieLiveness({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState('pisque'); // pisque, sorria, pronto
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-off" size={80} color="#999" />
        <Text style={styles.permissionText}>Preciso da câmera pra validar que você é real</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Liberar Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (step === 'pisque') {
      // Simula detecção de piscada - depois troca por ML Kit
      setTimeout(() => {
        setStep('sorria');
      }, 1000);
    } else if (step === 'sorria') {
      // Simula detecção de sorriso
      setTimeout(() => {
        setStep('pronto');
        setTimeout(() => {
          Alert.alert('Verificado! ✅', 'Você é uma pessoa real');
          navigation.navigate('Etapa4Biografia');
        }, 1500);
      }, 1000);
    }
  };

  const getInstruction = () => {
    if (step === 'pisque') return 'Pisque os olhos 2x';
    if (step === 'sorria') return 'Agora sorria 😄';
    if (step === 'pronto') return 'Perfeito! Verificado ✅';
    return '';
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="front" 
        ref={cameraRef}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verificação Anti-Fake</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Círculo guia pro rosto */}
          <View style={styles.faceGuide}>
            <View style={styles.faceOval} />
          </View>

          {/* Instrução */}
          <View style={styles.instructionBox}>
            <Icon 
              name={step === 'pronto' ? 'check-circle' : 'eye'} 
              size={32} 
              color={step === 'pronto' ? '#4CAF50' : '#FFF'} 
            />
            <Text style={styles.instructionText}>{getInstruction()}</Text>
          </View>

          {/* Botão */}
          {step !== 'pronto' && (
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'transparent' },
  permissionContainer: { 
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 
  },
  permissionText: { 
    fontSize: 16, color: '#666', textAlign: 'center', marginVertical: 20 
  },
  button: { 
    backgroundColor: CONFIG.COR_PRINCIPAL, paddingHorizontal: 30, 
    paddingVertical: 15, borderRadius: 25 
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  faceGuide: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  faceOval: { 
    width: 280, height: 350, borderRadius: 140, 
    borderWidth: 3, borderColor: '#FFF', borderStyle: 'dashed' 
  },
  instructionBox: { 
    alignItems: 'center', marginBottom: 40 
  },
  instructionText: { 
    color: '#FFF', fontSize: 20, fontWeight: 'bold', 
    marginTop: 10, textShadowColor: '#000', 
    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 
  },
  captureButton: { 
    alignSelf: 'center', marginBottom: 50, width: 80, height: 80, 
    borderRadius: 40, backgroundColor: '#FFF', 
    justifyContent: 'center', alignItems: 'center' 
  },
  captureInner: { 
    width: 70, height: 70, borderRadius: 35, 
    backgroundColor: CONFIG.COR_PRINCIPAL 
  },
});
