---
title: 'Use rich menus | LINE Developers'
description: 'The LINE Developers site is a portal site for developers. It contains documents and tools that will help you use our various developer products. Creating LINE Login and Messaging API applications and services has never been easier!'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/messaging-api/using-rich-menus/'
---

## Table of Contents

[Set default rich menu](#set-default-rich-menu)

[1\. Prepare a rich menu image](#prepare-a-rich-menu-image) [2\. Create a rich menu](#create-a-rich-menu) [3\. Upload and attach the rich menu image](#upload-the-rich-menu-image) [4\. Set the default rich menu](#set-the-default-rich-menu)

[About per-user rich menu](#about-per-user-rich-menu)

# [#](#page-title) Use rich menus

This page explains how to set up a "default rich menu" that will be displayed to all users who have added your LINE official accounts as friends.

Rich menus can also be set with LINE Official Account Manager

You can also set a default rich menu from [LINE Official Account Manager (opens new window)](https://manager.line.biz/). For more information, see [Set rich menus with LINE Official Account Manager](../../../en/docs/messaging-api/rich-menus-overview.md#creating-a-rich-menu-with-the-line-manager).

- [Set default rich menu](#set-default-rich-menu)
  - [1\. Prepare a rich menu image](#prepare-a-rich-menu-image)
  - [2\. Create a rich menu](#create-a-rich-menu)
  - [3\. Upload and attach the rich menu image](#upload-the-rich-menu-image)
  - [4\. Set the default rich menu](#set-the-default-rich-menu)
- [About per-user rich menu](#about-per-user-rich-menu)

## [#](#set-default-rich-menu) Set default rich menu

To set a default rich menu with the Messaging API:

1. [Prepare a rich menu image](#prepare-a-rich-menu-image).
2. [Create a rich menu](#create-a-rich-menu) and specify tappable areas.
3. [Upload and attach the rich menu image](#upload-the-rich-menu-image).
4. [Set the default rich menu](#set-the-default-rich-menu).

### [#](#prepare-a-rich-menu-image) 1. Prepare a rich menu image

Prepare a rich menu image. You need to think about how you'll place the tap area on the rich menu image.

Here we use the following template image (`richmenu-template-guide-04.png`) for the rich menu. Save it in any directory.

![The template image for rich menus used in this guide](/assets/img/richmenu-template-guide-04.26866b84.png)

In the case of this image, it's assumed that three tap areas, A, B, and C, are defined.

Rich menu template images

You can download a template image for your rich menu from the [LINE Official Account Manager (opens new window)](https://manager.line.biz). From the page you create rich menus, click **Design guide**. You can log in to the LINE Official Account Manager with the same account you use for the [LINE Developers Console](../../../console.md).

For more information about image requirements, see [Requirements for rich menu image](../../../en/reference/messaging-api.md#upload-rich-menu-image-requirements) in the Messaging API reference.

### [#](#create-a-rich-menu) 2. Create a rich menu

Create a rich menu that matches the rich menu image we prepared in step 1. Make sure that the tap areas are correctly set to A, B, and C in the image.

When you [create a rich menu with the Messaging API](../../../en/reference/messaging-api.md#create-rich-menu), specify a [rich menu object](../../../en/reference/messaging-api.md#rich-menu-object) in the request body. Run this command in your terminal. The [URI action](../../../en/reference/messaging-api.md#uri-action) is specified to open different URLs in each of the A, B, and C tap areas.

```
curl -v -X POST https://api.line.me/v2/bot/richmenu \
-H 'Authorization: Bearer {channel access token}' \
-H 'Content-Type: application/json' \
-d \
'{
    "size": {
        "width": 2500,
        "height": 1686
    },
    "selected": false,
    "name": "Test the default rich menu",
    "chatBarText": "Tap to open",
    "areas": [
        {
            "bounds": {
                "x": 0,
                "y": 0,
                "width": 1666,
                "height": 1686
            },
            "action": {
                "type": "uri",
                "label": "Tap area A",
                "uri": "https://developers.line.biz/en/news/"
            }
        },
        {
            "bounds": {
                "x": 1667,
                "y": 0,
                "width": 834,
                "height": 843
            },
            "action": {
                "type": "uri",
                "label": "Tap area B",
                "uri": "https://lineapiusecase.com/en/top.html"
            }
        },
        {
            "bounds": {
                "x": 1667,
                "y": 844,
                "width": 834,
                "height": 843
            },
            "action": {
                "type": "uri",
                "label": "Tap area C",
                "uri": "https://techblog.lycorp.co.jp/en/"
            }
        }
    ]
}'
```

Tip

- To automatically open a rich menu linked to a user, set the `selected` property in the request body to `true`.
- To set the text of the chat bar, specify the `chatBarText` property in the request body.
- Before creating a rich menu, you can [check the validity](../../../en/reference/messaging-api.md#validate-rich-menu-object) of the [rich menu object](../../../en/reference/messaging-api.md#rich-menu-object).

If the rich menu was created successfully, the rich menu ID is returned in the response. We'll use the rich menu ID in the following steps.

```
{
  "richMenuId": "richmenu-88c05..."
}
```

### [#](#upload-the-rich-menu-image) 3. Upload and attach the rich menu image

[Upload and attach the image](../../../en/reference/messaging-api.md#upload-rich-menu-image) you prepared in step 1 to the rich menu you created in step 2. In your terminal, run the following command:

1. Move to the directory that contains the image you prepared in step 1.
2. Run this command after replacing `{richMenuId}` with the rich menu ID you obtained in step 2.

```
curl -v -X POST https://api-data.line.me/v2/bot/richmenu/{richMenuId}/content \
-H "Authorization: Bearer {channel access token}" \
-H "Content-Type: image/png" \
-T richmenu-template-guide-04.png
```

### [#](#set-the-default-rich-menu) 4. Set the default rich menu

Now that we've completed the preparations, let's set the display of the rich menu. Here, [set a default rich menu](../../../en/reference/messaging-api.md#set-default-rich-menu). Users who are friends with your LINE Official Account sees the default rich menu, unless the user isn't linked to a per-user rich menu. Run this command in your terminal.

```
curl -v -X POST https://api.line.me/v2/bot/user/all/richmenu/{richMenuId} \
-H "Authorization: Bearer {channel access token}"
```

#### [#](#check-the-rich-menu) 4-1. Check the rich menu displa

Check that the default rich menu set is displayed. Open the chat screen of the LINE Official Account for which you've set the rich menu. The rich menu created this time is displayed in a closed state, tap **Tap to open** to open the rich menu.

![default-rich-menu-example](/assets/img/default-rich-menu-example.73ae790e.png)

## [#](#about-per-user-rich-menu) About per-user rich menu

You can set a rich menu on a per-user basis using the Messaging API. For more information on per-user rich menus, see [Use per-user rich menus](../../../en/docs/messaging-api/use-per-user-rich-menus.md).
