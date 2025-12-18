import { registerRootComponent } from 'expo';
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
import { polyfill as polyfillRS } from 'react-native-polyfill-globals/src/readable-stream';
import { polyfill as polyfillEC } from 'react-native-polyfill-globals/src/encoding';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

polyfillFetch();
polyfillRS();
polyfillEC();
