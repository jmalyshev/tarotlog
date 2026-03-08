import create from 'zustand';
import { saveNotesEncrypted } from '../lib/localdb';

export const useStore = create((set, get) => ({
  entries: [],
  addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
  // Notes: each note contains { id, date, notes, cards: [...] , created_at }
  notes: [],
  addNote: (note) => {
    set((s) => ({ notes: [note, ...s.notes] }));
    const pw = get().lastUnlockedPassword;
    if (pw) saveNotesEncrypted(get().notes, pw).catch(e => console.warn('save encrypted failed', e.message));
  },
  setNotes: (notes) => set(() => ({ notes })),
  updateNote: (id, patch) => {
    set((s) => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...patch } : n) }));
    const pw = get().lastUnlockedPassword;
    if (pw) saveNotesEncrypted(get().notes, pw).catch(e => console.warn('save encrypted failed', e.message));
  },
  removeNote: (id) => {
    set((s) => ({ notes: s.notes.filter(n => n.id !== id) }));
    const pw = get().lastUnlockedPassword;
    if (pw) saveNotesEncrypted(get().notes, pw).catch(e => console.warn('save encrypted failed', e.message));
  },
  // Auth/user
  user: null,
  setUser: (user) => set(() => ({ user })),
  // lastUnlockedPassword is stored in memory during session to allow saving encrypted notes
  lastUnlockedPassword: null,
  setLastUnlockedPassword: (p) => set(() => ({ lastUnlockedPassword: p })),
  // add more store actions as needed
}));
