import * as Keychain from 'react-native-keychain';

/**
 * Защищённое хранилище инвайт-кода.
 * Код кладём в Keychain (Android Keystore / iOS Keychain), НЕ в AsyncStorage.
 * По коду приложение переполучает свежий JWT.
 */
const SERVICE = 'ru.systemtool.efir.invite';

export async function saveInviteCode(code: string): Promise<void> {
  await Keychain.setGenericPassword('efir', code, {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
  });
}

export async function getInviteCode(): Promise<string | null> {
  const res = await Keychain.getGenericPassword({ service: SERVICE });
  return res ? res.password : null;
}

export async function clearInviteCode(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}
