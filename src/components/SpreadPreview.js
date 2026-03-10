import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';

// Read-only preview of placed cards. Positions are absolute and not interactive.
// Scales down to fit all cards on screen.
export default function SpreadPreview({ cards = [] }) {
  const CARD_WIDTH = 100;
  const CARD_HEIGHT = 140;
  const MAX_PREVIEW_HEIGHT = 450;
  const MAX_PREVIEW_WIDTH = 350;

  // Calculate the bounds needed to show all cards
  let maxX = 0, maxY = 0;
  cards.forEach((pc) => {
    if (pc.x + CARD_WIDTH > maxX) maxX = pc.x + CARD_WIDTH;
    if (pc.y + CARD_HEIGHT > maxY) maxY = pc.y + CARD_HEIGHT;
  });

  const spreadWidth = Math.max(maxX, 100) || 100;
  const spreadHeight = Math.max(maxY, 100) || 100;

  // Calculate scale to fit on screen
  const scaleX = MAX_PREVIEW_WIDTH / spreadWidth;
  const scaleY = MAX_PREVIEW_HEIGHT / spreadHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

  const scaledWidth = spreadWidth * scale;
  const scaledHeight = spreadHeight * scale;

  return (
    <View style={[styles.container, { width: scaledWidth, height: scaledHeight }]}>
      {cards.map((pc) => (
        <View key={pc.id} style={[styles.cardWrapper, { left: pc.x * scale, top: pc.y * scale, transform: [{ scale }], transformOrigin: '0 0' }]}> 
          <Card title={pc.card?.name ?? pc.name} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', backgroundColor: 'transparent', alignSelf: 'center' },
  cardWrapper: { position: 'absolute' }
});
