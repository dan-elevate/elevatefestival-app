

  

<h1 align="center">Elevate Festival App 👋</h1>

  

<p>

  

<img  alt="Version"  src="https://img.shields.io/badge/version-1.0-blue.svg?cacheSeconds=2592000" />

  

</p>

  

  

React Native project that is configurable to custom naming, assets and frontend Web URL.

  

  ## 0 - Prerequisites


Set up you machine environemnt for React native development:

https://reactnative.dev/docs/environment-setup (only up to `Creating a new application`)

Make sure to have yarn globally installed on your machine:

https://classic.yarnpkg.com/en/docs/getting-started/




  
## 1 - Setup .template.env File

In order to set up you configuration, open up  `./assets/.template.env` and type in your configuration.

| Environment Property | Usage |
|--|--|
| APP_NAME | name of the main component registered from JavaScript and also binary bundle name in iOS |
| APP_DISPLAY_NAME | display name of the app under the icon |
| APP_BUNDLE_ID | you application's bundle id e.g com.my.app |
| APP_INITIAL_WEBVIEW_URL | first url that webview opens on default |
| APP_VERSION | app store version e.g 1.0 |
| APP_BUNDLE_VERSION | app bundle/build number |
 
 ## 2 - Initiate The Project and .env File

  
Then, run the following command to generate the `.env` file on the root directory and set up other libraries and dependencies.
 

`yarn init-app`

### If you are running iOS, make sure to run `yarn pod`


 ## 3 - Transfer Your Assets (Icons, Splash Screen)


You can build your icons with https://appicon.co/

Note: For iOS, cope the CONTENTS of the `AppIcon.appiconset` folder ONLY, not the folder itself.

Destination for iOS assets: `assets/ios`

Destination for Android assets: `assets/android`


Load the assets into the native folders by 

`yarn load-assets` 
 

*Note: Do NOT change or remove the values folder. This holds the app naming and style for Android build. 
Note: Do NOT delete the assets folder or android/ios folder in it. Simply copy paste your generated icons and launch screen into the corresponding folders.*
  
  

## Push Notifications

Notification is handled by [Pushy](https://pushy.me/docs/additional-platforms/react-native). Mainly you need to make sure you bundle id matches the one in your Pushy Panel.

Following are the fields for the push notifications:

| Field | Type |
|--|--|
| title | string (optional) |
| message | string |
| url | opens the address when notification message is tapped on (string) (optional) |
 


These params are injected into the Webview Landing Page on load for acces on your web page side:

| Field | Type |
|--|--|
| `window.AppData.[MY_BUNDLE_ID]_APP_PUSHY_ID` | string |
| `window.AppData.[MY_BUNDLE_ID]_APP_PUSHY_ALLOWED` | boolean |

Note:

Your bundle ID (`APP_BUNDLE_ID`) located in `./.env` is uppercased and relplaced `.` with `_`. Example: `my.bundle.id` will be converted into `MY_BUNDLE_ID`

where now you can extract these values on your web page side from the window object as such (example):

`window.[MY_BUNDLE_ID]_APP_PUSHY_ID`



Permission checks are with the help of  [react-native-permissions](https://github.com/zoontek/react-native-permissions)
  

## Author

  

  

👤 **Daniel Danaee**

  

  

* Website: https://www.tao-digital.at/

  

  

## Show your support

  

  

Give a ⭐️ if this project helped you!

  

  

 
   
