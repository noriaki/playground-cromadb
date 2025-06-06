---
title: 'Using Share buttons | LINE Developers'
description: 'You can easily create and add the Share button from LINE Social Plugins to the website of your choice. If you want to add this to iOS or Android native apps, we recommend that you use the Share with screen. For more information on how to add this screen, refer to the Using LINE Features with the LINE URL Scheme page.'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/line-social-plugins/install-guide/using-line-share-buttons/'
---

## Table of Contents

[About](#about)

[Using official LINE icons](#using-official-line-icons)

[Using custom icons](#using-custom-icons)

[Need more help?](#need-more-help)

# [#](#page-title) Using Share buttons

## [#](#about) About

You can easily create and add the Share button from LINE Social Plugins to the website of your choice. If you want to add this to iOS or Android native apps, we recommend that you use the "Share with" screen. For more information on how to add this screen, refer to the "[Using LINE Features with the LINE URL Scheme](../../../../en/docs/line-login/using-line-url-scheme.md)" page.

There are two ways to create the Share button. You can either create a button using the default designs provided by LY Corporation, or use your own design to create a custom icon.

## [#](#using-official-line-icons) Using official LINE icons

Follow the steps below to create a Share button using the default designs provided by LY Corporation. All you need to do is simply select a language, enter the URL of a webpage where you want to add the button, and select a design for the button.

1\. Select a language Select the language of the website where you want to add a button. The button will be created in the selected language.

English

日本語

한국어

中文

ภาษาไทย

Bahasa Indonesia

2\. Set URL Enter the URL of the website that you want to add this button to. Note that this will also be the webpage that will be shared when a user uses the Share button.

3\. Button type Select a design for the Share button.

![square-default](/media/line-social-plugins/square-default.png)

![square-grey](/media/line-social-plugins/square-grey.png)

![round-default](/media/line-social-plugins/round-default.png)

![round-grey](/media/line-social-plugins/round-grey.png)

![wide-default](/media/line-social-plugins/en/wide-default.png)

![wide-grey](/media/line-social-plugins/en/wide-grey.png)

4\. Size

Small

Large

5\. Share counter Choose whether you want to turn on the share counter and show the number of shares along with the Share button.

On

Off

Now you can see the code generated by the options you have selected if you read and agree to the LINE Social Plugins usage guidelines below. When you add the generated code to the DOM of your website, the code will be called by the DOMContentLoaded event. Make sure to insert the code to the location where you want to display this button. However, if you paste the code more than once to add multiple buttons to a single page, make sure to include a script tag only for the last button.

I agree to the LINE Social Plugins [guidelines](../../../../en/docs/line-social-plugins/general/guidelines.md).

Please carefully read and agree to the guidelines before using LINE Social Plugins. Once you agree, you can start enjoying the features provided by LINE Social Plugins.

## [#](#using-custom-icons) Using custom icons

You can see the link if you read and agree to the LINE Social Plugins usage guidelines below. You can create a Share button using your custom icon if you copy the link and apply it to your button.

I agree to the LINE Social Plugins [guidelines](../../../../en/docs/line-social-plugins/general/guidelines.md).

Please carefully read and agree to the guidelines before using LINE Social Plugins. Once you agree, you can start enjoying the features provided by LINE Social Plugins.

Tip

Example (URL: `https://line.me/en`), (Text: `text`)

`https://social-plugins.line.me/lineit/share?url=https%3A%2F%2Fline.me%2Fen&text=text`

Once the DOM tree is constructed and content is produced on your site, call `LineIt.loadButton()` to enable the Share button.

```
<script type="text/javascript">LineIt.loadButton();</script>
```

For custom icons, you can check the number of shares by following the steps below.

#### [#](#http-request) HTTP request

`GET https://api.line.me/social-plugin/metrics?url=https://line.me/en`

#### [#](#request-parameters) Request parameters

url

String

Required

The URL to get the share count for.  
(For example: `https://line.me/en`)

#### [#](#sample-request) Sample request

```
curl -X GET 'https://api.line.me/social-plugin/metrics?url=https://line.me/en'
```

#### [#](#sample-response) Sample response

```
{
    "share": "4173",
}
```

#### [#](#status-codes) Status codes

200

OK

The request succeeded.

400

Bad request

The request contains invalid parameters or values.

500

Internal Server Error

An internal server error occurred.

## [#](#need-more-help) Need more help?

- [FAQs](../../../../en/faq/tags/sp-share.md)
