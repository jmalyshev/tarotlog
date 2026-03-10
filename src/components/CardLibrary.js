import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Keyboard, Platform, Modal, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import TAROT_DECK from '../data/tarot_deck.json';

export default function CardLibrary({ onAddCard }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const term = (q || '').trim().toLowerCase();
    if (!term) return [];
    return TAROT_DECK.filter(c => c.name.toLowerCase().includes(term));
  }, [q]);

  const modalVisible = open; // open modal when input is focused; q still filters results
  const inputRef = useRef(null);

  useEffect(() => {
    if (modalVisible && inputRef.current) {
      // small delay helps on Android to ensure modal is visible before focusing
      const t = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus?.();
          // Explicitly open the keyboard on Android after focus
          if (Platform.OS === 'android') {
            Keyboard.isVisible?.() || Keyboard.open?.();
          }
        }
      }, 100);
      return () => clearTimeout(t);
    }
  }, [modalVisible]);

  return (
    <View style={styles.library}>
      {!modalVisible && (
        <TextInput placeholder="Search cards..." value={q} onChangeText={setQ} style={styles.search} autoFocus={false} onFocus={() => setOpen(true)} />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => { setOpen(false); setQ(''); }}>
        <View style={styles.modalBackdrop} pointerEvents="box-none">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} style={styles.modalContainer} pointerEvents="box-none">
            <SafeAreaView pointerEvents="box-none">
              <View style={styles.modalInner} pointerEvents="auto">
                <TextInput
                  placeholder="Search cards..."
                  value={q}
                  onChangeText={setQ}
                  style={styles.search}
                  ref={inputRef}
                  autoFocus={false}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />

                <ScrollView
                  keyboardShouldPersistTaps="always"
                  contentContainerStyle={{ paddingVertical: 8 }}
                  style={styles.resultsOverlay}
                  scrollEnabled={results.length > 8}
                >
                  {results.length === 0 ? (
                    <Text style={styles.empty}>No cards match "{q}"</Text>
                  ) : (
                    results.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.resultItem}
                        activeOpacity={0.6}
                        onPress={() => {
                          setQ('');
                          setOpen(false);
                          if (typeof onAddCard === 'function') {
                            onAddCard(item);
                          }
                        }}
                      >
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  library: { padding: 12, borderTopWidth: 1, borderColor: '#eee' },
  title: { fontWeight: '600', marginBottom: 8 },
  search: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6 },
  results: { maxHeight: 200, marginTop: 8 },
  resultItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' }
  ,
  empty: { color: '#666', padding: 10 }
  ,
  overlay: {
    position: 'absolute',
    top: 8,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 8,
    zIndex: 1000,
    padding: 8,
    maxHeight: 360,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  },
  resultsOverlay: { maxHeight: 300, marginTop: 8 }
  ,
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-start' },
  modalContainer: { width: '100%' },
  // Anchor modalInner absolutely near the top so it's not pushed to the bottom by
  // keyboard or parent layout differences on Android devices.
  modalInner: { position: 'absolute', top: Platform.OS === 'android' ? 12 : 42, left: 12, right: 12, backgroundColor: '#fff', borderRadius: 8, padding: 8, elevation: 10 }
});
