/**
 * @format
 */
import 'react-native-gesture-handler';
import 'react-native-get-random-values';

// Jitsi SDK внутри использует react-navigation; нативный react-native-screens
// на части устройств рисует конференцию чёрным (медиа работает, UI не виден).
// Отключаем нативные screens — навигация рендерится обычными View.
import {enableScreens} from 'react-native-screens';
enableScreens(false);

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
