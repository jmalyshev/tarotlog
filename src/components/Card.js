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
  card: { width: 120, height: 160, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  text: { fontSize: 14, textAlign: 'center' }
});
