#!/bin/node
/*
    load_brand.js
    updates app icon and launch screen from the /assets folder to native projects
*/
const fs = require('fs-extra');
const IOS_ASSETS = './ios/festival_app/Images.xcassets/AppIcon.appiconset';
const ANDROID_ASSETS = './android/app/src/main/res';
fs.rmdir(IOS_ASSETS, { recursive: true }, () => {
  console.log('old iOS assets deleted');
  if (!fs.existsSync(IOS_ASSETS)) {
    fs.mkdirSync(IOS_ASSETS);
  }
  fs.copy('./assets/ios', IOS_ASSETS);
});
fs.rmdir(ANDROID_ASSETS, { recursive: true }, () => {
  console.log('old Android assets deleted');
  if (!fs.existsSync(ANDROID_ASSETS)) {
    fs.mkdirSync(ANDROID_ASSETS);
  }
  fs.copy('./assets/android', ANDROID_ASSETS, () => {
    console.log('old Android assets replaced');
  });
  fs.copy('./assets/values', ANDROID_ASSETS + '/values', () => {
    console.log('vlaues folder transferred');
  });
});
