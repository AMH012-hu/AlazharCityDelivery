# Android Studio project

Open this folder in Android Studio. Gradle uses Android Gradle Plugin 8.9.1, JDK 17 or newer, and Android SDK 36.

The app is a Trusted Web Activity named **Alazhar City** and loads the customer site at `https://amh012-hu.github.io/AlazharCityDelivery/`. The public, signed APK is already available at [`../downloads/client/AlazharCity.apk`](../downloads/client/AlazharCity.apk).

## Build

```bash
./gradlew assembleDebug
./gradlew assembleRelease
```

The project deliberately excludes the private Android signing keystore and passwords. A locally built release must be signed using the original private keystore to update an installed copy. Never commit the keystore or its password.

## Remove Chrome's browser bar

Chrome verifies a TWA through Digital Asset Links. Deploy this folder's `assetlinks.json` to `https://amh012-hu.github.io/.well-known/assetlinks.json` at the **root** of the GitHub Pages domain. The app repository is published under `/AlazharCityDelivery/`; placing the file under this project URL does not satisfy the check. See [`../TWA_ASSET_LINKS.md`](../TWA_ASSET_LINKS.md).
