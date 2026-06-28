// screens/RadarScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { UserContext, CONFIG } from '../App';

export default function RadarScreen() {
  const [ativo, setAtivo] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const { userData } = useContext(UserContext);

  const ativarRadar = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Ative a localização pra usar o radar');
      return;
    }
    
    setAtivo(true);
    setTempoRestante(30);
    
    const interval = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAtivo(false);
          Alert.alert('Radar Desativado', 'Seus 30 minutos acabaram');
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    Alert.alert('Radar Ativado', 'Você ficará visível por 30 min para pessoas num raio de 200m');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Radar MeetPerto</Text>
      <Text style={styles.desc}>Fique visível por 30 min pra quem está a até 200m de você</Text>
      
      {ativo ? (
        <View style={styles.ativo}>
          <Text style={styles.ativoTexto}>🟢 RADAR ATIVO</Text>
          <Text style={styles.tempo}>Tempo restante: {tempoRestante} min</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.botao} onPress={ativarRadar}>
          <Text style={styles.botaoTexto}>📍 ESTOU AQUI</Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.aviso}>Logado como: {userData?.nome || 'Usuário'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF5F8', justifyContent: 'center' },
  titulo: { fontSize: 28, fontWeight: 'bold', color: CONFIG.COR_PRINCIPAL, textAlign: 'center', marginBottom: 12 },
  desc: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
  botao: { backgroundColor: CONFIG.COR_SECUNDARIA, padding: 20, borderRadius: 16, elevation: 4 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
  ativo: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 16 },
  ativoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
  tempo: { color: '#fff', textAlign: 'center', marginTop: 8, fontSize: 16 },
  aviso: { textAlign: 'center', marginTop: 40, color: '#999' }
});
