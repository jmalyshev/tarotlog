import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder, TouchableOpacity } from 'react-native';
import ErrorBoundary from '../components/ErrorBoundary';
import Card from '../components/Card';
import CardLibrary from '../components/CardLibrary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_HEIGHT = 500;

export function SpreadBuilder({ initialCards = [], onChange, onDone }) {
  const [placedCards, setPlacedCards] = useState(initialCards);

  // keep internal state in sync if initialCards prop changes (e.g., when opening with saved cards)
  useEffect(() => {
    setPlacedCards(initialCards || []);
  }, [initialCards]);

  // Simple prototype: when a card is selected from library, push a placed card with center position
  function handleAddCard(card) {
    const newCard = {
      id: `${card.id}-${Date.now()}`,
      card,
      x: SCREEN_WIDTH / 2 - 60,
      y: CANVAS_HEIGHT / 2 - 80
    };
    setPlacedCards((s) => {
      const next = [...s, newCard];
      onChange?.(next);
      return next;
    });
  }

  function updateCardPos(id, x, y) {
    setPlacedCards((s) => {
      const next = s.map(c => c.id === id ? { ...c, x, y } : c);
      onChange?.(next);
      return next;
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        {placedCards.map((pc) => (
          <DraggableCard key={pc.id} data={pc} onMove={(x,y) => updateCardPos(pc.id,x,y)} />
        ))}
      </View>
      <CardLibrary onAddCard={handleAddCard} />
      {onDone && (
        <View style={styles.doneWrap}>
          <TouchableOpacity style={styles.doneBtn} onPress={() => onDone(placedCards)}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function SpreadBuilderScreen({ navigation, route }) {
  const initialCards = route?.params?.initialCards ?? [];
  // route.params.onDone may be a function passed from NoteEditor; create a wrapper to call it and goBack
  const tryCallAndGoBack = (cards) => {
    try {
      route?.params?.onDone?.(cards);
    } catch (e) {
      // fallthrough
    }
    navigation.goBack();
  };

  return (
    <ErrorBoundary>
      <SpreadBuilder initialCards={initialCards} onDone={tryCallAndGoBack} />
    </ErrorBoundary>
  );
}

function DraggableCard({ data, onMove }) {
  const pan = useRef(new Animated.ValueXY({ x: data.x, y: data.y })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        onMove(pan.x._value, pan.y._value);
      }
    })
  ).current;

  return (
    <Animated.View
      style={[styles.cardWrapper, { transform: pan.getTranslateTransform() }]}
      {...panResponder.panHandlers}
    >
      <Card title={data.card.name} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  canvas: { height: CANVAS_HEIGHT, backgroundColor: '#f6f6f8', borderColor: '#ddd', borderWidth: 1 },
  cardWrapper: { position: 'absolute', left: 0, top: 0 }
  ,
  doneWrap: { position: 'absolute', right: 12, bottom: 12 },
  doneBtn: { backgroundColor: '#007aff', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12, minWidth: 96, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  doneText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
