import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QualityProfile } from '../jitsi/config';
import { EMBEDDED_SERVER, EMBEDDED_AUTH_URL, EMBEDDED_ROOM } from '../config/server';
import type { Invite } from '../invite/invite';

// Реальный домен НЕ в публичном коде: значения берутся из src/config/server.ts
// (в .gitignore). Их же может переопределить ссылка-приглашение при активации.
export const DEFAULT_SERVER = normalizeServer(EMBEDDED_SERVER);
export const DEFAULT_AUTH_URL = normalizeServer(EMBEDDED_AUTH_URL);

/** Постоянная комната группы (пусто — закреплённой комнаты нет). */
export const DEFAULT_ROOM = sanitizeRoom(EMBEDDED_ROOM);

export type Route = 'onboarding' | 'home' | 'settings' | 'meeting' | 'invite';

export interface RecentRoom {
  name: string;
  ts: number;
}

interface AppState {
  // сохраняемое
  onboarded: boolean;
  serverUrl: string;
  authUrl: string;
  displayName: string;
  profile: QualityProfile;
  startWithVideoMuted: boolean;
  startWithAudioMuted: boolean;
  recentRooms: RecentRoom[];

  // транзиентное
  route: Route;
  activeRoom: string | null;
  hydrated: boolean;
  pendingCode: string | null; // код из ссылки-приглашения (префилл онбординга)
  pendingRoom: string | null; // комната из ссылки — войти после активации

  // действия
  setServerUrl: (v: string) => void;
  setAuthUrl: (v: string) => void;
  setDisplayName: (v: string) => void;
  setProfile: (v: QualityProfile) => void;
  setStartWithVideoMuted: (v: boolean) => void;
  setStartWithAudioMuted: (v: boolean) => void;
  completeOnboarding: () => void;
  resetAccess: () => void;
  navigate: (r: Route) => void;
  joinRoom: (name: string) => void;
  leaveMeeting: () => void;
  removeRecent: (name: string) => void;
  applyInvite: (inv: Invite) => void;
  clearPending: () => void;
}

const MAX_RECENT = 8;
const PERSIST_KEY = 'efir-store-v1';

export const useAppStore = create<AppState>()((set, get) => ({
  onboarded: false,
  serverUrl: DEFAULT_SERVER,
  authUrl: DEFAULT_AUTH_URL,
  displayName: '',
  profile: 'balanced',
  startWithVideoMuted: false,
  startWithAudioMuted: false,
  recentRooms: [],

  route: 'onboarding',
  activeRoom: null,
  hydrated: false,
  pendingCode: null,
  pendingRoom: null,

  setServerUrl: (v) => set({ serverUrl: normalizeServer(v) }),
  setAuthUrl: (v) => set({ authUrl: normalizeServer(v) }),
  setDisplayName: (v) => set({ displayName: v }),
  setProfile: (v) => set({ profile: v }),
  setStartWithVideoMuted: (v) => set({ startWithVideoMuted: v }),
  setStartWithAudioMuted: (v) => set({ startWithAudioMuted: v }),

  completeOnboarding: () => set({ onboarded: true, route: 'home' }),
  resetAccess: () =>
    set({ onboarded: false, route: 'onboarding', recentRooms: [], activeRoom: null }),
  navigate: (r) => set({ route: r }),

  joinRoom: (name) => {
    const room = sanitizeRoom(name);
    if (!room) return;
    const now = Date.now();
    const rest = get().recentRooms.filter((r) => r.name !== room);
    set({
      activeRoom: room,
      route: 'meeting',
      recentRooms: [{ name: room, ts: now }, ...rest].slice(0, MAX_RECENT),
    });
  },

  leaveMeeting: () => set({ activeRoom: null, route: 'home' }),
  removeRecent: (name) =>
    set({ recentRooms: get().recentRooms.filter((r) => r.name !== name) }),

  // Приглашение из ссылки/QR: подставляем адреса сервера; код и комнату
  // держим транзиентно. Новый гость → онбординг с префиллом. Уже активирован
  // на том же сервере → сразу в комнату.
  applyInvite: (inv) => {
    const server = normalizeServer(inv.server);
    const authUrl = normalizeServer(inv.authUrl);
    const room = inv.room ? sanitizeRoom(inv.room) : null;
    const s = get();
    // Уже активирован на этом сервере — не разлогиниваем, лишь ведём в комнату.
    if (s.onboarded && server === s.serverUrl) {
      set({ authUrl });
      if (room) get().joinRoom(room);
      else set({ route: 'home' });
      return;
    }
    // Новый гость (или другой сервер) — префилл онбординга кодом из ссылки.
    set({
      serverUrl: server,
      authUrl,
      pendingCode: inv.code.trim() || null,
      pendingRoom: room,
      onboarded: false,
      route: 'onboarding',
    });
  },
  clearPending: () => set({ pendingCode: null, pendingRoom: null }),
}));

// --- Явное сохранение в AsyncStorage (без zustand/persist — надёжнее с RN) ---

interface PersistedShape {
  onboarded: boolean;
  serverUrl: string;
  authUrl: string;
  displayName: string;
  profile: QualityProfile;
  startWithVideoMuted: boolean;
  startWithAudioMuted: boolean;
  recentRooms: RecentRoom[];
}

function pickPersisted(s: AppState): PersistedShape {
  return {
    onboarded: s.onboarded,
    serverUrl: s.serverUrl,
    authUrl: s.authUrl,
    displayName: s.displayName,
    profile: s.profile,
    startWithVideoMuted: s.startWithVideoMuted,
    startWithAudioMuted: s.startWithAudioMuted,
    recentRooms: s.recentRooms,
  };
}

// Загрузка при старте: восстанавливаем и открываем нужный экран.
(async () => {
  try {
    const raw = await AsyncStorage.getItem(PERSIST_KEY);
    if (raw) {
      const data = JSON.parse(raw) as Partial<PersistedShape>;
      useAppStore.setState(data);
    }
  } catch {
    // повреждённое хранилище — стартуем с дефолтов
  } finally {
    const onboarded = useAppStore.getState().onboarded;
    useAppStore.setState({ hydrated: true, route: onboarded ? 'home' : 'onboarding' });
  }
})();

// Сохранение при каждом изменении сохраняемых полей.
let lastSerialized = '';
useAppStore.subscribe((state) => {
  if (!state.hydrated) return; // не перезаписываем до окончания загрузки
  const serialized = JSON.stringify(pickPersisted(state));
  if (serialized === lastSerialized) return;
  lastSerialized = serialized;
  AsyncStorage.setItem(PERSIST_KEY, serialized).catch(() => {});
});

export function normalizeServer(v: string): string {
  let s = v.trim().replace(/\/+$/, '');
  if (!s) return DEFAULT_SERVER;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  return s;
}

/** Имя комнаты: без пробелов и небезопасных символов (Jitsi трактует их в URL). */
export function sanitizeRoom(v: string): string {
  return v
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '')
    .slice(0, 64);
}

/** Случайный «позывной» комнаты — легко продиктовать голосом. */
export function generateRoomName(): string {
  const a = ['tihiy', 'yarkiy', 'bystriy', 'smeliy', 'zvonkiy', 'volniy', 'chetkiy', 'zhiviy'];
  const b = ['efir', 'signal', 'volna', 'kanal', 'punkt', 'krug', 'sbor', 'kontur'];
  const n = Math.floor(100 + Math.random() * 900);
  return `${pick(a)}-${pick(b)}-${n}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
