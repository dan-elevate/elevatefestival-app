import React from 'react';
import {
  SafeAreaView,
  View,
  Dimensions,
  Alert,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  BackHandler,
} from 'react-native';
import {
  checkNotifications,
  RESULTS,
  requestNotifications,
  openSettings,
} from 'react-native-permissions';
import { WebView } from 'react-native-webview';
import Pushy from 'pushy-react-native';
import Config from 'react-native-config';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

class App extends React.Component {
  WEBVIEW_REF = React.createRef();
  state = {
    connected: null,
    main_uri: Config.APP_INITIAL_WEBVIEW_URL,
    pushy_device_id: '',
    pushy_device_permission: 0,
  };
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    // set default prompt option to true
    this.storageService('get').then((value) => {
      if (value === null) {
        this.storageService('set', 'on');
      }
    });
    this.checkPermissions();
    Platform.OS === 'android' &&
      Pushy.setNotificationListener(async (data) => {
        // Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
        let notificationTitle = data.message || 'New Notification';
        // Display basic system notification
        Pushy.notify(notificationTitle, data.message, data);
        // Clear iOS badge count
        Pushy.setBadge && Pushy.setBadge(0);
      });
    // Subscribe
    this.unsubscribe = NetInfo.addEventListener(({ isInternetReachable }) => {
      if (isInternetReachable === null) return;
      if (isInternetReachable !== this.state.connected) {
        this.setState(
          { connected: isInternetReachable },
          () => isInternetReachable && this.WEBVIEW_REF.current.reload(),
        );
      }
    });
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    // Unsubscribe
    this.unsubscribe();
  }
  init() {
    this.register();
    Pushy.listen();
    // if the url field is present then navigate the webview on tap
    Pushy.setNotificationClickListener((payload) => {
      // if the url field is present then navigate the webview on tap
      if (payload && payload.url) {
        this.setState({
          main_uri: payload.url,
        });
      }
    });
  }
  checkPermissions() {
    checkNotifications()
      .then(({ status, settings }) => {
        console.log(status);
        switch (status) {
          case RESULTS.UNAVAILABLE:
            Alert.alert(
              'Notifications Unavailable',
              'It seems that your device does not support push notifications.',
            );
            break;
          case RESULTS.DENIED:
            requestNotifications(['alert', 'sound', 'badge'])
              .then(({ status }) => {
                if (status === RESULTS.GRANTED) {
                  this.setState({ pushy_device_permission: 1 });
                  return this.init();
                }
              })
              .catch(() => {
                Alert.alert(
                  'Notifications Request Failed',
                  'Please manually allow push notifications in the device settings to receive updates',
                );
              });
            break;
          case RESULTS.GRANTED:
            this.setState({ pushy_device_permission: 1 });
            return this.init();
          case RESULTS.BLOCKED:
            return this.setState({ pushy_device_permission: 0 }, () =>
              this.goToSettings(),
            );
        }
      })
      .catch((error) => {
        this.state.connected &&
          Alert.alert(
            'Notifications Not Available',
            'Could not retrieve permission status.',
          );
      });
  }
  async storageService(type, payload = null) {
    switch (type) {
      case 'set':
        try {
          await AsyncStorage.setItem('promptOption', payload);
        } catch (e) {
          console.log(e);
        }
        break;
      case 'get':
        try {
          const value = await AsyncStorage.getItem('promptOption');
          return value;
        } catch (e) {
          console.log(e);
        }
        break;
    }
  }
  async goToSettings() {
    this.storageService('get').then((value) => {
      if (value && value !== null && value == 'on') {
        this.settingsPrompt();
      }
    });
  }
  settingsPrompt() {
    Alert.alert(
      'Notifications Disabled',
      'You can change turn it on in the device settings',
      [
        {
          text: 'Ignore',
          onPress: () => true,
          style: 'cancel',
        },
        {
          text: 'Don´t ask me again',
          onPress: () => this.storageService('set', 'off'),
          style: 'cancel',
        },
        {
          text: 'Go to settings',
          onPress: () =>
            openSettings().catch(() =>
              Alert.alert(
                'Opening Settings Failed',
                'Please open the settings manually',
              ),
            ),
        },
      ],
    );
  }

  register(token: string) {
    // Register the device for push notifications
    this.state.connected &&
      Pushy.register()
        .then(async (deviceToken: string) =>
          this.setState({ pushy_device_id: deviceToken }),
        )
        .catch((error: string) => {
          Alert.alert(
            'Failed to set up push notifications :(',
            'Please re-open the app and try again later.',
          );
        });
  }
  handleBackButton = () => {
    if (this.state.canGoBack) {
      this.WEBVIEW_REF.current.goBack();
      return true;
    }
  };

  onNavigationStateChange = (navState) => {
    this.setState({
      canGoBack: navState.canGoBack,
    });
  };
  render() {
    const { pushy_device_id, pushy_device_permission, connected } = this.state;
    const naming = Config.APP_BUNDLE_ID.replace(/\./g, '_').toUpperCase();
    const params = `
    window.${naming}_APP_PUSHY_ID = ${pushy_device_id}
    window.${naming}_APP_PUSHY_ALLOWED = ${pushy_device_permission}
    true; // note: this is required, or you'll sometimes get silent failures
  `;
    return (
      <SafeAreaView>
        <View style={styles.wrapper}>
          {!connected && !(connected === null) && (
            <TouchableWithoutFeedback
              onPress={() => this.WEBVIEW_REF.current.reload()}>
              <View style={styles.alertBox}>
                <Icon name="cloud-off-outline" size={30} color="#ad0000" />
                <Text style={styles.alertBox_text}>You are offline</Text>
              </View>
            </TouchableWithoutFeedback>
          )}
          <WebView
            ref={this.WEBVIEW_REF}
            injectedJavaScript={params}
            source={{ uri: this.state.main_uri }}
            onNavigationStateChange={this.onNavigationStateChange}
          />
        </View>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  wrapper: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    justifyContent: 'center',
  },
  alertBox: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 30,
    position: 'absolute',
    bottom: 100,
    zIndex: 2,
    width: Dimensions.get('window').width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  alertBox_text: {
    marginTop: 3,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
});
export default App;
