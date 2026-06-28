import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, KeyboardAvoidingView, Platform, Image, SafeAreaView 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONFIG } from '../../../App';

export default function ChatMatch({ route, navigation }) {
  const { match } = route.params; // Vem do HomeFeed quando dá match
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: `Você deu match com ${match.name}! 🎉`, 
      sender: 'system', 
      time: 'Agora' 
    },
    { 
      id: '2', 
      text: `Oi! Curti seu perfil 😊`, 
      sender: 'them', 
      time: 'Agora' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: 'Agora'
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    
    // Simula resposta automática - depois troca por API real
    setTimeout(() => {
      const autoReply = {
        id: (Date.now() + 1).toString(),
        text: 'Haha que legal! Bora marcar algo? 😏',
        sender: 'them',
        time: 'Agora'
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1500);
  };

  const renderMessage = ({ item }) => {
    if (item.sender === 'system') {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      );
    }

    const isMe = item.sender === 'me';
    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
        {!isMe && (
          <Image source={{ uri: match.photo }} style={styles.avatar} />
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
            {item.text}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Image source={{ uri: match.photo }} style={styles.headerAvatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{match.name}</Text>
            <Text style={styles.headerStatus}>Online agora</Text>
          </View>
          <TouchableOpacity>
            <Icon name="dots-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Botão Marcar Encontro */}
        <TouchableOpacity style={styles.meetButton} onPress={() => alert('Abrir calendário pra marcar encontro')}>
          <Icon name="calendar-plus" size={20} color="#FFF" />
          <Text style={styles.meetButtonText}>Marcar Encontro</Text>
        </TouchableOpacity>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Icon name="send" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    flexDirection: 'row', alignItems: 'center', padding: 15, 
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' 
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 12 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: 'bold' },
  headerStatus: { fontSize: 12, color: '#4CAF50' },
  messagesContainer: { padding: 15, flexGrow: 1 },
  systemMessage: { alignItems: 'center', marginVertical: 10 },
  systemText: { color: '#888', fontSize: 13, fontStyle: 'italic' },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  myMessageRow: { justifyContent: 'flex-end' },
  theirMessageRow: { justifyContent: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 18 },
  myBubble: { backgroundColor: CONFIG.COR_PRINCIPAL, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  myText: { color: '#FFF' },
  theirText: { color: '#000' },
  timeText: { fontSize: 10, color: '#AAA', marginTop: 4, alignSelf: 'flex-end' },
  meetButton: { 
    flexDirection: 'row', backgroundColor: CONFIG.COR_SECUNDARIA, 
    marginHorizontal: 15, marginTop: 10, padding: 12, borderRadius: 25, 
    alignItems: 'center', justifyContent: 'center' 
  },
  meetButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  inputContainer: { 
    flexDirection: 'row', padding: 10, backgroundColor: '#FFF', 
    alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#EEE' 
  },
  input: { 
    flex: 1, backgroundColor: '#F0F0F0', borderRadius: 20, 
    paddingHorizontal: 15, paddingVertical: 10, maxHeight: 100, 
    marginRight: 10, fontSize: 15 
  },
  sendButton: { 
    backgroundColor: CONFIG.COR_PRINCIPAL, width: 44, height: 44, 
    borderRadius: 22, alignItems: 'center', justifyContent: 'center' 
  },
});
