/**
 * Локальный type-shim для @jitsi/react-native-sdk.
 * Пакет поставляет непротранспилированные .tsx без деклараций — при прямом
 * резолве tsc ныряет в его исходники и сыпет сотнями чужих ошибок.
 * Через paths в tsconfig импорт SDK резолвится сюда (только для типов;
 * в рантайме Metro грузит реальный модуль).
 */
declare module '@jitsi/react-native-sdk' {
  import type * as React from 'react';

  export interface JitsiRefProps {
    close: () => void;
    setAudioOnly?: (value: boolean) => void;
    setAudioMuted?: (muted: boolean) => void;
    setVideoMuted?: (muted: boolean) => void;
    getRoomsInfo?: () => unknown;
  }

  export interface JitsiUserInfo {
    avatarURL?: string;
    displayName?: string;
    email?: string;
  }

  export interface JitsiEventListeners {
    onConferenceJoined?: (data?: unknown) => void;
    onConferenceLeft?: (data?: unknown) => void;
    onConferenceWillJoin?: (data?: unknown) => void;
    onParticipantJoined?: (data?: unknown) => void;
    onParticipantLeft?: (data?: unknown) => void;
    onAudioMutedChanged?: (muted: boolean) => void;
    onVideoMutedChanged?: (muted: boolean) => void;
    onEnterPictureInPicture?: (data?: unknown) => void;
    onReadyToClose?: () => void;
  }

  export interface JitsiMeetingProps {
    room: string;
    serverURL?: string;
    token?: string;
    config?: object;
    flags?: object;
    userInfo?: JitsiUserInfo;
    style?: object;
    eventListeners?: JitsiEventListeners;
  }

  export const JitsiMeeting: React.ForwardRefExoticComponent<
    JitsiMeetingProps & React.RefAttributes<JitsiRefProps>
  >;
}
