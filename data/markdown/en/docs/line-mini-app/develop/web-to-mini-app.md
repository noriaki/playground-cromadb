---
title: 'Implementing web apps in operation as LINE MINI Apps | LINE Developers'
description: 'The LINE Developers site is a portal site for developers. It contains documents and tools that will help you use our various developer products. Creating LINE Login and Messaging API applications and services has never been easier!'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/line-mini-app/develop/web-to-mini-app/'
---

## Table of Contents

[What is LINE MINI App](#what-is-line-mini-app)

[Requirements](#requirements)

[Procedure for implementing a web app as a LINE MINI App](#procedure)

[1\. Create a LINE MINI App channel](#procedure-1) [2\. Load the LIFF SDK on the web app side](#procedure-2) [3\. Initialize the LIFF app](#procedure-3) [4\. Implement the necessary features](#procedure-4) [5\. Configure the LINE MINI App channel](#procedure-5) [6\. Request a review of your LINE MINI App](#procedure-6)

[Next step](#next-step)

# [#](#page-title) Implementing web apps in operation as LINE MINI Apps

If you want to implement your web app as a LINE MINI App, you may not know how to do it. This page provides an overview of LINE MINI Apps, as well as the knowledge and procedures required to implement your web app as a LINE MINI App. By reading this page, you will be able to get an overall picture of what it takes to implement a web app as a LINE MINI App.

- [What is LINE MINI App](#what-is-line-mini-app)
- [Requirements](#requirements)
- [Procedure for implementing a web app as a LINE MINI App](#procedure)
  - [1\. Create a LINE MINI App channel](#procedure-1)
  - [2\. Load the LIFF SDK on the web app side](#procedure-2)
  - [3\. Initialize the LIFF app](#procedure-3)
  - [4\. Implement the necessary features](#procedure-4)
  - [5\. Configure the LINE MINI App channel](#procedure-5)
  - [6\. Request a review of your LINE MINI App](#procedure-6)
- [Next step](#next-step)

## [#](#what-is-line-mini-app) What is LINE MINI App

First, the LINE MINI App is a web app that can be used within the LINE App and is implemented using the [LIFF (LINE Front-end Framework)](../../../../en/docs/liff/overview.md). Using LIFF features, your application can provide LINE users with a smooth login experience and retrieve user profiles.

In addition, the [service messages](../../../../en/docs/line-mini-app/develop/service-messages.md) feature allows the LINE MINI App to send notifications to the user in response to user actions on the LINE MINI App. Almost all HTML5 specifications are also supported, for example, the [Geolocation API (opens new window)](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) can be used to obtain the user's location information.

![product-image](/assets/img/product-image.e8bf6742.png)

As described above, by implementing the web app as a LINE MINI App, you can prevent users from leaving the app due to inconvenient logins and profile entries, etc. In addition, the use of the LINE MINI App can also be started immediately from the LINE app, and all operations can be performed in the LINE app, so this can improve the user experience.

Comparison between LINE MINI Apps and native apps

For more information on the advantages of LINE MINI Apps over native apps, see [comparison article between native apps and LINE MINI Apps (opens new window)](https://lineapiusecase.com/ja/api/native-mini.html) (only available in Japanese) in the LINE API Use Case.

## [#](#requirements) Requirements

What are the requirements for implementing an operational web app as a LINE MINI App? First, we will explain the requirements for implementing a web app as a LINE MINI App.

In order to implement a web app as a LINE MINI App, the following are required:

- Knowledge and technologies to develop and publish a web app
- A LINE Business ID

LINE MINI Apps are web apps that run on the LINE App. For this reason, the knowledge and technology used when developing the web app in operation can be used as is. For example, knowledge of HTML, CSS and JavaScript, and development environments such as text editors are useful. You will also continue to need a web server for publishing the web app.

In addition, when developing LINE MINI Apps, the [LINE Developers Console](../../../../console.md) is used. For this reason, you will need a LINE Business ID, which is required for the LINE Developers Console. For more information on the LINE Business ID, see [Log in to LINE Developers](../../../../en/docs/line-developers-console/login-account.md) in the LINE Developers Console documentation.

## [#](#procedure) Procedure for implementing a web app as a LINE MINI App

We will now explain the specific steps involved in implementing a web app as a LINE MINI App. Here we will look at an example of linking a web app in operation that handles user information with a LINE account.

1. Create a LINE MINI App channel
2. Load the LIFF SDK on the web app side
3. Initialize the LIFF app
4. Implement the necessary features
5. Configure the LINE MINI App channel
6. Request a review of your LINE MINI App

Each of these steps is explained below.

### [#](#procedure-1) 1. Create a LINE MINI App channel

To publish your LINE MINI Apps to users, you will need a [channel](../../../../en/glossary.md#channel) called LINE MINI App channel. To get started, log in to the [LINE Developers Console](../../../../console.md) and create a LINE MINI App channel. For more information on how to create a LINE MINI App channel, see [LINE Developers Console Guide for LINE MINI App](../../../../en/docs/line-mini-app/discover/console-guide.md).

### [#](#procedure-2) 2. Load the LIFF SDK on the web app side

The LINE MINI App runs as a LIFF app that uses the [LIFF (LINE Front-end Framework)](../../../../en/docs/liff/overview.md). For this reason, it is first necessary to load the LIFF SDK on the web app side.

There are two ways to load the LIFF SDK, from a CDN or using the npm package. For example, to load the LIFF SDK from the CDN, write the following code:

```
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
```

For more information on loading the LIFF SDK, see [Integrating the LIFF SDK with the LIFF app](../../../../en/docs/liff/developing-liff-apps.md#integrating-sdk) in the LIFF documentation.

### [#](#procedure-3) 3. Initialize the LIFF app

To use the LIFF SDK, you need to initialize your LIFF app by executing the method `liff.init()`. At this time, specify the LIFF ID, which can be found in the LINE MINI App channel created in step 1. For more information on how to check the LIFF ID, see [Confirm LIFF ID and set endpoint URL](../../../../en/docs/line-mini-app/discover/console-guide.md#confirm-liff-id-and-set-endpoint-url).

To initialize the LIFF app using `liff.init()`, implement the following code:

```
liff
  .init({
    liffId: "123456-abcdefg", // Specify LIFF ID
  })
  .then(() => {
    // Use the LIFF API
  })
  .catch((err) => {
    // When an error occurs during initialization
    console.log(err.code, err.message);
  });
```

### [#](#procedure-4) 4. Implement the necessary features

At this point, you are ready to implement the features. The next step is to implement the required features. The following features and specifications can be used in the LINE MINI Apps:

- LIFF API
- Service messages
- HTML5 specifications

Each of these is explained below.

#### [#](#procedure-4-liff-api) LIFF API

Once you have initialized your LIFF app, you can use the LIFF API to implement the features you need. The LIFF API allows you to handle user logins and retrieve user profiles. For example, to get a user ID, first get an ID token with `liff.getIDToken()`.

```
const idToken = liff.getIDToken();
```

This `idToken` is sent to the server side, where it can be verified by the [Verify ID token](../../../../en/reference/line-login.md#verify-id-token) endpoint to obtain the user ID. For example, by linking the obtained user ID with the membership information of the web app in operation, it is possible to deliver messages optimized for the user.

For more information on the LIFF API, see [Calling the LIFF API](../../../../en/docs/liff/developing-liff-apps.md#calling-liff-api) in the LIFF documentation.

#### [#](#procedure-4-service-message) Service messages

The LINE MINI App has a feature called service messages. Service messages allow the LINE MINI App to send notifications to users in response to their actions on the LINE MINI App. For more information on service messages, see [Sending service messages](../../../../en/docs/line-mini-app/develop/service-messages.md).

#### [#](#procedure-4-html5) HTML5 specifications

The LINE MINI App supports almost all HTML5 specifications. For example, the [Geolocation API (opens new window)](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) can be used to retrieve the user's location information. For more information on the specifications of the LINE Mini App, see [Specifications](../../../../en/docs/line-mini-app/discover/specifications.md).

### [#](#procedure-5) 5. Configure the LINE MINI App channel

Once the implementation of the LIFF app is complete, the next step is to enable it to operate as a LINE MINI App. To do this, the URL of the LIFF app must be set as the endpoint URL in the LINE MINI App channel created in step 1. For more information on setting the endpoint URL, see [Confirm LIFF ID and set endpoint URL](../../../../en/docs/line-mini-app/discover/console-guide.md#confirm-liff-id-and-set-endpoint-url).

### [#](#procedure-6) 6. Request a review of your LINE MINI App

Once you have completed the above steps, all that remains is to publish your LINE MINI App to users. In order to publish your LINE MINI App to users, it must pass a review by LY Corporation. For more information on the review process, see [Submitting LINE MINI App](../../../../en/docs/line-mini-app/submit/submission-guide.md).

## [#](#next-step) Next step

When developing a LINE MINI App, see [LINE MINI App development guidelines](../../../../en/docs/line-mini-app/development-guidelines.md). These guidelines include points to consider when sending requests to the LINE Platform and about saving logs.

In addition, the section [Custom Features](../../../../en/docs/line-mini-app/discover/custom-features.md) describes features that can further improve the user experience. For example, there is a feature to add a shortcut to the LINE MINI App on the home screen of the user's device.
