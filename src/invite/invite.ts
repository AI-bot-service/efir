// Ссылка-приглашение: собеседник открывает её (тап или скан QR системной
// камерой) → приложение подставляет сервер/код и просит только имя.
//
//   efir://join?d=<base64url(JSON)>
//
// JSON максимально короткий: { c: код, s: сервер, a: сервер доступа, r?: комната }

export const INVITE_SCHEME = 'efir';
export const INVITE_HOST = 'join';

export interface Invite {
  code: string;
  server: string;
  authUrl: string;
  room?: string;
}

interface Packed {
  c: string;
  s: string;
  a: string;
  r?: string;
}

// --- base64url для UTF-8 без зависимостей (Hermes без надёжного btoa) ---

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function utf8Bytes(str: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff) {
      // суррогатная пара
      const c2 = str.charCodeAt(++i);
      c = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      out.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      );
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return out;
}

function bytesToStr(bytes: number[]): string {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i++];
    if (b < 0x80) {
      out += String.fromCharCode(b);
    } else if (b < 0xe0) {
      out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
    } else if (b < 0xf0) {
      out += String.fromCharCode(
        ((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f),
      );
    } else {
      let cp =
        ((b & 0x07) << 18) |
        ((bytes[i++] & 0x3f) << 12) |
        ((bytes[i++] & 0x3f) << 6) |
        (bytes[i++] & 0x3f);
      cp -= 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    }
  }
  return out;
}

function b64urlEncode(str: string): string {
  const bytes = utf8Bytes(str);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : -1;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : -1;
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 >= 0 ? b1 >> 4 : 0)];
    if (b1 >= 0) out += B64[((b1 & 15) << 2) | (b2 >= 0 ? b2 >> 6 : 0)];
    if (b2 >= 0) out += B64[b2 & 63];
  }
  return out;
}

function b64urlDecode(str: string): string {
  const bytes: number[] = [];
  let buf = 0;
  let bits = 0;
  for (let i = 0; i < str.length; i++) {
    const v = B64.indexOf(str[i]);
    if (v < 0) continue;
    buf = (buf << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buf >> bits) & 0xff);
    }
  }
  return bytesToStr(bytes);
}

/** Кодирует приглашение в ссылку efir://join?d=… */
export function encodeInvite(inv: Invite): string {
  const packed: Packed = { c: inv.code.trim(), s: inv.server, a: inv.authUrl };
  if (inv.room) packed.r = inv.room;
  const d = b64urlEncode(JSON.stringify(packed));
  return `${INVITE_SCHEME}://${INVITE_HOST}?d=${d}`;
}

/** Разбирает ссылку приглашения; null — если это не наша корректная ссылка. */
export function decodeInvite(url: string): Invite | null {
  try {
    const m = url.match(/[?&]d=([^&]+)/);
    if (!m || !url.startsWith(`${INVITE_SCHEME}:`)) return null;
    const packed = JSON.parse(b64urlDecode(decodeURIComponent(m[1]))) as Packed;
    if (!packed.c || !packed.s || !packed.a) return null;
    return {
      code: String(packed.c),
      server: String(packed.s),
      authUrl: String(packed.a),
      room: packed.r ? String(packed.r) : undefined,
    };
  } catch {
    return null;
  }
}
