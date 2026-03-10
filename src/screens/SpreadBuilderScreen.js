import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ImageBackground, ScrollView, Modal } from 'react-native';
import ErrorBoundary from '../components/ErrorBoundary';
import Card from '../components/Card';
import CardLibrary from '../components/CardLibrary';
import { SPREAD_TEMPLATES } from '../data/spread_templates';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_HEIGHT = 500;

export function SpreadBuilder({ initialCards = [], spreadData = null, onChange, onDone }) {
  const [placedCards, setPlacedCards] = useState(initialCards);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(spreadData?.templateName ? Object.values(SPREAD_TEMPLATES).find(t => t.name === spreadData.templateName) || null : null);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [cardLibraryOpen, setCardLibraryOpen] = useState(false);

  // keep internal state in sync if initialCards prop changes (e.g., when opening with saved cards)
  useEffect(() => {
    setPlacedCards(initialCards || []);
  }, [initialCards]);

  // Simple prototype: when a card is selected from library, push a placed card with center position
  function handleAddCard(card) {
    if (selectedPosition) {
      // If a template position is selected, place the card there
      const newCard = {
        id: selectedPosition.id,
        card,
        x: selectedPosition.x,
        y: selectedPosition.y,
        positionLabel: selectedPosition.label
      };
      setPlacedCards((s) => {
        const filtered = s.filter(c => c.id !== selectedPosition.id);
        const next = [...filtered, newCard];
        onChange?.(next);
        return next;
      });
      setSelectedPosition(null);
      setCardLibraryOpen(false);
    } else {
      // Otherwise place at center
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
  }

  function updateCardPos(id, x, y) {
    setPlacedCards((s) => {
      const next = s.map(c => c.id === id ? { ...c, x, y } : c);
      onChange?.(next);
      return next;
    });
  }

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 250);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/starry-background.png')}
        style={styles.backgroundContainer}
        resizeMode="cover"
        defaultSource={require('../assets/starry-background.png')}
        onError={() => {
          // If image fails to load, will use fallback backgroundColor
        }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Spread Builder</Text>
          <TouchableOpacity style={styles.templateBtn} onPress={() => setTemplateModalVisible(true)}>
            <Text style={styles.templateBtnText}>{selectedTemplate?.name || 'Choose Template'}</Text>
          </TouchableOpacity>
        </View>
        
        <CardLibrary onAddCard={handleAddCard} />
        
        <View
          style={styles.canvas}
          // Dismiss keyboard when user taps the canvas area (Android behavior)
          onStartShouldSetResponder={() => {
            if (keyboardHeight) Keyboard.dismiss();
            return false;
          }}
        >
          {/* Template position outlines */}
          {selectedTemplate && selectedTemplate.positions.map((pos) => {
            const hasCard = placedCards.find(c => c.id === pos.id);
            return (
              <TouchableOpacity
                key={pos.id}
                style={[
                  styles.positionOutline,
                  { left: pos.x, top: pos.y },
                  hasCard && styles.positionFilled,
                  selectedPosition?.id === pos.id && styles.positionSelected
                ]}
                onPress={() => {
                  if (!hasCard) {
                    setSelectedPosition(pos);
                    setCardLibraryOpen(true);
                  }
                }}
              >
                {!hasCard && <Text style={styles.positionLabel}>{pos.label}</Text>}
              </TouchableOpacity>
            );
          })}
          
          {/* Placed cards */}
          {placedCards.map((pc) => (
            <DraggableCard key={pc.id} data={pc} onMove={(x,y) => updateCardPos(pc.id,x,y)} />
          ))}
        </View>
        {onDone && (
          <View style={styles.doneWrap}>
            <TouchableOpacity style={styles.doneBtn} onPress={() => onDone(placedCards, selectedTemplate ? { templateName: selectedTemplate.name } : null)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Template Selection Modal */}
        <Modal
          visible={templateModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setTemplateModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose a Spread Template</Text>
              <ScrollView style={styles.templateList}>
                {Object.entries(SPREAD_TEMPLATES).map(([key, template]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.templateItem, selectedTemplate?.name === template.name && styles.templateItemSelected]}
                    onPress={() => {
                      setSelectedTemplate(template);
                      setTemplateModalVisible(false);
                      setPlacedCards([]); // Clear cards when changing template
                      setSelectedPosition(null);
                    }}
                  >
                    <Text style={styles.templateItemName}>{template.name}</Text>
                    <Text style={styles.templateItemDesc}>{template.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setTemplateModalVisible(false)}>
                <Text style={styles.modalCloseBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}

export default function SpreadBuilderScreen({ navigation, route }) {
  const initialCards = route?.params?.initialCards ?? [];
  const spreadData = route?.params?.spreadData ?? null;
  // route.params.onDone may be a function passed from NoteEditor; create a wrapper to call it and goBack
  const tryCallAndGoBack = (cards, newSpreadData) => {
    try {
      route?.params?.onDone?.(cards, newSpreadData);
    } catch (e) {
      // fallthrough
    }
    navigation.goBack();
  };

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
        <SpreadBuilder initialCards={initialCards} spreadData={spreadData} onDone={tryCallAndGoBack} />
      </KeyboardAvoidingView>
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
  container: { flex: 1, position: 'relative' },
  backgroundContainer: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  templateBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  templateBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  canvas: { flex: 1, backgroundColor: 'rgba(100,100,150,0.15)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1, position: 'relative' },
  cardWrapper: { position: 'absolute', left: 0, top: 0 },
  positionOutline: { position: 'absolute', width: 100, height: 140, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  positionFilled: { borderColor: 'rgba(100,200,100,0.6)', backgroundColor: 'rgba(100,200,100,0.1)' },
  positionSelected: { borderColor: 'rgba(255,200,0,0.8)', backgroundColor: 'rgba(255,200,0,0.15)', borderWidth: 3 },
  positionLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', textAlign: 'center', paddingHorizontal: 4 },
  doneWrap: { position: 'absolute', right: 16, bottom: 20 },
  doneBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, minWidth: 100, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  doneText: { color: '#333', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#2a2a3e', paddingHorizontal: 16, paddingTop: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },
  templateList: { marginBottom: 16 },
  templateItem: { paddingHorizontal: 12, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  templateItemSelected: { borderColor: 'rgba(255,200,0,0.8)', backgroundColor: 'rgba(255,200,0,0.15)', borderWidth: 2 },
  templateItemName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  templateItemDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  modalCloseBtn: { backgroundColor: '#ddd', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  modalCloseBtnText: { color: '#333', fontSize: 16, fontWeight: '700' }
});
