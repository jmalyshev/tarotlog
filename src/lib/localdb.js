import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

const NOTES_KEY = 'tarot_notes_enc';
const PASS_HASH_KEY = 'tarot_pass_hash';

function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

function deriveKey(password) {
  // simple derivation via SHA256
  return CryptoJS.enc.Hex.parse(CryptoJS.SHA256(password).toString());
}

export async function hasPassword() {
  const v = await SecureStore.getItemAsync(PASS_HASH_KEY);
  return !!v;
}

export async function setPassword(password) {
  const h = hashPassword(password);
  await SecureStore.setItemAsync(PASS_HASH_KEY, h);
}

export async function verifyPassword(password) {
  const stored = await SecureStore.getItemAsync(PASS_HASH_KEY);
  if (!stored) return false;
  return stored === hashPassword(password);
}

export async function saveNotesEncrypted(notes, password) {
  // Store notes JSON in SecureStore. SecureStore is protected by the OS and
  // available in Expo Go. Previously we attempted to use AES encryption via
  // CryptoJS which can attempt to use a native crypto random module in some
  // environments and failed; storing JSON in SecureStore keeps data secure
  // without relying on native crypto functionality.
  const payload = JSON.stringify(notes || []);
  await SecureStore.setItemAsync(NOTES_KEY, payload);
}

export async function loadNotesEncrypted(password) {
  const payload = await SecureStore.getItemAsync(NOTES_KEY);
  if (!payload) return [];
  try {
    return JSON.parse(payload);
  } catch (e) {
    // corrupted payload
    throw new Error('Failed to parse stored notes');
  }
}

export async function clearNotes() {
  await SecureStore.deleteItemAsync(NOTES_KEY);
}

export async function clearPassword() {
  await SecureStore.deleteItemAsync(PASS_HASH_KEY);
}
