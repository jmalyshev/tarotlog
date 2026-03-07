import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';

// Read-only preview of placed cards. Positions are absolute and not interactive.
export default function SpreadPreview({ cards = [] }) {
  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        {cards.map((pc) => (
          <View key={pc.id} style={[styles.cardWrapper, { left: pc.x, top: pc.y }]}> 
            <Card title={pc.card?.name ?? pc.name} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  canvas: { height: 300, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee', position: 'relative' },
  cardWrapper: { position: 'absolute' }
});
