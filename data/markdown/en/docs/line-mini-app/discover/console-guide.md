---
title: 'LINE Developers Console Guide for LINE MINI App | LINE Developers'
description: 'Basic structure and precautions of using LINE Developers Console for LINE MINI App.'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/line-mini-app/discover/console-guide/'
---

## Table of Contents

[LINE Developers Console for LINE MINI App](#line-developers-console-for-mini-app)

[Precautions for using LINE Developers Console for LINE MINI App](#precautions-for-using-line-developers-console-for-line-mini-app)

[Basic structure of a LINE MINI App channel](#basic-structure-of-a-line-mini-app-channel) [Confirm LIFF ID and set endpoint URL](#confirm-liff-id-and-set-endpoint-url) [Issuing a channel access token](#issuing-a-channel-access-token) [About configuring the company or owner's country or region](#configuring-country-or-region) [Entering Apple Developer Program information](#apple-developer-program) [When settings on the LINE Developers Console are reflected](#timing-of-settings-reflection) [Channel description](#channel-description)

[Differences in the behavior of the 3 LINE MINI Apps](#differences-in-the-behavior-of-the-3-line-mini-apps)

# [#](#page-title) LINE Developers Console Guide for LINE MINI App

Understand the basic structure and precautions of the [LINE Developers Console](../../../../console.md) before requesting a review.

- [LINE Developers Console for LINE MINI App](#line-developers-console-for-mini-app)
- [Precautions for using LINE Developers Console for LINE MINI App](#precautions-for-using-line-developers-console-for-line-mini-app)
  - [Basic structure of a LINE MINI App channel](#basic-structure-of-a-line-mini-app-channel)
  - [Confirm LIFF ID and set endpoint URL](#confirm-liff-id-and-set-endpoint-url)
  - [Issuing a channel access token](#issuing-a-channel-access-token)
  - [About configuring the company or owner's country or region](#configuring-country-or-region)
  - [Entering Apple Developer Program information](#apple-developer-program)
  - [When settings on the LINE Developers Console are reflected](#timing-of-settings-reflection)
  - [Channel description](#channel-description)
- [Differences in the behavior of the 3 LINE MINI Apps](#differences-in-the-behavior-of-the-3-line-mini-apps)

## [#](#line-developers-console-for-mini-app) LINE Developers Console for LINE MINI App

LINE Developers Console is a tool for developing and testing your LINE MINI App, as well as for submitting LINE MINI Apps for the verification review to make them verified MINI Apps. Currently, LINE Developers Console for LINE MINI App can be used by anyone who is permitted customers in the [LINE MINI App Policy (opens new window)](https://terms2.line.me/LINE_MINI_App?lang=en) if your service area is Japan. If your service area is Taiwan or Thailand, only those who have been approved by our local subsidiary can use the console.

## [#](#precautions-for-using-line-developers-console-for-line-mini-app) Precautions for using LINE Developers Console for LINE MINI App

The following outlines the differences between a LINE MINI App which is configured on a LINE MINI App channel and a LIFF app which is added to a LINE Login channel.

We recommend creating a LIFF app as a LINE MINI App

In the future, LIFF and the LINE MINI App will be integrated into a single brand. As a result of this integration, LIFF will be integrated into the LINE MINI App. For this reason, we recommend that you create a new LIFF app as a LINE MINI App. For more information, see the news from [February 12, 2025](../../../../en/news/2025/02/12/line-mini-app.md).

### [#](#basic-structure-of-a-line-mini-app-channel) Basic structure of a LINE MINI App channel

Unlike a LINE Login channel, a LINE MINI App channel has the following structural features:

When you create a LINE MINI App channel on the LINE Developers Console, three internal channels, **Developing**, **Review**, and **Published**, are created at the same time. Each internal channel has its own features and purpose. For more information on when the settings will be reflected, see [When settings on the LINE Developers Console are reflected](#timing-of-settings-reflection).

scrollable

| Internal channel | Usage                                                                  | Channel status            | Admin who can check the details of the internal channel                                                                                                                                                                    | Users that access the LINE MINI App                        |
| ---------------- | ---------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Developing       | Internal channel for developing and testing                            | Always "Developing"       | Only administrators who have accepted the permissions you grantedYou can check the settings on the LINE MINI App channel settings screen on the LINE Developers Console                                                    | Only testers who have accepted the permissions you granted |
| Review           | Internal channel that LY Corporation uses to review your LINE MINI App | "Developing" at all times | Administrators who have accepted the permissions you grantedYou can check the settings on the LINE MINI App channel settings screen on the LINE Developers ConsoleLY Corporation reviewers                                 | Only LY Corporation reviewers                              |
| Published        | Internal channel published to users                                    | "Published" at all times  | Only administrators who have accepted the permissions you grantedYou can check the information about the "Published" channel by clicking the Published Data button in the upper right corner of the LINE MINI App channel. | End users                                                  |

> [!warning]
> You can't change the channel status
>
> You can't change the status of the internal channels.

LINE MINI App Tester enrollment

In order to add a user to test the LINE MINI App, enroll them as a tester of the LINE MINI App channel. For more information, see [Managing roles](../../../../en/docs/line-developers-console/managing-roles.md).

### [#](#confirm-liff-id-and-set-endpoint-url) Confirm LIFF ID and set endpoint URL

In the LINE MINI App Channel, one LINE MINI App (LIFF app) is added to each internal channel. Confirm the unique **LIFF ID** and specify the **Endpoint URL** for each internal channel, and deploy the LIFF app to each endpoint URL.

- Prior to requesting review, deploy the "Review" LIFF app to the endpoint URL for "Review".
- When publishing the LINE MINI App, deploy the "Published" LIFF app to the endpoint URL for "Published".

You can specify the URL with basic authentication in the **Endpoint URL** for **Developing** or **Review**. For more information, see [Use basic authentication to restrict access to your LINE MINI App before it is released](../../../../en/docs/line-mini-app/develop/develop-overview.md#use-basic-authentication).

> [!warning]
> Each internal channel has a different LIFF ID
>
> - When you call the [`liff.init()`](../../../../en/reference/liff.md#initialize-liff-app) method on the LINE MINI App, specify a different LIFF ID for each internal channel. For example, when you execute initialization from the "Review" channel, use `liff.init()` to specify the LIFF ID of the Review channel before initializing it. If you can't launch a LINE MINI App on all the internal channels, check whether the following two LIFF IDs match.
>   - LIFF ID issued for each internal channel
>   - LIFF ID specified in `liff.init()` when initializing the LIFF app
> - LIFF ID is included in the LIFF URL (e.g. `https://miniapp.line.me/{liffId}`). In other words, if you want to send a custom share message from a LIFF app, send the URL that corresponds to the LIFF app. For example, if you want to send a custom share message from LIFF for "Review", send the URL to share the LIFF app for "Review".
> - Multiple LIFF apps cannot be added (multiple LIFF IDs cannnot be issued) to a single internal channel

> [!warning]
> Differences between the \[LIFF\] tab of the LINE Login channel and the \[Web app settings\] tab of the LINE MINI App channel
>
> - From the **Web app settings** tab of the LINE MINI App channel, you can't add any LIFF apps other than the default LINE MINI App (LIFF app).
> - From the **Web app settings** tab of the LINE MINI App channel, you can't change settings for scope, add friend option, etc. for each LIFF app (internal channel).
> - From the **Web app settings** tab of the LINE MINI App channel, you can't configure **Module mode**.

Settings on the LINE Developers Console

The settings on the LINE Developers Console will be automatically reflected (copied) when they become necessary. For more information, see [When settings on the LINE Developers Console are reflected](#timing-of-settings-reflection).

> [!warning]
> LIFF URL for LINE MINI App has been changed
>
> As of [December 13, 2023](../../../../en/news/2023/12/13/change-of-liff-url-for-line-mini-app.md), the LIFF URL of the LINE MINI App has been changed to `https://miniapp.line.me/{liffId}`.
>
> If a user accesses existing `https://liff.line.me/{liffId}`, the LINE MINI App will also open. Therefore, you can continue to use the QR code that you've already issued.

### [#](#issuing-a-channel-access-token) Issuing a channel access token

Use a [stateless channel access token](../../../../en/docs/basics/channel-access-token.md#stateless-channel-access-token) for the LINE MINI App channel.

Issue a Channel access token for each internal channel on which the LINE MINI App (LIFF app) operates. Channel ID and Channel secret can be found under the **Channel basic settings** tab on the LINE Developers Console.

![Channel ID and Channel Secret](/assets/img/channel_id_secret.9cd78744.png)

> [!warning]
> Channel access token must be issued for each internal channel
>
> Don't specify the channel access token for the "Developing" LINE MINI App channel when sending Service Messages from the "Review" and "Published" LINE MINI Apps

> [!warning]
> Use of stateless channel access tokens is recommended
>
> [Long-lived channel access tokens](../../../../en/docs/basics/channel-access-token.md#long-lived-channel-access-token) and [channel access token with a user-specified expiration (Channel Access Token v2.1)](../../../../en/docs/basics/channel-access-token.md#user-specified-expiration) cannot be used for LINE MINI App channels.
>
> When developing LINE MINI Apps, either [stateless channel access tokens](../../../../en/docs/basics/channel-access-token.md#stateless-channel-access-token) or [short-lived channel access tokens](../../../../en/docs/basics/channel-access-token.md#short-lived-channel-access-token) can be used. Stateless channel access tokens are recommended among those two. Stateless channel access tokens have an unlimited number of issuances, so there is no need for the application to manage the token lifecycle.

### [#](#configuring-country-or-region) About configuring the company or owner's country or region

When creating a LINE MINI App channel, you must agree to the content of the **I represent and warrant that the region to provide the LINE MINI App and service company's country or region are the same.** checkbox. The country or region will be displayed to the end user in the channel consent screen.

![I represent and warrant that the region to provide the LINE MINI App and service company's country or region are the same.](/assets/img/configuring-country-or-region-en.3a60b5b6.png)

> [!warning]
> You can't edit the Company or owner's country or region for the existing LINE MINI App channels
>
> If you need to change, enter your wish to change the setting and the country or region which you want to change to in the **Reference materials for the review** section of the **Review request** tab when you apply for review.

### [#](#apple-developer-program) Entering Apple Developer Program information

In accordance with the [App Store Review Guidelines (opens new window)](https://developer.apple.com/app-store/review/guidelines/), the service provider or the company in charge of developing must be enrolled in the Apple Developer Program in order to publish LINE MINI Apps. There is an annual fee to enroll the Apple Developer Program.

On the **Business information** tab, under **Apple Developer Program information**, enter the information you registered with the Apple Developer Program. This information won't be made publicly available to users, but will be submitted in the event of a disclosure request from Apple regarding the LINE MINI App.

| Item           | Required | Description                                                                                                                                                                                                                                                    |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Developer name | Required | The name of the developer registered with the Apple Developer Program. If you're an individual, your name, or if you're a corporation, your corporation name. For more information, see What You Need To Enroll (opens new window) in Apple Developer Program. |
| Team ID        | Required | The Team ID registered in your membership details. For more information, see Locate your Team ID (opens new window) in Apple Developer.                                                                                                                        |

### [#](#timing-of-settings-reflection) When settings on the LINE Developers Console are reflected

When you create a LINE MINI App channel, the settings information you enter will be copied to the three internal channels.

If the LINE MINI App is an unverified MINI App, when you change the setting in the LINE Developers Console, the contents of the "Developing" channel will be reflected in the "Published" channel. However, the contents of the \[**Service message template**\] tab and \[**Channel consent simplification**\] on the \[**Web app settings**\] tab won't be reflected unless the LINE MINI App passes the verification review.

If the LINE MINI App is a verified MINI App, and if you change the channel name, scope of the LIFF app, add friend option, etc., only the settings on the "Developing" channel will change. Changes won't be reflected on the "Review" or "Published" channels. This is to allow you to freely change settings in the internal channel for "Developing" to ensure smooth development.

In the case of verified MINI Apps, the following table shows when the settings changed on the LINE Developers Console are reflected in "Review" and "Published".

| Internal channel | When settings are reflected                                                      |
| ---------------- | -------------------------------------------------------------------------------- |
| Developing       | Reflected when configured on the LINE Developers Console.                        |
| Review           | When review begins, settings from the Developing channel are reflected (copied). |
| Published        | When published, settings from the Developing channel are reflected (copied).     |

### [#](#channel-description) Channel description

The **Channel description** on the **Basic settings** tab is used for two purposes. For these purposes, provide the correct service description:

- To help users understand the contents of the LINE MINI App service.
- To understand the service contents of the LINE MINI App at the time of screening by LY Corporation.

![Channel description](/assets/img/line-mini-app-channel-description-en.1e2fa6ab.png)

Refer to the following table for input examples of **Channel description**.

|              | Channel name       | Channel description                                                                                                                      |
| ------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Bad example  | LINE FRIENDS STORE | LINE FRIENDS STORE is a store for LINE character goods.                                                                                  |
| Good example | LINE FRIENDS STORE | This is a mobile ordering service at the LINE FRIENDS STORE. You can order and pay in advance and receive your merchandise at the store. |

## [#](#differences-in-the-behavior-of-the-3-line-mini-apps) Differences in the behavior of the 3 LINE MINI Apps

Some screens are displayed differently in the "Developing" LINE MINI App, the "Review" LINE MINI App, and the "Published" LINE MINI App.

| LINE MINI App              | Header subtext (reference)                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Developing" LINE MINI App | The domain of the page you are viewing will be displayed at all times.                                                                                 |
| "Review" LINE MINI App     | The domain of the page you are viewing will be displayed at all times.                                                                                 |
| "Published" LINE MINI App  | In unverified MINI Apps, the domain of the page will be displayed. In verified MINI Apps, the LINE MINI App name and verified badge will be displayed. |
