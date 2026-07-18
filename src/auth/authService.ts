import { saveInviteCode, getInviteCode, clearInviteCode } from './secureStore';

/**
 * Обмен инвайт-кода на JWT для входа в Jitsi.
 * Секрет подписи живёт ТОЛЬКО на бэкенде — приложение знает лишь код.
 */

export interface TokenResult {
  token: string;
  exp: number; // unix seconds
}

export class AuthError extends Error {
  code: 'invalid_code' | 'rate_limited' | 'network' | 'server';
  constructor(code: AuthError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

// Токен держим в памяти процесса; код — в Keychain.
let cached: TokenResult | null = null;

function normalizeBase(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

async function requestToken(authUrl: string, code: string, name: string): Promise<TokenResult> {
  let resp: Response;
  try {
    resp = await fetch(`${normalizeBase(authUrl)}/api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name }),
    });
  } catch {
    throw new AuthError('network', 'Нет связи с сервером доступа');
  }

  if (resp.status === 401 || resp.status === 403) {
    throw new AuthError('invalid_code', 'Код недействителен или отозван');
  }
  if (resp.status === 429) {
    throw new AuthError('rate_limited', 'Слишком много попыток, подождите');
  }
  if (!resp.ok) {
    throw new AuthError('server', `Ошибка сервера (${resp.status})`);
  }

  const data = (await resp.json()) as { token?: string; exp?: number };
  if (!data.token || !data.exp) {
    throw new AuthError('server', 'Некорректный ответ сервера');
  }
  return { token: data.token, exp: data.exp };
}

/** Первичная привязка: проверяем код, сохраняем его, кэшируем токен. */
export async function activateWithCode(authUrl: string, code: string, name: string): Promise<void> {
  const result = await requestToken(authUrl, code.trim(), name.trim());
  cached = result;
  await saveInviteCode(code.trim());
}

/** Свежий токен перед входом в звонок; при протухании — переполучаем по коду. */
export async function getValidToken(authUrl: string, name: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - now > 60) {
    return cached.token;
  }
  const code = await getInviteCode();
  if (!code) throw new AuthError('invalid_code', 'Доступ не активирован');
  cached = await requestToken(authUrl, code, name);
  return cached.token;
}

export async function resetAccess(): Promise<void> {
  cached = null;
  await clearInviteCode();
}

export async function hasAccess(): Promise<boolean> {
  return (await getInviteCode()) !== null;
}
