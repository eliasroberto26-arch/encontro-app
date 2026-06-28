import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function Etapa4Fotos({ route, navigation }) {
  const {
    metodo,
    valor,
    senha,
    verificado,
    nome,
    dataNascimento,
    idade,
    genero,
    cidade
  } = route.params;

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const solicitarPermissao = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status!== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para você adicionar fotos.'
      );
      return false;
    }
    return true;
  };

  const solicitarPermissaoCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status!== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua câmera para você tirar fotos.'
      );
      return false;
    }
    return true;
  };

  const escolherFoto = () => {
    if (fotos.length >= 6) {
      Alert.alert('Limite atingido', 'Você pode adicionar no máximo 6 fotos.');
      return;
    }

    Alert.alert(
      'Adicionar foto',
      'Como você quer adicionar sua foto?',
      [
        {
          text: 'Câmera',
          onPress: abrirCamera
        },
        {
          text: 'Galeria',
          onPress: abrirGaleria
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const abrirCamera = async () => {
    const permissao = await solicitarPermissaoCamera();
    if (!permissao) return;

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFotos([...fotos, resultado.assets[0].uri]);
    }
  };

  const abrirGaleria = async () => {
    const permissao = await solicitarPermissao();
    if (!permissao) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 6 - fotos.length,
    });

    if (!resultado.canceled) {
      const novasFotos = resultado.assets.map(asset => asset.uri);
      setFotos([...fotos,...novasFotos]);
    }
  };

  const removerFoto = (index) => {
    Alert.alert(
      'Remover foto',
      'Deseja remover esta foto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const novasFotos = fotos.filter((_, i) => i!== index);
            setFotos(novasFotos);
          }
        }
      ]
    );
  };

  const handleContinuar = () => {
    if (fotos.length < 2) {
      Alert.alert(
        'Fotos insuficientes',
        'Adicione pelo menos 2 fotos para continuar. Isso aumenta suas chances de dar match!'
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Etapa5Preferencias', {
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
      });
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>MeetPerto</Text>
        <Text style={styles.titulo}>Adicione suas fotos</Text>
        <Text style={styles.subtitulo}>
          Perfis com 2+ fotos recebem 3x mais matches
        </Text>

        <View style={styles.grid}>
          {fotos.map((foto, index) => (
            <View key={index} style={styles.fotoContainer}>
              <Image source={{ uri: foto }} style={styles.foto} />
              <TouchableOpacity
                style={styles.btnRemover}
                onPress={() => removerFoto(index)}
              >
                <Text style={styles.btnRemoverTexto}>✕</Text>
              </TouchableOpacity>
              {index === 0 && (
                <View style={styles.badgePrincipal}>
                  <Text style={styles.badgeTexto}>Principal</Text>
                </View>
              )}
            </View>
          ))}

          {fotos.length < 6 && (
            <TouchableOpacity
              style={styles.btnAdicionar}
              onPress={escolherFoto}
            >
              <Text style={styles.btnAdicionarIcone}>+</Text>
              <Text style={styles.btnAdicionarTexto}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTexto}>
            • Mínimo: 2 fotos{'\n'}
            • Máximo: 6 fotos{'\n'}
            • Primeira foto será a principal{'\n'}
            • Evite fotos com óculos escuros
          </Text>
        </View>

        <Text style={styles.contador}>
          {fotos.length}/6 fotos adicionadas
        </Text>

        <TouchableOpacity
          style={[
            styles.botao,
            (loading || fotos.length < 2) && styles.botaoDesabilitado
          ]}
          onPress={handleContinuar}
          disabled={loading || fotos.length < 2}
        >
          {loading? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>
              {fotos.length < 2? `Adicione mais ${2 - fotos.length}` : 'Continuar'}
            </Text>
          )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  fotoContainer: {
    width: '31%',
    aspectRatio: 3/4,
    position: 'relative',
  },
  foto: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  btnRemover: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4B8B',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  btnRemoverTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgePrincipal: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#FF4B8B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  btnAdicionar: {
    width: '31%',
    aspectRatio: 3/4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  btnAdicionarIcone: {
    fontSize: 40,
    color: '#FF4B8B',
    marginBottom: 4,
  },
  btnAdicionarTexto: {
    fontSize: 12,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#FFF0F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTexto: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  contador: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  botao: {
    backgroundColor: '#FF4B8B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
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
