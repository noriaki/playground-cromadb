---
title: 'Using LINE SDK for other APIs and result handling | LINE Developers'
description: 'Using LINE SDK for other APIs and result handling'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/line-login-sdks/unity-sdk/using-sdk/'
---

## Table of Contents

[Calling LINE APIs with result handling](#calling-line-apis-with-result-handling)

[Getting user profile](#getting-user-profile)

[Logging out users](#logging-out-users) [Getting access token](#getting-access-token) [Verify and refresh access tokens](#verify-refresh-access-token)

# [#](#page-title) Using LINE SDK for other APIs and result handling

## [#](#calling-line-apis-with-result-handling) Calling LINE APIs with result handling

Every LINE SDK for Unity API operation that can fail, provides a `Result` object in the callback. By checking the result value, you can handle both the success and failure case elegantly:

```
LineSDK.Instance.Login(scopes, result => {
    result.Match(
        value => {
            Debug.Log("Login OK");
        },
        error => {
            Debug.Log("Login failed, error code: " + error.Code);
        }
    );
});
```

In the `error` branch, every `Error` object contains an error `Code`. The error code will be different for each platform. Learn more on these pages:

- [Handling errors for LINE SDK for iOS Swift](../../../../en/docs/line-login-sdks/ios-sdk/swift/error-handling.md)
- [Handling errors for LINE SDK for Android](../../../../en/docs/line-login-sdks/android-sdk/handling-errors.md)
- [Error API reference and definition for Swift](../../../../en/reference/ios-sdk-swift/Enums/LineSDKError.html.md)
- [Error API reference and definition for Android](../../../../en/reference/android-sdk/reference/com/linecorp/linesdk/LineApiResponseCode.html.md)

## [#](#getting-user-profile) Getting user profile

If the login request is sent with the `profile` scope, you can get the user's LINE profile information. The user profile includes the user ID, display name, profile media (image or video), and status message.

Call the `LineAPI.GetProfile` method as below:

```
LineAPI.GetProfile(result => {
    result.Match(
        value => {
            Debug.Log("User ID: " + value.UserId);
            Debug.Log("User Display Name: " + value.DisplayName);
            Debug.Log("User Status Message: " + value.StatusMessage);
            Debug.Log("User Icon: " + value.PictureUrl);
        },
        error => {
            Debug.Log(error.Message);
        }
    );
});
```

### [#](#logging-out-users) Logging out users

You can log out users from your app. To provide a better user experience, we recommend providing a way for users to log out of your app.

Call the `Logout` method to invalidate a user's access token and log them out of your app. After logging out, the user must go through the login process again to log in.

```
LineSDK.Instance.Logout(result => {
    result.Match(
        _ => { /* User logout done. Update UI. */ },
        error => {
            Debug.Log(error.Message);
        }
    );
});
```

### [#](#getting-access-token) Getting access token

Server-side code can make LINE Login API calls using access tokens. To learn more, see the [LINE Login v2.1 API reference](../../../../en/reference/line-login.md).

To get the current access token, get the `CurrentAccessToken` property of the `LineSDK` instance as below:

```
var currentToken = LineSDK.Instance.CurrentAccessToken;
if (currentToken != null) {
    Debug.Log("Current token value: " + currentToken.Value);
}
```

> [!warning]
> Note
>
> When sending access tokens to your server, we recommend encrypting the access token and using SSL to send the encrypted data. You should also verify that the access token received by your server matches the access token used to call LINE Login and that the channel ID matches the one for your channel.

### [#](#verify-refresh-access-token) Verify and refresh access tokens

`CurrentAccessToken` doesn't ensure the access token is valid, even if it returns a non-null value. The access token might already be expired or revoked. Use `LineAPI.VerifyToken` to check whether the current access token is still valid or not:

```
LineAPI.VerifyAccessToken(result => {
    result.Match(
        value => {
            Debug.Log("Channel Id bound to the token: " + value.ChannelId);
        },
        error => {
            Debug.Log("The token verifying failed: " + error.Message);
        }
    );
});
```

When making an API request through `LineAPI`, the LINE SDK automatically refreshes any expired access token. However, the refresh operation fails if the token has been expired for a long time. In that case, an error occurs and you need to have the user log in again.

We recommend not refreshing access tokens by yourself. It's easier and safer to let the LINE SDK automatically manage access tokens. However, you can manually refresh access tokens as below:

```
LineAPI.RefreshAccessToken(result => {
    result.Match(
        token => {
            Debug.Log("Token refreshed. New token: " + token.Value);
        },
        error => {
            Debug.Log("Something wrong when refreshing token: " + error.Message);
        }
    );
});
```
