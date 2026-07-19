// Пакет react-native-qrcode-svg не поставляет собственные типы.
// Минимальная декларация под используемый набор пропсов.
declare module 'react-native-qrcode-svg' {
  import { ComponentType } from 'react';
  interface QRCodeProps {
    value: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    ecl?: 'L' | 'M' | 'Q' | 'H';
    quietZone?: number;
    logo?: unknown;
    logoSize?: number;
  }
  const QRCode: ComponentType<QRCodeProps>;
  export default QRCode;
}
