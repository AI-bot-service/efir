# Efir (Эфир) — сборка Android APK на Windows 10

Мобильный клиент видеоконференций на движке **Jitsi**. Стек: React Native 0.79.7,
`@jitsi/react-native-sdk` 12.1.5, TypeScript. Доступ к серверу — по **инвайт-коду**
(JWT), сервер вводится при первом запуске.

---

## 1. Что установить (ссылки)

| Компонент | Версия | Ссылка |
|---|---|---|
| **Node.js LTS** | 20.x | https://nodejs.org/en/download |
| **JDK 17** (Temurin) | 17.x | https://adoptium.net/temurin/releases/?version=17 |
| **Android Studio** | последняя | https://developer.android.com/studio |
| **Git** (опц.) | любая | https://git-scm.com/download/win |

> JDK строго **17** (не 21/23). RN 0.79 и Jitsi собираются под Java 17.

### Компоненты Android SDK (Android Studio → SDK Manager)

⚠️ **Путь SDK не должен быть в корне диска** (`D:\` нельзя). Задай, например,
`D:\Android\Sdk`. Если поле «Android SDK Location» пустое — сначала **Edit** и укажи
папку, иначе пакеты не ставятся.

**SDK Platforms** → галка **"Show Package Details"**:
- Android 15 (**API 35**) → `Android SDK Platform 35`

**SDK Tools** → "Show Package Details":
- `Android SDK Build-Tools` → **35.0.0**
- `NDK (Side by side)` → **27.1.12297006**
- `Android SDK Platform-Tools`
- `Android SDK Command-line Tools (latest)`

> **Эмулятор НЕ нужен** (собираем APK, ставим на реальный телефон). Предупреждение
> «SDK emulator directory is missing» игнорируй.

### ⚠️ Если загрузка SDK рвётся: «Remote host terminated the handshake»

Google-CDN (`dl.google.com`) в РФ часто режется DPI. Варианты:
1. **Повтори** (Apply ещё раз) — иногда проскакивает.
2. **VPN** — самый надёжный способ, включить и повторить загрузку.
3. **Ручная загрузка** зипов и распаковка в SDK:
   - Build-Tools 35: `https://dl.google.com/android/repository/build-tools_r35_windows.zip`
     → распаковать в `D:\Android\Sdk\build-tools\35.0.0\` (внутри сразу `aapt2.exe`, `d8.bat`…, без лишней вложенной папки).
   - NDK r27: `https://dl.google.com/android/repository/android-ndk-r27b-windows.zip`
     → в `D:\Android\Sdk\ndk\27.1.12297006\`.

---

## 2. Переменные окружения (Windows)

Панель управления → Система → Доп. параметры → **Переменные среды** (пользовательские):

```
ANDROID_HOME = D:\Android\Sdk
JAVA_HOME    = C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
```

В `Path` добавь:
```
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\cmdline-tools\latest\bin
```

Проверка (новый терминал PowerShell):
```powershell
node -v       # v20+
java -version # 17.x
adb version
```

> Альтернатива ANDROID_HOME: положить в `<проект>\android\local.properties`
> строку `sdk.dir=D:\\Android\\Sdk` (двойные слэши).

---

## 3. Проект и зависимости

Скопируй проект (git clone своего репо или архивом, **без** `node_modules`).

```powershell
cd C:\efir
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` обязателен: Jitsi SDK жёстко пинит peer-версии (React 19,
> react-native-webrtc 124), npm иначе падает на конфликтах.

### Адрес сервера (обязательно, иначе сборка упадёт)

Реальный домен **не хранится в публичном репозитории**. Создай локальный конфиг из
шаблона и впиши свои адреса:

```powershell
copy src\config\server.example.ts src\config\server.ts
notepad src\config\server.ts
```

```ts
export const EMBEDDED_SERVER = 'https://meet.<твой-домен>';
export const EMBEDDED_AUTH_URL = 'https://efir-auth.<твой-домен>';
```

> `src/config/server.ts` — в `.gitignore`, в публичный репо не попадёт и переживёт
> `git pull`. Создаёшь один раз. Эти адреса зашиваются в APK, поэтому собеседникам
> вводить сервер вручную **не нужно**.

---

## 4. Ключ подписи (keystore)

```powershell
cd C:\efir\android\app
keytool -genkeypair -v -storetype PKCS12 `
  -keystore efir-release.keystore `
  -alias efir `
  -keyalg RSA -keysize 2048 -validity 10000
```

Создай `C:\efir\android\keystore.properties` (шаблон — `keystore.properties.example`):
```properties
STORE_FILE=efir-release.keystore
STORE_PASSWORD=твой_пароль
KEY_ALIAS=efir
KEY_PASSWORD=твой_пароль
```

> `keystore.properties` и `*.keystore` в `.gitignore`. **Не теряй keystore и пароль** —
> без них не выпустить обновление приложения. Пропустишь шаг — APK подпишется debug-ключом
> (ставится с телефона, но не для Google Play).

---

## 5. Сборка APK

```powershell
cd C:\efir\android
.\gradlew.bat assembleRelease
```

Первый прогон долгий (качает Gradle, компилит webrtc/native — тут тоже могут мешать
DPI-блокировки Google/Maven, при обрывах включи VPN). Готовый файл:

```
C:\efir\android\app\build\outputs\apk\release\app-release.apk
```

APK под `arm64-v8a` + `armeabi-v7a` (реальные телефоны; x86 отключён ради размера).

**AAB для Google Play:** `.\gradlew.bat bundleRelease` → `app\build\outputs\bundle\release\app-release.aab`.

---

## 6. Установить на телефон

```powershell
adb install -r C:\efir\android\app\build\outputs\apk\release\app-release.apk
```
или скинуть `app-release.apk` на телефон и открыть (разрешить установку из неизвестных источников).

---

## 7. Первый запуск — активация доступа

Вход на сервер закрыт для чужих — нужен **инвайт-код**. Сервер уже зашит в APK
(шаг 3), поэтому при первом запуске всего два поля:

| Поле | Значение |
|---|---|
| Как вас зовут | твоё имя |
| Код доступа | инвайт-код (см. ниже) |

**Где взять код** (на сервере, где стоит токен-бэкенд):
```bash
docker exec -it efir-auth-infra-api python -m app.cli create --label "Имя" --ttl-days 90
docker exec -it efir-auth-infra-api python -m app.cli list
docker exec -it efir-auth-infra-api python -m app.cli revoke <id>
```

Сбросить доступ на телефоне: **Настройки → Сбросить доступ**.

---

## 7a. Приглашение собеседников (QR / ссылка) — просто и безопасно

Чтобы не диктовать людям код и адреса, приложение делает приглашение одним тапом.

**Ты (хост):** главный экран → **«Пригласить собеседника»**. Экран покажет **QR** и
кнопки **«Поделиться ссылкой» / «Скопировать»**. По умолчанию вшивается твой код;
можно вставить отдельный гостевой код (создан через `cli create`) и, при желании,
имя комнаты — тогда собеседник войдёт сразу в неё.

**Собеседник:** ставит APK (тот же файл) → **наводит камеру на QR** или **открывает
присланную ссылку** `efir://join?...` → приложение само подставляет сервер и код →
остаётся ввести имя. Вводить адреса/код вручную не нужно.

Ссылка несёт код доступа — отправляй её только тем, кому даёшь доступ (личный чат,
не публичные каналы). Отозвать доступ: `cli revoke <id>` на сервере.

---

## 8. Режим разработки (опционально)

Телефон по USB (включи «Отладка по USB»), два терминала:
```powershell
npm start          # терминал 1
npm run android    # терминал 2
```

---

## Что настроено под задачу

**Оптимизация связи/батареи (3–5 человек)** — `src/jitsi/config.ts`: приём только N
активных говорящих (lastN=4), layer suspension, кап 360p@24fps («Баланс») / 180p@15fps
(«Эконом»), кап аудио-битрейта, P2P для 1:1, VP9, без сторонних запросов. Профиль —
**Настройки → Качество и батарея**.

**Возможности конференции** (Jitsi SDK): tile view, демонстрация экрана, чат, реакции,
поднятая рука, шумоподавление, picture-in-picture, лобби, пароль комнаты, запись (если
на сервере Jibri), интеграция со звонками.

**Безопасность стека:** `@react-native-community/cli` 18.0.1 (патч CVE-2025-11953);
New Architecture выключен (требование Jitsi SDK); секреты (keystore, коды) в `.gitignore`.
`npm audit` — 9 транзитивных внутри дерева Jitsi SDK, чинятся только даунгрейдом SDK
(не трогаем), риск для клиента на 3–5 доверенных участников низкий.

---

## Про iOS

Код кроссплатформенный, но iOS собирается только на macOS (Xcode) или в облаке (EAS).
На Windows iOS-сборка невозможна.
