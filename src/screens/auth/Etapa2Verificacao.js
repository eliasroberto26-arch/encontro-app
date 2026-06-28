import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Etapa2Verificacao({ route, navigation }) {
  const { metodo, valor, senha } = route.params;
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [podeReenviar, setPodeReenviar] = useState(false);

  const inputs = useRef([]);

  useEffect(() => {
    enviarCodigo();

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          setPodeReenviar(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const enviarCodigo = async () => {
    Alert.alert(
      'Código enviado',
      `Enviamos um código de 6 dígitos para ${valor}`
    );
    console.log('CÓDIGO DE TESTE: 123456');
  };

  const handleReenviar = () => {
    setTimer(60);
    setPodeReenviar(false);
    setCodigo(['', '', '', '', '', '']);
    enviarCodigo();
  };

  const handleMudarNumero = (text, index) => {
    const novoCodigo = [...codigo];
    novoCodigo[index] = text;
    setCodigo(novoCodigo);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }

    if (novoCodigo.every(digito => digito!== '') && index === 5) {
      verificarCodigo(novoCodigo.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' &&!codigo[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const verificarCodigo = async (codigoCompleto) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (codigoCompleto === '123456') {
        Alert.alert('Sucesso!', 'Conta verificada');
        navigation.navigate('Etapa3Informacoes', {
          metodo,
          valor,
          senha,
          verificado: true
        });
      } else {
        Alert.alert('Código inválido', 'Tente novamente');
        setCodigo(['', '', '', '', '', '']);
        inputs.current[0].focus();
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios'? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltar}>
            <Text style={styles.voltarTexto}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>MeetPerto 💕</Text>
          <Text style={styles.titulo}>Verificação</Text>

          <Text style={styles.subtitulo}>
            Digite o código de 6 dígitos enviado para{'\n'}
            <Text style={styles.destaque}>{valor}</Text>
          </Text>

          <View style={styles.codigoContainer}>
            {codigo.map((digito, index) => (
              <TextInput
                key={index}
                ref={(ref) => inputs.current[index] = ref}
                style={styles.inputCodigo}
                value={digito}
                onChangeText={(text) => handleMudarNumero(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.botao, loading && styles.botaoDesabilitado]}
            onPress={() => verificarCodigo(codigo.join(''))}
            disabled={loading || codigo.some(d => d === '')}
          >
            <Text style={styles.botaoTexto}>
              {loading? 'Verificando...' : 'Verificar código'}
            </Text>
          </TouchableOpacity>

          <View style={styles.reenviarContainer}>
            {podeReenviar? (
              <TouchableOpacity onPress={handleReenviar}>
                <Text style={styles.reenviarTexto}>Reenviar código</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerTexto}>
                Reenviar código em {timer}s
              </Text>
            )}
          </View>

          <Text style={styles.dica}>
            Código de teste: 123456
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  voltar: {
    position: 'absolute',
    top: 60,
    left: 24,
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
    marginBottom: 12,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 20,
  },
  destaque: {
    fontWeight: 'bold',
    color: '#FF4B8B',
  },
  codigoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputCodigo: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
