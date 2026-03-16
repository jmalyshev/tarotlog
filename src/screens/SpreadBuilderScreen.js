import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ImageBackground, ScrollView, Modal } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import ErrorBoundary from '../components/ErrorBoundary';
import { useStore } from '../store/useStore';
import CardLibrary from '../components/CardLibrary';
import DraggableCardRH from '../components/DraggableCardRH';
import { SPREAD_TEMPLATES } from '../data/spread_templates';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_HEIGHT = 500;

export function SpreadBuilder({ initialCards = [], onChange, onDone }) {
  const [placedCards, setPlacedCards] = useState(initialCards);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [cardLibraryOpen, setCardLibraryOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: SCREEN_WIDTH, height: CANVAS_HEIGHT });

  useEffect(() => {
    setPlacedCards(initialCards || []);
  }, [initialCards]);

  function scalePos(pos, { width, height }) {
    if (!pos) return { x: 0, y: 0 };
    if (pos.xPct != null && pos.yPct != null) {
      const x = Math.round(pos.xPct * width);
      const y = Math.round(pos.yPct * height);
      return { x, y };
    }
    const BASE_W = 360;
    const BASE_H = 500;
    const x = Math.round((pos.x / BASE_W) * width);
    const y = Math.round((pos.y / BASE_H) * height);
    return { x, y };
  }

  // compute card size dynamically from canvas size to avoid overlaps on different screens
  const cardWidth = Math.round(Math.max(48, Math.min(120, canvasSize.width * 0.25)));
  const cardHeight = Math.round(cardWidth * 1.4);

  // compute template positions scaled to the current canvas and card size
  // returns { positions: [...], effectiveCardWidth, effectiveCardHeight }
  function computeTemplatePositionsScaled(template) {
    if (!template || !template.positions) return { positions: [], effectiveCardWidth: cardWidth, effectiveCardHeight: cardHeight };
    const { width, height } = canvasSize;
    const positions = template.positions;
    const baseGap = Math.round(cardWidth * 0.25);

    // helper to compute a scale factor so content fits within padding
    function calcScale(totalSize, containerSize, padding = 32) {
      if (totalSize <= containerSize - padding) return 1;
      return Math.max(0.5, (containerSize - padding) / totalSize);
    }

    // ROW layout
    if (template.layout === 'row') {
      const n = positions.length;
      const totalW = n * cardWidth + Math.max(0, n - 1) * baseGap;
      const scale = calcScale(totalW, width);
      const effW = Math.max(32, Math.round(cardWidth * scale));
      const effH = Math.round(effW * 1.4);
      const gap = Math.round(effW * 0.25);
      const totalW2 = n * effW + Math.max(0, n - 1) * gap;
      const startX = Math.round((width - totalW2) / 2);
      const y = template.yPct != null ? Math.round(template.yPct * height) : Math.round(height * 0.35);
      return {
        positions: positions.map((p, i) => ({ ...p, x: startX + i * (effW + gap), y })),
        effectiveCardWidth: effW,
        effectiveCardHeight: effH
      };
    }

    // PILLAR layout
    if (template.layout === 'pillar') {
      const n = positions.length;
      const totalH = n * cardHeight + Math.max(0, n - 1) * baseGap;
      const scale = calcScale(totalH, height);
      const effH = Math.max(32, Math.round(cardHeight * scale));
      const effW = Math.round(effH / 1.4);
      const gap = Math.round(effH * 0.25);
      const totalH2 = n * effH + Math.max(0, n - 1) * gap;
      const startY = Math.round((height - totalH2) / 2);
      const x = template.xPct != null ? Math.round(template.xPct * width) : Math.round(width * 0.5);
      return {
        positions: positions.map((p, i) => ({ ...p, x, y: startY + i * (effH + gap) })),
        effectiveCardWidth: effW,
        effectiveCardHeight: effH
      };
    }

    // CROSS + PILLAR layout
    if (template.layout === 'cross_pillar') {
      // center the entire cluster+pillar block horizontally so it won't be cut off
      const centerPct = template.centerPct || { x: 0.5, y: 0.5 };
      const centerY = Math.round(centerPct.y * height);
      // estimate central cluster size (3 across) and pillar
      const clusterW = 3 * cardWidth + 2 * baseGap;
      const pillarLen = Math.max(0, template.positions.length - 5);
      const pillarWidth = pillarLen > 0 ? (cardWidth) : 0;
      const totalW = clusterW + (pillarLen > 0 ? (baseGap + pillarWidth) : 0);
      const totalH = Math.max(cardHeight * 3 + baseGap * 2, pillarLen * cardHeight + Math.max(0, pillarLen - 1) * baseGap);
      const scale = Math.min(calcScale(totalW, width), calcScale(totalH, height));
      const effW = Math.max(32, Math.round(cardWidth * scale));
      const effH = Math.round(effW * 1.4);
      const gap = Math.round(effW * 0.25);

      const clusterWidth = 3 * effW + 2 * gap;
      const pillarExists = pillarLen > 0;
      const extraForPillar = pillarExists ? (gap + effW) : 0;
      const blockTotalW = clusterWidth + extraForPillar;
      const startX = Math.round((width - blockTotalW) / 2);
      const leftX = startX;
      const centerX = leftX + (effW + gap);
      const rightX = leftX + 2 * (effW + gap);

      const out = [];
      // mapping: positions[0]=center, [1]=right, [2]=left, [3]=top, [4]=bottom
      for (let i = 0; i < Math.min(5, positions.length); i++) {
        const p = positions[i];
        let x = centerX;
        let y = centerY;
        if (i === 0) { x = centerX; y = centerY; }
        else if (i === 1) { x = rightX; y = centerY; }
        else if (i === 2) { x = leftX; y = centerY; }
        else if (i === 3) { x = centerX; y = centerY - (effH + gap); }
        else if (i === 4) { x = centerX; y = centerY + (effH + gap); }
        out.push({ ...p, x, y });
      }
      // pillar stacked to the right of the cluster
      const pillar = positions.slice(5);
      if (pillar.length > 0) {
        const pillarX = leftX + clusterWidth + gap;
        const totalH2 = pillar.length * effH + Math.max(0, pillar.length - 1) * gap;
        const startY = Math.round(centerY - totalH2 / 2 + effH / 2);
        pillar.forEach((p, i) => out.push({ ...p, x: pillarX, y: startY + i * (effH + gap) }));
      }
      return { positions: out, effectiveCardWidth: effW, effectiveCardHeight: effH };
    }

    // HORSESHOE layout (arc)
    if (template.layout === 'horseshoe') {
      const centerPct = template.centerPct || { x: 0.5, y: 0.35 };
      const cx = centerPct.x * width;
      const cy = centerPct.y * height;
      const n = positions.length;
      const padding = 24;
      // initial guess for radius based on available space
      const maxRadiusX = Math.min(cx - padding - cardWidth / 2, width - cx - padding - cardWidth / 2);
      const maxRadiusY = Math.max(20, cy - padding - cardHeight / 2);
      let radius = Math.min(width * 0.42, height * 0.35, maxRadiusX, maxRadiusY);
      if (radius < 20) radius = Math.max(12, Math.floor(Math.min(width, height) / 10));
      const startAngle = Math.PI * 0.85; // left-up
      const endAngle = Math.PI * 0.15; // right-up

      // helper to build positions given effW/effH and radius
      const buildPositions = (effW, effH, r) => {
        return positions.map((p, i) => {
          const t = n === 1 ? 0.5 : i / Math.max(1, n - 1);
          const angle = startAngle + t * (endAngle - startAngle);
          const cardCenterX = Math.round(cx + Math.cos(angle) * r);
          const cardCenterY = Math.round(cy + Math.sin(angle) * r);
          return { ...p, x: cardCenterX - Math.round(effW / 2), y: cardCenterY - Math.round(effH / 2) };
        });
      };

      // determine bounding span and scale if needed
      let effW = cardWidth;
      let effH = cardHeight;
      let posCandidates = buildPositions(effW, effH, radius);
      let minX = Math.min(...posCandidates.map(p => p.x));
      let maxX = Math.max(...posCandidates.map(p => p.x + effW));
      let span = maxX - minX;
      const availW = width - padding * 2;
      if (span > availW) {
        const scale = Math.max(0.5, availW / span);
        effW = Math.max(24, Math.round(effW * scale));
        effH = Math.max(24, Math.round(effW * 1.4));
        // shrink radius slightly to keep arc balanced
        radius = Math.max(8, Math.round(radius * scale));
        posCandidates = buildPositions(effW, effH, radius);
      }

      // final positions
      return { positions: posCandidates, effectiveCardWidth: effW, effectiveCardHeight: effH };
    }

    // fallback: respect explicit xPct/yPct or legacy x/y
    return { positions: positions.map(p => ({ ...p, ...scalePos(p, canvasSize) })), effectiveCardWidth: cardWidth, effectiveCardHeight: cardHeight };
  }

  const templateComputed = selectedTemplate ? computeTemplatePositionsScaled(selectedTemplate) : { positions: [], effectiveCardWidth: cardWidth, effectiveCardHeight: cardHeight };
  const templatePositionsScaled = templateComputed.positions;
  const effectiveCardWidth = templateComputed.effectiveCardWidth;
  const effectiveCardHeight = templateComputed.effectiveCardHeight;

  function handleAddCard(card) {
    if (selectedPosition) {
      // if we stored scaledX/scaledY when selecting the template, prefer them
      const xPos = selectedPosition.scaledX != null ? selectedPosition.scaledX : scalePos(selectedPosition, canvasSize).x;
      const yPos = selectedPosition.scaledY != null ? selectedPosition.scaledY : scalePos(selectedPosition, canvasSize).y;
      const newCard = {
        id: selectedPosition.id,
        card,
        x: xPos,
        y: yPos,
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
      const newCard = {
        id: `${card.id}-${Date.now()}`,
        card,
        x: Math.round(canvasSize.width / 2 - 50),
        y: Math.round(canvasSize.height / 2 - 70)
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

  function snapToSlot(x, y, positions, threshold = 48) {
    if (!positions || positions.length === 0) return null;
    let closest = null;
    let minDist = Infinity;
    positions.forEach(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    });
    return minDist <= threshold ? closest : null;
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
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setCanvasSize({ width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) });
          }}
          onStartShouldSetResponder={() => {
            if (keyboardHeight) Keyboard.dismiss();
            return false;
          }}
        >
          {selectedTemplate && templatePositionsScaled.map((pos) => {
            const scaledX = pos.x;
            const scaledY = pos.y;
            const hasCard = placedCards.find(c => c.id === pos.id);
            return (
              <TouchableOpacity
                key={pos.id}
                style={[
                  styles.positionOutline,
                  { left: scaledX, top: scaledY, width: effectiveCardWidth, height: effectiveCardHeight },
                  hasCard && styles.positionFilled,
                  selectedPosition?.id === pos.id && styles.positionSelected
                ]}
                onPress={() => {
                  if (!hasCard) {
                    // store the scaled coordinates on the selectedPosition so
                    // the card will be placed exactly where the outline is
                    setSelectedPosition({ ...pos, scaledX, scaledY });
                    setCardLibraryOpen(true);
                  }
                }}
              >
                {!hasCard && <Text style={styles.positionLabel}>{pos.label}</Text>}
              </TouchableOpacity>
            );
          })}

          {placedCards.map((pc) => (
            <DraggableCardRH
              key={pc.id}
              data={pc}
              cardWidth={effectiveCardWidth}
              cardHeight={effectiveCardHeight}
              onDrop={(id, x, y) => {
                const slot = snapToSlot(x, y, templatePositionsScaled, Math.max(24, Math.round(effectiveCardWidth / 2)));
                if (slot) {
                  updateCardPos(id, slot.x, slot.y);
                } else {
                  updateCardPos(id, x, y);
                }
              }}
            />
          ))}
        </View>

        {onDone && (
          <View style={styles.doneWrap}>
            <TouchableOpacity style={styles.doneBtn} onPress={() => onDone(placedCards)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

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
                      setPlacedCards([]);
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
  const tryCallAndGoBack = (cards) => {
    try {
      const prevKey = route?.params?.prevKey;
      const returnKey = route?.params?.returnKey;
      if (prevKey) {
        // set params on the previous route (NoteEditor) so it can pick up updated cards
        navigation.dispatch(CommonActions.setParams({ params: { updatedCards: cards }, key: prevKey }));
      } else if (returnKey) {
        // write returned cards to the store for the NoteEditor to pick up
        try { useStore.getState().setPendingSpread(returnKey, cards); } catch (e) { /* ignore */ }
      } else if (route?.params?.onDone) {
        // fallback for older callers that passed a function (not recommended)
        try { route.params.onDone(cards); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // ignore
    }
    navigation.goBack();
  };

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
        <SpreadBuilder initialCards={initialCards} onDone={tryCallAndGoBack} />
      </KeyboardAvoidingView>
    </ErrorBoundary>
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