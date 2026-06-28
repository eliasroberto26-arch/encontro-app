import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';

export default function Etapa5Preferencias({ route, navigation }) {
  const {
    metodo,
    valor,
    senha,
    verificado,
    nome,
    dataNascimento,
    idade,
    genero,
    cidade,
    fotos
  } = route.params;

  const [idadeMin, setIdadeMin] = useState(18);
  const [idadeMax, setIdadeMax] = useState(35);
  const [distancia, setDistancia] = useState(50);
  const [mostrarPara, setMostrarPara] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinuar = async () => {
    if (!mostrarPara) {
      Alert.alert('Erro', 'Selecione quem você quer conhecer');
      return;
    }

    if (idadeMin > idadeMax) {
      Alert.alert('Erro', 'Idade mínima não pode ser maior que a máxima');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Etapa6Termos', {
        metodo,
        valor,
        senha,
        verificado,
        nome,
        dataNascimento,
        idade,
        genero,
        cidade,
        fotos,
        preferencias: {
          idadeMin,
          idadeMax,
          distancia,
          mostrarPara
        }
      });
    }, 500);
  };

  const definirMostrarPara = () => {
    if (genero === 'Homem') return ['Mulheres', 'Homens', 'Todos'];
    if (genero === 'Mulher') return ['Homens', 'Mulheres', 'Todos'];
    return ['Homens', 'Mulheres', 'Todos'];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>MeetPerto 💕</Text>
        <Text style={styles.titulo}>Suas preferências</Text>
        <Text style={styles.subtitulo}>Quem você quer encontrar por perto?</Text>

        <Text style={styles.label}>Faixa de idade: {idadeMin} - {idadeMax} anos</Text>
        <Text style={styles.sublabel}>Idade mínima</Text>
        <Slider
          style={styles.slider}
          minimumValue={18}
          maximumValue={60}
          step={1}
          value={idadeMin}
          onValueChange={setIdadeMin}
          minimumTrackTintColor="#FF4B8B"
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor="#FF4B8B"
        />
        <Text style={styles.sublabel}>Idade máxima</Text>
        <Slider
          style={styles.slider}
          minimumValue={18}
          maximumValue={60}
          step={1}
          value={idadeMax}
          onValueChange={setIdadeMax}
          minimumTrackTintColor="#FF4B8B"
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor="#FF4B8B"
        />

        <Text style={styles.label}>Distância máxima: {distancia} km</Text>
        <Slider
          style={styles.slider}
          minimumValue={2}
          maximumValue={100}
          step={1}
          value={distancia}
          onValueChange={setDistancia}
          minimumTrackTintColor="#FF4B8B"
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor="#FF4B8B"
        />

        <Text style={styles.label}>Mostrar para</Text>
        <View style={styles.opcoesContainer}>
          {definirMostrarPara().map((opcao) => (
            <TouchableOpacity
              key={opcao}
              style={[styles.opcaoBtn, mostrarPara === opcao && styles.opcaoAtivo]}
              onPress={() => setMostrarPara(opcao)}
            >
              <Text style={[styles.opcaoTexto, mostrarPara === opcao && styles.opcaoTextoAtivo]}>
                {opcao}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.botao, (loading || !mostrarPara) && styles.botaoDesabilitado]}
          onPress={handleContinuar}
          disabled={loading || !mostrarPara}
        >
          <Text style={styles.botaoTexto}>
            {loading? 'Salvando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  voltar: {
    marginBottom: 20,
  },
  voltarTexto: {
    fontSize: 16,
    color: '#FF4B8B',
    fontWeight: '600',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF4B8B',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 24,
  },
  sublabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  opcoesContainer: {
    gap: 12,
  },
  opcaoBtn: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
  },
  opcaoAtivo: {
    borderColor: '#FF4B8B',
    backgroundColor: '#FFF0F5',
  },
  opcaoTexto: {
    fontSize: 16,
    color: '#666',
  },
  opcaoTextoAtivo: {
    color: '#FF4B8B',
    fontWeight: 'bold',
  },
  botao: {
    backgroundColor: '#FF4B8B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
