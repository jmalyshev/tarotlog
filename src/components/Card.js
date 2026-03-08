import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Card({ title }) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // slightly smaller card size for better fit on canvas
  card: { width: 100, height: 140, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  text: { fontSize: 13, textAlign: 'center' }
});
