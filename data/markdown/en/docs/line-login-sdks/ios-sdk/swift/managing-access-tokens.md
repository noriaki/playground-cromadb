---
title: 'Managing access tokens | LINE Developers'
description: 'The LINE Developers site is a portal site for developers. It contains documents and tools that will help you use our various developer products. Creating LINE Login and Messaging API applications and services has never been easier!'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/managing-access-tokens/'
---

## Table of Contents

[Refreshing access tokens](#refresh-token)

[Getting the current access token](#get-current-token)

[Verifying access tokens](#verify-access-token)

# [#](#page-title) Managing access tokens

This topic explains how to perform the following access token management tasks:

- [Refreshing access tokens](#refresh-token)
- [Getting the current access token](#get-current-token)
- [Verifying access tokens](#verify-access-token)

Creating a secure login process

For general recommendations on how to securely handle user registration and login, see [Creating a secure login process between your app and server](../../../../../en/docs/line-login/secure-login-process.md).

## [#](#refresh-token) Refreshing access tokens

The LINE SDK stores the user's valid access token after successful authorization and uses it to make API requests. You can get the expiration date of access tokens as below:

```
if let token = AccessTokenStore.shared.current {
    print("Token expires at:\(token.expiresAt)")
}
```

When making an API request through the `API` type, the LINE SDK automatically refreshes any expired access token. However, the refresh operation fails if the token has been expired for a long time. In that case, an error occurs and you need to have the user log in again. Read [Handling errors](../../../../../en/docs/line-login-sdks/ios-sdk/swift/error-handling.md) to learn more.

> [!warning]
> Access token auto-refresh
>
> Only the methods of the `API` type automatically refresh the access token. Methods of other types, such as `API.Auth`, don't trigger access token auto-refresh.

We recommend **not** refreshing access tokens yourself. It's easier and more future-proof to let LINE SDK automatically manage access tokens. However, if necessary, you can manually refresh access tokens like this:

```
API.Auth.refreshAccessToken { result in
    switch result {
    case .success(let token):
        print("Token Refreshed: \(token)")
    case .failure(let error):
        print(error)
    }
}
```

## [#](#get-current-token) Getting the current access token

When building a client-server application, use access tokens to send user data between your app and the server.

If you obtain an access token in your app and send it to a server, you can then make LINE Login API calls from that server.

To learn more, see the [LINE Login v2.1 API reference](../../../../../en/reference/line-login.md).

To get the access token that the LINE SDK has saved in your app, use the `current` property of the shared `AccessTokenStore` object as follows.

```
if let token = AccessTokenStore.shared.current {
    print(token.value)
}
```

> [!warning]
> Note
>
> When sending access tokens to your server, we recommend encrypting the token and using SSL to send the encrypted data. You should also verify that the access token received by your server matches the access token used to call the LINE Login and that the channel ID matches the one for your channel.

## [#](#verify-access-token) Verifying access tokens

Call the `API.Auth.verifyAccessToken` method to verify that the current access token is valid. This method returns a `AccessTokenVerifyResult` object that contains the result. If the token has been successfully verified, the response includes properties such as `channelID`, `permissions`, and `expiresIn`. Otherwise, the token is invalid, revoked, or expired, and an error is returned.

```
API.Auth.verifyAccessToken { result in
    switch result {
    case .success(let value):
        print(value.channelID) // Bound channel ID of the token.
        print(value.permissions) // The permissions of this token.
        print(value.expiresIn) // How long it is before the token expires.
    case .failure(let error):
        print(error)
    }
}
```
