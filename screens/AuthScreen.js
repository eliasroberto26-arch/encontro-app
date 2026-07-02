import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from 'react-native'
import { Colors } from './theme/colors'
import { auth, db } from '../firebaseConfig'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Se já tiver logado, pula pra Feed
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('Feed')
      } else {
        setCheckingAuth(false)
      }
    })
    return unsubscribe
  }, [])

  const handleAuth = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    if (!trimmedEmail || !password || (!isLogin && !trimmedName)) {
      Alert.alert('Erro', 'Preencha todos os campos')
      return
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha precisa ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, trimmedEmail, password)
        navigation.replace('Feed')
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password)
        const user = userCredential.user

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: trimmedName,
          email: trimmedEmail,
          hairColor: '',
          gender: '',
          bio: '',
          photoURL: '',
          invisibleMode: false,
          subscription: 'free',
          fastResponses: 0,
          badges: [],
          createdAt: Date.now()
        })
        
        Alert.alert('Sucesso', 'Conta criada! Complete seu perfil.')
        navigation.replace('Perfil')
      }
    } catch (error) {
      let msg = 'Erro ao autenticar'
      switch (error.code) {
        case 'auth/email-already-in-use':
          msg = 'Esse email já está em uso'
          break
        case 'auth/weak-password':
          msg = 'Senha fraca. Use 6+ caracteres'
          break
        case 'auth/invalid-email':
          msg = 'Email inválido'
          break
        case 'auth/user-not-found':
          msg = 'Usuário não encontrado'
          break
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          msg = 'Email ou senha incorretos'
          break
        case 'auth/too-many-requests':
          msg = 'Muitas tentativas. Tente mais tarde'
          break
        default:
          msg = error.message
      }
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      Alert.alert('Erro', 'Digite seu email primeiro')
      return
    }
    
    try {
      await sendPasswordResetEmail(auth, trimmedEmail)
      Alert.alert('Enviado', 'Cheque seu email para redefinir a senha')
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o email. Verifique se está correto')
    }
  }

  if (checkingAuth) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.logo}>MeetPerto</Text>
      <Text style={styles.subtitle}>
        {isLogin ? 'Entre na sua conta' : 'Crie sua conta grátis'}
      </Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          placeholderTextColor={Colors.textLight}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.textLight}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha - mínimo 6 caracteres"
        placeholderTextColor={Colors.textLight}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      {isLogin && (
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
        <Text style={styles.toggleText}>
          {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background, 
    justifyContent: 'center', 
    padding: 24 
  },
  logo: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: Colors.primary, 
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: { 
    fontSize: 16, 
    color: Colors.textLight, 
    textAlign: 'center', 
    marginBottom: 32 
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16
  },
  forgotText: {
    color: Colors.primary,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    height: 52,
    justifyContent: 'center'
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled
  },
  buttonText: { 
    color: Colors.textInverse, 
    fontSize: 16, 
    fontWeight: '700' 
  },
  toggleText: { 
    color: Colors.primary, 
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600'
  }
})
