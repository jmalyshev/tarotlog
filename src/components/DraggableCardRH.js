import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Card from './Card';

export default function DraggableCardRH({ data, onDrop, cardWidth = 100, cardHeight = 140 }) {
  const x = useSharedValue(data.x || 0);
  const y = useSharedValue(data.y || 0);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    // if parent updates position (e.g., reset to template) keep shared values in sync
    x.value = data.x || 0;
    y.value = data.y || 0;
  }, [data.x, data.y]);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((event) => {
      x.value = startX.value + event.translationX;
      y.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      // round to integers before reporting; call JS callback via runOnJS
      if (typeof onDrop === 'function') {
        runOnJS(onDrop)(data.id, Math.round(x.value), Math.round(y.value));
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value }
    ],
    width: cardWidth,
    height: cardHeight
  }));

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[styles.card, style]}>
        <Card title={data.card.name} width={cardWidth} height={cardHeight} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute'
  }
});
