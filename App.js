import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export default function App() {
  const [trialAtivo, setTrialAtivo] = useState(false);
  const [assinante, setAssinante] = useState(false);
  const [horasRestantes, setHorasRestantes] = useState(48);
  const [filtros, setFiltros] = useState({ sexo: 'todos' });
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'Ana, 28', sexo: 'feminino', idade: 28, cidade: 'São Paulo', distancia: '2km' },
    { id: 2, nome: 'Carlos, 32', sexo: 'masculino', idade: 32, cidade: 'São Paulo', distancia: '5km' },
    { id: 3, nome: 'Juliana, 25', sexo: 'feminino', idade: 25, cidade: 'Campinas', distancia: '15km' }
  ]);

  useEffect(() => { checarTrial(); pedirGPS(); }, []);

  const checarTrial = async () => {
    const inicio = await AsyncStorage.getItem('trial_inicio');
    if (!inicio) {
      await AsyncStorage.setItem('trial_inicio', Date.now().toString());
      setTrialAtivo(true);
    } else {
      const horas = (Date.now() - parseInt(inicio)) / 3600000;
      if (horas < 48) { setTrialAtivo(true); setHorasRestantes(Math.ceil(48 - horas)); }
    }
  };

  const pedirGPS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') Alert.alert('GPS necessário', 'Ative a localização para ver pessoas próximas');
  };

  const assinar = (plano) => {
    Alert.alert('Assinar Encontro', `Plano: ${plano}\n\n✓ Chat ilimitado\n✓ Ver quem curtiu você\n✓ Filtros avançados`, [{ text: 'OK' }]);
  };

  const filtrados = usuarios.filter(u => filtros.sexo === 'todos' || u.sexo === filtros.sexo);

  if (!trialAtivo && !assinante) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Encontro</Text>
        <Text style={styles.subtitulo}>Seu teste grátis terminou</Text>
        <TouchableOpacity style={styles.botao} onPress={() => assinar('Mensal R$49,90')}><Text style={styles.botaoTexto}>Mensal - R$ 49,90</Text></TouchableOpacity>
        <TouchableOpacity style={styles.botao} onPress={() => assinar('Trimestral R$129,90')}><Text style={styles.botaoTexto}>Trimestral - R$ 129,90</Text></TouchableOpacity>
        <TouchableOpacity style={styles.botaoDestaque} onPress={() => assinar('Semestral R$259,50')}><Text style={styles.botaoTexto}>Semestral - R$ 259,50</Text><Text style={styles.economia}>Melhor oferta</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Encontro</Text>
      {trialAtivo && <Text style={styles.trial}>Teste grátis: {horasRestantes}h restantes</Text>}
      <View style={styles.botoesFiltro}>
        <TouchableOpacity style={[styles.filtroBtn, filtros.sexo === 'todos' && styles.filtroAtivo]} onPress={() => setFiltros({sexo: 'todos'})}><Text>Todos</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filtroBtn, filtros.sexo === 'feminino' && styles.filtroAtivo]} onPress={() => setFiltros({sexo: 'feminino'})}><Text>Mulheres</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filtroBtn, filtros.sexo === 'masculino' && styles.filtroAtivo]} onPress={() => setFiltros({sexo: 'masculino'})}><Text>Homens</Text></TouchableOpacity>
      </View>
      {filtrados.map(user => (
        <View key={user.id} style={styles.card}>
          <Text style={styles.nome}>{user.nome}</Text>
          <Text style={styles.info}>{user.cidade} • {user.distancia}</Text>
          <TouchableOpacity style={styles.botaoChat}><Text style={styles.botaoTexto}>Conversar</Text></TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#E91E63', textAlign: 'center', marginBottom: 10 },
  subtitulo: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 40 },
  trial: { backgroundColor: '#4CAF50', color: '#fff', padding: 10, borderRadius: 8, textAlign: 'center', marginBottom: 20 },
  botoesFiltro: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filtroBtn: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  filtroAtivo: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
  card: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 12, marginBottom: 15 },
  nome: { fontSize: 18, fontWeight: 'bold' },
  info: { fontSize: 14, color: '#666', marginVertical: 5 },
  botao: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, marginVertical: 5 },
  botaoDestaque: { backgroundColor: '#E91E63', padding: 15, borderRadius: 10, marginVertical: 5 },
  botaoChat: { backgroundColor: '#E91E63', padding: 10, borderRadius: 8, marginTop: 10 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  economia: { color: '#fff', textAlign: 'center', fontSize: 12, marginTop: 5 }
});
