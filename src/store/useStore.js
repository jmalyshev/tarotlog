import create from 'zustand';
import { saveNotesEncrypted } from '../lib/localdb';

export const useStore = create((set, get) => ({
  entries: [],
  addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
  // Notes: each note contains { id, date, notes, cards: [...] , created_at }
  notes: [],
  addNote: (note) => {
    set((s) => ({ notes: [note, ...s.notes] }));
    // Always persist notes to SecureStore. saveNotesEncrypted currently writes
    // plaintext JSON into SecureStore and ignores the password, so persist
    // regardless of whether a password is set.
    saveNotesEncrypted(get().notes).catch(e => console.warn('save encrypted failed', e.message));
  },
  setNotes: (notes) => set(() => ({ notes })),
  updateNote: (id, patch) => {
    set((s) => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...patch } : n) }));
    saveNotesEncrypted(get().notes).catch(e => console.warn('save encrypted failed', e.message));
  },
  removeNote: (id) => {
    set((s) => ({ notes: s.notes.filter(n => n.id !== id) }));
    saveNotesEncrypted(get().notes).catch(e => console.warn('save encrypted failed', e.message));
  },
  // Auth/user
  user: null,
  setUser: (user) => set(() => ({ user })),
  // lastUnlockedPassword is stored in memory during session to allow saving encrypted notes
  lastUnlockedPassword: null,
  setLastUnlockedPassword: (p) => set(() => ({ lastUnlockedPassword: p })),
  // Temporary storage for cross-screen returns (used instead of passing functions in navigation params)
  pendingSpreads: {},
  setPendingSpread: (key, cards) => set((s) => ({ pendingSpreads: { ...s.pendingSpreads, [key]: cards } })),
  clearPendingSpread: (key) => set((s) => {
    const next = { ...s.pendingSpreads };
    delete next[key];
    return { pendingSpreads: next };
  }),
  // add more store actions as needed
}));
