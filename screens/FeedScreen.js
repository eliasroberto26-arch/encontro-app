import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { likeUser, undoLike, checkCanLike } from '../services/likes';

export default function FeedScreen({ navigation }) {
  const [lastLikedUser, setLastLikedUser] = useState(null);
  const [userPlan, setUserPlan] = useState('gratis');
  const [likesLeft, setLikesLeft] = useState(10);

  const handleLike = async (userId) => {
    try {
      const { canLike, remaining } = await checkCanLike();
      
      if (!canLike) {
        navigation.navigate('Paywall', { feature: 'limite' });
        return;
      }
      
      setLastLikedUser(userId);
      await likeUser(userId);
      setLikesLeft(remaining - 1);
      
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  }

  const handleUndoLike = async () => {
    if (userPlan === 'gratis') {
      navigation.navigate('Paywall', { feature: 'desfazer' });
      return;
    }
    
    if (lastLikedUser) {
      await undoLike(lastLikedUser);
      setLastLikedUser(null);
      setLikesLeft(prev => prev + 1);
    }
  }

  return (
    <View style={styles.container}>
      {/* Contador de curtidas pro Grátis */}
      {userPlan === 'gratis' && (
        <View style={styles.likesCounter}>
          <Text style={{color: Colors.textLight}}>
            {likesLeft} curtidas restantes hoje
          </Text>
        </View>
      )}

      {/* Botões de ação */}
      <View style={styles.actions}>
        {userPlan!== 'gratis' && lastLikedUser && (
          <TouchableOpacity onPress={handleUndoLike} style={styles.undoButton}>
            <Ionicons name="arrow-undo" size={24} color={Colors.primary} />
            <Text style={{color: Colors.primary}}>Desfazer</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={() => handleLike(currentUser.id)} 
          style={[styles.likeButton, { backgroundColor: Colors.primary }]}
        >
          <Ionicons name="heart" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
