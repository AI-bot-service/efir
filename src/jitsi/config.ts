/**
 * Оптимизированная конфигурация Jitsi под мобильный эфир на 3-5 человек.
 *
 * Цели: минимум расхода батареи и трафика при сохранении читаемого видео
 * говорящих голов. Ключевые рычаги:
 *  - simulcast + layer suspension: не гнать верхние слои, которые никто не смотрит
 *  - lastN = 4: принимаем максимум 4 удалённых видео (потолок для звонка 3-5)
 *  - opus DTX: не слать аудио в тишине
 *  - кап разрешения/битрейта/fps: 360p @ 24fps в балансе, 180p @ 15fps в экономе
 *  - p2p для звонка 1:1: без моста, ниже задержка и расход
 *  - disableThirdPartyRequests: без gravatar/аналитики — меньше сети и приватнее
 */

export type QualityProfile = 'balanced' | 'saver';

export interface EfirConfigOpts {
  displayName: string;
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
  profile?: QualityProfile;
}

const PROFILE = {
  balanced: {
    height: { ideal: 360, max: 480, min: 180 },
    frameRate: { ideal: 24, max: 24, min: 12 },
    maxBitratesVideo: { low: 120000, standard: 420000, high: 800000 },
    lastN: 4,
  },
  saver: {
    height: { ideal: 180, max: 240, min: 120 },
    frameRate: { ideal: 15, max: 15, min: 8 },
    maxBitratesVideo: { low: 80000, standard: 200000, high: 350000 },
    lastN: 4,
  },
} as const;

export function buildConfigOverwrite(opts: EfirConfigOpts) {
  const p = PROFILE[opts.profile ?? 'balanced'];

  return {
    // --- вход в звонок ---
    prejoinPageEnabled: false,
    prejoinConfig: { enabled: false },
    startWithAudioMuted: opts.startWithAudioMuted ?? false,
    startWithVideoMuted: opts.startWithVideoMuted ?? false,
    startAudioOnly: false,
    disableDeepLinking: true,

    // --- приватность / меньше сети → меньше батареи ---
    disableThirdPartyRequests: true,
    analytics: { disabled: true, rtcstatsEnabled: false },
    doNotStoreRoom: true,
    gravatar: { disabled: true },
    disableProfile: false,

    // --- трафик приёма: только N активных говорящих ---
    channelLastN: p.lastN,
    lastNLimits: undefined,
    enableLayerSuspension: true, // не отдавать верхние simulcast-слои, если их не смотрят

    // --- аудио: экономия батареи и трафика ---
    enableOpusRed: false,
    opusMaxAverageBitrate: 24000,
    enableTalkWhileMuted: false,
    disableAudioLevels: true, // анализ громкости жрёт CPU — выключаем
    audioQuality: {
      stereo: false,
      opusMaxAverageBitrate: 24000,
    },
    enableNoAudioDetection: true,
    enableNoisyMicDetection: false,
    // DTX — discontinuous transmission: не слать пакеты в тишине
    disableAP: false,

    // --- видео: кап разрешения/битрейта/fps ---
    resolution: p.height.ideal,
    constraints: {
      video: {
        height: p.height,
        frameRate: p.frameRate,
      },
    },
    videoQuality: {
      maxBitratesVideo: p.maxBitratesVideo,
      preferredCodec: 'VP9', // VP9/SVC эффективнее по битрейту для 3-5 участников
      enforcePreferredCodec: false,
    },
    startBitrate: p.maxBitratesVideo.standard,
    disableSimulcast: false, // simulcast нужен для адаптации к слабой сети

    // --- P2P для 1:1: без моста ---
    p2p: {
      enabled: true,
      preferredCodec: 'VP9',
      disableH264: false,
    },

    // --- UX ---
    disableTileEnlargement: false,
    disableSelfView: false,
    disableSelfViewSettings: false,
    hideConferenceSubject: false,
    hideConferenceTimer: false,
    disableReactions: false,
    disablePolls: false,
    enableClosePage: false,
    defaultLanguage: 'ru',

    // не грузить лишние welcome/deeplink страницы
    enableWelcomePage: false,
    enableClosePageOnLeave: false,
  };
}

/** Нативные feature-flags для компонента JitsiMeeting. */
export const efirFlags = {
  'pip.enabled': true,
  'pip-while-screen-sharing.enabled': true,
  'call-integration.enabled': true, // CallKit/ConnectionService — корректные прерывания
  'welcomepage.enabled': false,
  'prejoinpage.enabled': false,
  'server-url-change.enabled': false,
  'add-people.enabled': false,
  'invite.enabled': false,
  'calendar.enabled': false,
  'help.enabled': false,
  'meeting-name.enabled': true,
  'meeting-password.enabled': true,
  'lobby-mode.enabled': true,
  'security-options.enabled': true,
  'chat.enabled': true,
  'reactions.enabled': true,
  'raise-hand.enabled': true,
  'tile-view.enabled': true,
  'video-share.enabled': false,
  'live-streaming.enabled': false,
  'recording.enabled': true, // если на сервере поднят Jibri
  'toolbox.alwaysVisible': false,
  'fullscreen.enabled': true,
  'audio-focus.enabled': true,
  'audio-mute.enabled': true,
  'video-mute.enabled': true,
  'kick-out.enabled': true,
  'overflow-menu.enabled': true,
  'settings.enabled': true,
  'notifications.enabled': true,
  'unsaferoomwarning.enabled': false,
} as const;
