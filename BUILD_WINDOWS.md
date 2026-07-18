# Efir (Эфир) — сборка Android APK на Windows 10

Мобильный клиент видеоконференций на движке **Jitsi**. Стек: React Native 0.79.7,
`@jitsi/react-native-sdk` 12.1.5, TypeScript. По умолчанию подключается к
`https://meet.systemtool.ru` (меняется в настройках приложения).

Сервер, на котором писался проект — Linux без Android-тулчейна. Ниже — что поставить
на **Windows 10**, чтобы собрать APK.

---

## 1. Что установить (ссылки)

| Компонент | Версия | Ссылка |
|---|---|---|
| **Node.js LTS** | 20.x (или новее LTS) | https://nodejs.org/en/download |
| **JDK 17** (Temurin) | 17.x | https://adoptium.net/temurin/releases/?version=17 |
| **Android Studio** | последняя | https://developer.android.com/studio |
| **Git** (опц.) | любая | https://git-scm.com/download/win |

> JDK 17 обязателен именно 17 (не 21/23) — Gradle-плагин RN 0.79 и Jitsi SDK
> собираются под Java 17. Android Studio ставит свой JDK, но для командной строки
> удобнее отдельный Temurin 17.

### Компоненты Android SDK (через Android Studio → SDK Manager)

Открой **Android Studio → More Actions → SDK Manager**:

**Вкладка SDK Platforms** → отметь галку **"Show Package Details"**:
- Android 15 (**API 35**) → `Android SDK Platform 35`

**Вкладка SDK Tools** → "Show Package Details":
- `Android SDK Build-Tools` → **35.0.0**
- `NDK (Side by side)` → **27.1.12297006**
- `Android SDK Platform-Tools` (adb)
- `Android SDK Command-line Tools (latest)`
- `CMake` (последняя)

Нажми Apply — скачает ~4–5 ГБ.

---

## 2. Переменные окружения (Windows)

Панель управления → Система → Доп. параметры → **Переменные среды**:

```
JAVA_HOME   = C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
ANDROID_HOME = C:\Users\<ТЫ>\AppData\Local\Android\Sdk
```

В `Path` добавь:
```
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\cmdline-tools\latest\bin
```

Проверка (новый терминал PowerShell):
```powershell
node -v      # v20+
java -version # 17.x
adb version
```

---

## 3. Скопировать проект и поставить зависимости

Скопируй папку `/opt/efir` на Windows (git clone своего репо, либо архивом — **без**
`node_modules`, их поставим заново).

```powershell
cd C:\efir
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` обязателен: Jitsi SDK жёстко пинит peer-версии (React 19,
> react-native-webrtc 124 и др.), npm иначе ругается на конфликты.

---

## 4. Ключ подписи (keystore)

APK нужно подписать. Сгенерируй ключ (JDK уже стоит → `keytool` в PATH):

```powershell
cd C:\efir\android\app
keytool -genkeypair -v -storetype PKCS12 `
  -keystore efir-release.keystore `
  -alias efir `
  -keyalg RSA -keysize 2048 -validity 10000
```

Задаст пароль и пару вопросов (имя/город — можно любое). Запомни **пароль**.

Создай `C:\efir\android\keystore.properties` (шаблон — `keystore.properties.example`):
```properties
STORE_FILE=efir-release.keystore
STORE_PASSWORD=твой_пароль
KEY_ALIAS=efir
KEY_PASSWORD=твой_пароль
```

> `keystore.properties` и `*.keystore` уже в `.gitignore` — в репозиторий не попадут.
> **Не теряй keystore и пароль** — без них не выпустить обновление приложения.

Если пропустить этот шаг — сборка всё равно пройдёт, но APK подпишется **debug**-ключом
(ставится с телефона, но не годится для Google Play и обновлений поверх release).

---

## 5. Сборка APK

```powershell
cd C:\efir\android
.\gradlew.bat assembleRelease
```

Первый прогон долгий (качает Gradle, компилит webrtc/native). Готовый файл:

```
C:\efir\android\app\build\outputs\apk\release\app-release.apk
```

APK собирается под `arm64-v8a` + `armeabi-v7a` (реальные телефоны; x86 отключён ради размера).

**AAB для Google Play** (если понадобится):
```powershell
.\gradlew.bat bundleRelease
# → app\build\outputs\bundle\release\app-release.aab
```

---

## 6. Установить на телефон

**Вариант А — по кабелю** (включи «Отладка по USB» в режиме разработчика):
```powershell
adb install -r C:\efir\android\app\build\outputs\apk\release\app-release.apk
```

**Вариант Б** — скинь `app-release.apk` на телефон (Telegram/кабель), открой,
разреши установку из неизвестных источников.

---

## 7. Запуск в режиме разработки (опционально)

Телефон по USB + два терминала:
```powershell
# терминал 1
npm start
# терминал 2
npm run android
```

---

## Что уже настроено под твою задачу

**Оптимизация связи/батареи (звонки на 3–5 человек)** — `src/jitsi/config.ts`:
- приём только N активных говорящих (`channelLastN = 4`);
- layer suspension — не гнать неиспользуемые simulcast-слои;
- кап видео: **360p @ 24fps** (профиль «Баланс») или **180p @ 15fps** («Эконом»);
- кап аудио-битрейта, отключён анализ громкости (CPU);
- P2P для звонка 1:1 (без моста — ниже задержка и расход);
- `disableThirdPartyRequests` — без gravatar/аналитики (меньше трафика, приватнее);
- предпочтительный кодек VP9.
- Профиль качества переключается в приложении: **Настройки → Качество и батарея**.

**Возможности видеоконференции** (даёт Jitsi SDK): сетка/tile view, демонстрация
экрана, чат, реакции, поднятая рука, шумоподавление, picture-in-picture, запись
(если на сервере поднят Jibri), лобби, пароль комнаты, интеграция со звонками
(CallKit/ConnectionService).

**Безопасность стека:**
- `@react-native-community/cli` поднят до 18.0.1 — патч против **CVE-2025-11953**
  (RCE dev-сервера RN).
- New Architecture (Fabric) выключен — требование Jitsi SDK.
- `npm audit`: 9 транзитивных уязвимостей (6 moderate / 3 high) **внутри дерева
  Jitsi SDK** (lib-jitsi-meet, rtcstats→uuid, react-linkify→linkify-it,
  i18next-http-backend). Чинятся только даунгрейдом SDK до 0.4.0 (ломающий) —
  поэтому НЕ трогаем. Реальный риск для клиента на 3–5 доверенных участников
  низкий (ReDoS в подсветке ссылок чата, bounds-check uuid, path-traversal i18n с
  локалью, заданной приложением). **Отслеживать выход патча Jitsi SDK и обновлять.**
- Секреты (keystore, пароли, `.env`) — в `.gitignore`, в репозиторий не попадают.

---

## Про iOS

Код кроссплатформенный, но iOS собирается только на macOS (нужен Xcode) либо в
облаке (EAS/MacinCloud). На Windows iOS-сборка невозможна. Добавим, когда будет Mac.
