---
title: 'Integrating LINE Login with your Android app | LINE Developers'
description: 'Using LINE Login to get authorization from your users'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/line-login-sdks/android-sdk/integrate-line-login/'
---

## Table of Contents

[Prerequisites](#prerequisites)

[Upgrading from earlier SDK versions](#upgrading-from-earlier-versions)

[Add LINE SDK dependency](#add-line-sdk-dependency)

[Import the library into your project](#import-library-into-your-project) [Add Android compilation options](#add-android-compilation-options)

[Setting the Android manifest file](#setting-android-manifest-file)

[Linking your app to your channel](#link-app-to-channel)

[Set Package Signatures](#set-package-signatures)

[Adding the LINE Login button](#adding-line-login-button)

[Use the LINE SDK's built-in login button](#use-button) [Use a customized login button](#use-code)

[Starting the login activity](#starting-login-activity)

[Handling the login result](#handling-login-result)

[Get the access token](#get-access-token) [Get user profile immediately after login](#get-user-profile-immediately-after-login) [Using user data on your server](#using-user-info-on-your-server)

[Using the LineApiClient interface](#using-the-lineapiclient-interface)

# [#](#page-title) Integrating LINE Login with your Android app

This topic explains how to implement [LINE Login](../../../../en/docs/line-login/overview.md) by integrating the LINE SDK for Android with your existing Android app. To see what LINE Login can do, read [Trying the sample app](../../../../en/docs/line-login-sdks/android-sdk/try-line-login.md) and try the LINE Login sample app for Android.

## [#](#prerequisites) Prerequisites

To build and use the LINE SDK for Android, you need:

- A [provider](../../../../en/glossary.md#provider) and a LINE Login channel. You can [create both](../../../../console/register/line-login/channel.md) in the LINE Developers Console.
- To set `minSdkVersion` to 24 or higher (Android 7.0 or later).

Set minSdkVersion to earlier than 24 (earlier than Android 7.0)

If you want to set `minSdkVersion` to earlier than 24 (earlier than Android 7.0), use an earlier version of the LINE SDK for Android. For more information, see [Releases (opens new window)](https://github.com/line/line-sdk-android/releases).

> [!warning]
> Resource naming conflicts
>
> Don't use resource IDs that start with `linesdk_` as this may cause conflicts with the resources in the SDK.

## [#](#upgrading-from-earlier-versions) Upgrading from earlier SDK versions

If you're upgrading from LINE SDK v4.x or earlier, it helps to know that the current version has these major differences:

- When starting login, you must specify [Scopes](../../../../en/docs/line-login/integrate-line-login.md#scopes) to determine which user data your app can access.
- If you specify the `OPENID_CONNECT` scope during login, you can get an [ID token](../../../../en/docs/line-login-sdks/android-sdk/managing-users.md#get-id-token) to securely verify the user's identity.

## [#](#add-line-sdk-dependency) Add LINE SDK dependency

To integrate LINE SDK for Android, import the required library to your project and configure the Android manifest file of your project by following the steps below.

### [#](#import-library-into-your-project) Import the library into your project

Add LINE SDK dependency in your module-level `build.gradle` file.

[![Maven Central](https://img.shields.io/maven-central/v/com.linecorp.linesdk/linesdk.svg?label=Maven%20Central) (opens new window)](https://search.maven.org/search?q=g:%22com.linecorp.linesdk%22%20AND%20a:%22linesdk%22)

```
repositories {
   ...
   mavenCentral()
}

dependencies {
    ...
    implementation 'com.linecorp.linesdk:linesdk:latest.release'
    ...
}
```

### [#](#add-android-compilation-options) Add Android compilation options

Enable Java 1.8 support. In the same `build.gradle` file as above, add:

```
android {
...
  compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
...
}
```

## [#](#setting-android-manifest-file) Setting the Android manifest file

To specify that your app requires Internet access, add the `INTERNET` permission to your `AndroidManifest.xml` file.

```
<uses-permission android:name="android.permission.INTERNET"/>
```

> [!warning]
> Note
>
> Make sure the launch mode of the activity that is making the login call is not set to `singleInstance` as that may prevent the activity from receiving the `onActivityResult` callback.

## [#](#link-app-to-channel) Linking your app to your channel

Linking your app to a LINE Login channel, enable **Mobile app** on the **LINE Login** tab of your channel settings on the [LINE Developers Console](../../../../console.md) and complete these fields.

- **Package names:** Required. Application's package name used to launch the Google Play store.
- **Package signatures:** Optional. You can set multiple signatures by entering each one on a new line.
- **Android URL scheme:** Optional. Custom URL scheme used to launch your app.

![Android Package names, Package signatures, and URL scheme settings.](/assets/img/android-app-settings.6f11a36d.png)

### [#](#set-package-signatures) Set Package Signatures

Package signatures are crucial for enhancing authentication interactions between your app and the LINE app. There are two types of package signature, debug package signature and release package signature. These are related to the key hash in SHA-1 format.

#### [#](#debug-package-signature) Debug package signature

Debug package signature is generated from a Debug certificate that is automatically generated by Android Studio when running or debugging your app.

```
# For macOS
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android | openssl sha1

# For Windows
keytool -exportcert -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore -storepass android -keypass android | openssl sha1
```

#### [#](#release-package-signature) Release package signature

Release package signature is generated from a Release certificate used to release the app to the store. Replace `<RELEASE_KEY_ALIAS>` and `<RELEASE_KEY_PATH>` with your actual release key alias and path.

```
keytool -exportcert -alias <RELEASE_KEY_ALIAS> -keystore <RELEASE_KEY_PATH> | openssl sha1
```

#### [#](#release-key-hash-from-google-pray-console) Using the Google Play Console to get Release key hash

If you are using [Play App Signing (opens new window)](https://developer.android.com/studio/publish/app-signing?hl=en#app-signing-google-play), you should use the SHA-1 certificate fingerprint obtained from the Google Play Console instead of generating a Release key hash on the Terminal. For more information, see [Use Play App Signing (opens new window)](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en) in the Play Console Help.

In the Google Play Console, navigate to **Setup** > **App signing**, and then copy the value of the SHA-1 certificate fingerprint.

## [#](#adding-line-login-button) Adding the LINE Login button

To let the user log in to your Android app, you can create a LINE-branded login button to take the user through the authentication and authorization process.

There are 2 ways to add a login button:

- [Use the LINE SDK's built-in login button](#use-button)
- [Use a customized login button](#use-code)

### [#](#use-button) Use the LINE SDK's built-in login button

The LINE SDK provides a pre-defined login button. You can add a login button to the user interface of your app to provide your users with a quick way to log in as below:

1. Add the login button in your layout XML file.

    ```
    <com.linecorp.linesdk.widget.LoginButton
        android:id="@+id/line_login_btn"
        android:layout_width="match_parent"
        android:layout_height="wrap_content" />
    ```

2. Find the view in your activity or fragment, set up necessary parameters, and assign a listener to it.

    ```
    import java.util.Arrays;

    // A delegate for delegating the login result to the internal login handler.
    private LoginDelegate loginDelegate = LoginDelegate.Factory.create();

    LoginButton loginButton = rootView.findViewById(R.id.line_login_btn);

    // if the button is inside a Fragment, this function should be called.
    loginButton.setFragment(this);

    loginButton.setChannelId(channelIdEditText.getText().toString());

    // configure whether login process should be done by Line App, or inside WebView.
    loginButton.enableLineAppAuthentication(true);

    // set up required scopes and nonce.
    loginButton.setAuthenticationParams(new LineAuthenticationParams.Builder()
            .scopes(Arrays.asList(Scope.PROFILE))
            // .nonce("<a randomly-generated string>") // nonce can be used to improve security
            .build()
    );
    loginButton.setLoginDelegate(loginDelegate);
    loginButton.addLoginListener(new LoginListener() {
        @Override
        public void onLoginSuccess(@NonNull LineLoginResult result) {
            Toast.makeText(getContext(), "Login success", Toast.LENGTH_SHORT).show();
        }

        @Override
        public void onLoginFailure(@Nullable LineLoginResult result) {
            Toast.makeText(getContext(), "Login failure", Toast.LENGTH_SHORT).show();
        }
    });
    ```

### [#](#use-code) Use a customized login button

Instead of using the default login button, you can also customize your user interface and login process with your own code.

#### [#](#download-and-add-images-to-project) Download and add the images to your project

The LINE Login button image set includes images for iOS, Android and desktop applications. The image set for Android includes images for multiple screen densities and button states. In this guide, we’ll use the "base" and "pressed" login button images in the Android folder.

1. Download and extract the [LINE Login button images (opens new window)](https://vos.line-scdn.net/line-developers/docs/media/line-login/login-button/LINE_Login_Button_Image.zip).
2. Add the "base" and "pressed" login button images to the `drawable` folder for each screen density.

#### [#](#configure-images) Configure the images

Before you can use the images, you’ll need to add the login button text that you want to use. See [LINE Login button design guidelines](../../../../en/docs/line-login/login-button.md) for the recommended login button text for different languages. You’ll also need to define stretchable regions of the image to add the button text without distorting the LINE icon.

1. Create [9-patch files (opens new window)](https://developer.android.com/guide/topics/resources/drawable-resource#NinePatch#NinePatch) for each image and define the stretchable regions for the login button text.
2. Add the button to the login screen of your app as a clickable text view with your desired login button text.
3. Add selector XML files in your drawable folders to define the image which corresponds to the state of the text view.

## [#](#starting-login-activity) Starting the login activity

When a user taps the login button, your app calls `getLoginIntent()` to get the login intent and start the login activity. The context and the channel ID must be passed into this method. If LINE is installed on the device, LINE is opened to perform login without asking for the user’s LINE credentials. If LINE is not installed, users are redirected to the LINE Login screen in a browser to enter their LINE credentials (email address and password).

1. Set an on-click listener to listen for when the button is tapped.
2. In the `onClick` callback, call the `getLoginIntent()` method in `LineLoginApi` to get the login intent to start the login activity.
3. Start the authentication process by calling `startActivityForResult()` and passing the login intent and request code as parameters. The request code is an integer that is used to identify the request.

The following is an example of how to start the activity to log in the user when the user taps the login button.

```
private static final int REQUEST_CODE = 1;
...

final TextView loginButton = (TextView) findViewById(R.id.login_button);
loginButton.setOnClickListener(new View.OnClickListener() {

    public void onClick(View view) {
        try{
            // App-to-app login
            Intent loginIntent = LineLoginApi.getLoginIntent(
             view.getContext(),
             Constants.CHANNEL_ID,
             new LineAuthenticationParams.Builder()
            .scopes(Arrays.asList(Scope.PROFILE))
                        // .nonce("<a randomly-generated string>") // nonce can be used to improve security
            .build());
            startActivityForResult(loginIntent, REQUEST_CODE);

        }
        catch(Exception e) {
            Log.e("ERROR", e.toString());
        }
    }
});
```

> [!warning]
> Note
>
> If you do not want to use app-to-app login and instead have the user log in via the LINE Login screen in a browser, use the `getLoginIntentWithoutLineAppAuth()` method.

## [#](#handling-login-result) Handling the login result

After the user has logged in, the login result is returned in the activity’s `onActivityResult()` method. Your application must override this method to handle the login result.

Use the `getResponseCode()` method of the `LineLoginResult` object to determine if the login was successful. If `getResponseCode()` returns `SUCCESS`, the login was successful. Any other value indicates a failure. See [Handling errors](../../../../en/docs/line-login-sdks/android-sdk/handling-errors.md) to determine the type of error that occurred.

The following shows an example of how the login result can be handled by your app.

```
public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode != REQUEST_CODE) {
        Log.e("ERROR", "Unsupported Request");
        return;
    }

    LineLoginResult result = LineLoginApi.getLoginResultFromIntent(data);

    switch (result.getResponseCode()) {

        case SUCCESS:
            // Login successful
            String accessToken = result.getLineCredential().getAccessToken().getTokenString();

            Intent transitionIntent = new Intent(this, PostLoginActivity.class);
            transitionIntent.putExtra("line_profile", result.getLineProfile());
            transitionIntent.putExtra("line_credential", result.getLineCredential());
            startActivity(transitionIntent);
            break;

        case CANCEL:
            // Login canceled by user
            Log.e("ERROR", "LINE Login Canceled by user.");
            break;

        default:
            // Login canceled due to other error
            Log.e("ERROR", "Login FAILED!");
            Log.e("ERROR", result.getErrorData().toString());
    }
}
```

### [#](#get-access-token) Get the access token

The login result contains a `LineCredential()` object which contains the user’s access token. As shown in the example above, you can retrieve the access token using the following code.

```
String accessToken = result.getLineCredential().getAccessToken().getTokenString();
```

### [#](#get-user-profile-immediately-after-login) Get user profile immediately after login

The LINE SDK automatically gets a user’s profile information upon logging in. The user’s profile information consists of the display name, user ID, status message, and profile media URL. Access this information by calling the `getLineProfile()` method in the `LineLoginResult` object. The following code snippet from the example above demonstrates how to get a user’s profile information from the login result and pass it into an intent.

```
transitionIntent.putExtra("display_name", result.getLineProfile().getDisplayName());
transitionIntent.putExtra("status_message", result.getLineProfile().getStatusMessage());
transitionIntent.putExtra("user_id", result.getLineProfile().getUserId());
transitionIntent.putExtra("picture_url", result.getLineProfile().getPictureUrl().toString());
```

The user ID is only unique to an individual provider. The same LINE user will have a different user ID for different providers. Avoid using the user ID to identify users across different providers.

### [#](#using-user-info-on-your-server) Using user data on your server

> [!danger]
> User impersonation
>
> Do not trust user IDs, or other information available in the `LineProfile` object, when sent by a client to your backend server. A malicious client can send an arbitrary user ID or malformed information to your server to impersonate a user.
>
> Instead, the client should send the server an access token, and the server should use the token to retrieve user data.

Typically, a back-end server verifies a user's identity based on a user ID, display name, or some other LINE account property. But instead of sending that information from the client to your server directly, the client should send an access token. The server should then use this to securely verify the user's identity against the LINE Platform's server.

Learn more about access tokens from [Get the access token](#get-access-token).

Learn more about what APIs to call from your backend on these pages:

- [Verify access token validity](../../../../en/reference/line-login.md#verify-access-token)
- [Get user profile](../../../../en/reference/line-login.md#get-user-profile)

## [#](#using-the-lineapiclient-interface) Using the `LineApiClient` interface

Use the SDK by calling the methods of the `LineApiClient` interface. To do this, create a static variable of a `lineApiClient` object and initialize the variable.

1. Create a static variable of the object to call various methods.

    ```
    private static LineApiClient lineApiClient;
    ```

2. Initialize the `lineApiClient` variable on your activity’s `onCreate()` method as shown below. The channel ID and the context are required for initialization.

    ```
    LineApiClientBuilder apiClientBuilder = new LineApiClientBuilder(getApplicationContext(), "your channel id here");
    lineApiClient = apiClientBuilder.build();
    ```

> [!warning]
> Note
>
> All methods in the LINE SDK for Android perform network operations and will cause `NetworkOnMainThreadExceptions` if called on the main thread. To avoid this issue, call the methods using `AsyncTask`.
