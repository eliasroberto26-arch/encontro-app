import React, { useState, useEffect } from 'react'
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Colors, Gradients } from './theme/colors'
import { auth, db } from '../firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

export default function SettingsScreen({ navigation }) {
  const [invisibleMode, setInvisibleMode] = useState(false)
  const [isVip, setIsVip] = useState(false)
  const [loading, setLoading] = useState(true)
  const user = auth.currentUser

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const data = userSnap.data()
      setInvisibleMode(data.invisibleMode || false)
      setIsVip(data.subscription === 'vip')
    }
    setLoading(false)
  }

  const toggleInvisibleMode = async () => {
    if (!isVip) {
      Alert.alert(
        'Recurso VIP', 
        'O Modo Invisível é exclusivo para assinantes VIP. Quer ver os planos?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver planos', onPress: () => navigation.navigate('Planos') }
        ]
      )
      return
    }

    const newValue = !invisibleMode
    setInvisibleMode(newValue)
    
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, { invisibleMode: newValue })
  }

  const SettingItem = ({ icon, title, value, onToggle, locked }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onToggle}
      disabled={loading}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={locked ? Colors.disabled : Colors.text} />
        <Text style={[styles.settingText, locked && styles.lockedText]}>{title}</Text>
        {locked && <Ionicons name="lock-closed" size={16} color={Colors.vip} />}
      </View>
      
