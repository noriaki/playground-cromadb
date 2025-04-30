---
title: 'Best practices for provider and channel management | LINE Developers'
description: 'The LINE Developers site is a portal site for developers. It contains documents and tools that will help you use our various developer products. Creating LINE Login and Messaging API applications and services has never been easier!'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/line-developers-console/best-practices-for-provider-and-channel-management/'
---

## Table of Contents

[Characters](#characters)

[Grant admin roles to several developers for each provider and each channel](#grant-admin-roles-to-several-developers)

[Create a provider for each service provider](#create-provider-for-each-service-provider)

[Create channels that you want to link under the same provider](#create-channels-under-the-same-provider)

[Create channels by region where you provide services](#create-channels-by-region)

[Register a mailing list email address in Email address on the Basic settings tab](#register-mailing-list-email-address)

# [#](#page-title) Best practices for provider and channel management

This page explains best practices for provider and channel management.

- [Characters](#characters)
- [Grant admin roles to several developers for each provider and each channel](#grant-admin-roles-to-several-developers)
- [Create a provider for each service provider](#create-provider-for-each-service-provider)
- [Create channels that you want to link under the same provider](#create-channels-under-the-same-provider)
- [Create channels by region where you provide services](#create-channels-by-region)
- [Register a mailing list email address in Email address on the Basic settings tab](#register-mailing-list-email-address)

## [#](#characters) Characters

The following hypothetical organizations and characters are used as examples:

| organizations, characters | description                                                                                                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Beverage Manufacturer A   | A beverage manufacturer that offers the coffee beverage "Brown Coffee" and the tea beverage "Cony Tea". It outsources the development of services using the LINE Platform to Development Company C and Development Company D.                       |
| Beverage Manufacturer B   | A beverage manufacturer that offers the cola beverage "Sally Cola". The US subsidiary of Beverage Manufacturer A.                                                                                                                                   |
| Development Company C     | A development company outsourced by Beverage Manufacturer A to develop services using the LINE Platform. It is developing a campaign site for the coffee beverage "Brown Coffee" using the LINE Login.                                              |
| Development Company D     | A development company outsourced by Beverage Manufacturer A to develop services using the LINE Platform. It is developing a LINE Bot for the coffee beverage "Brown Coffee" and a LINE Bot for the tea beverage "Cony Tea" using the Messaging API. |
| Brown                     | An employee of Beverage Manufacturer A.                                                                                                                                                                                                             |
| Cony                      | An employee of Beverage Manufacturer A.                                                                                                                                                                                                             |

Assume that Beverage Manufacturer A manages the provider "Beverage Manufacturer A" and the channels under the provider. The channels under the provider "Beverage Manufacturer A" are as follows:

| Channel type  | Channel name | Description                                                           |
| ------------- | ------------ | --------------------------------------------------------------------- |
| LINE Login    | Brown Coffee | A channel for a campaign site for the coffee beverage "Brown Coffee". |
| Messaging API | Brown Coffee | A channel for a LINE Bot for the coffee beverage "Brown Coffee".      |
| Messaging API | Cony Tea     | A channel for a LINE Bot for the tea beverage "Cony Tea".             |

## [#](#grant-admin-roles-to-several-developers) Grant admin roles to several developers for each provider and each channel

| dummy        | dummy                                                                       |
| ------------ | --------------------------------------------------------------------------- |
| Good example | Grant admin roles to several developers for each provider and each channel. |
| Bad example  | Grant admin roles to only one developer for each provider and each channel. |

If the only developer with an admin role for providers and channels is no longer available due to sudden resignation or other reasons, the providers and the channels can't be accessed with an admin role. As a result, it may become difficult to continue operating the providers and the channels. To prepare for such unexpected situations, grant admin roles to several developers for each provider and each channel.

For example, suppose Brown and Cony have admin roles for the provider "Beverage Manufacturer A" and the LINE Login channel "Brown Coffee". Even if Brown suddenly resigns, Cony also has the admin roles and can continue to operate the provider and channel without any problems.

![grant-admin-role-to-several-developers-en](/assets/img/grant-admin-role-to-several-developers-en.b70d56c5.png)

Note that provider and channel roles are independent, so granting an admin role for a provider doesn't mean that admin roles have been granted for the channels under the provider.

For more information about roles, see [Managing roles](../../../en/docs/line-developers-console/managing-roles.md).

> [!warning]
> Notes on deleting developers from a provider
>
> When deleting developers from a provider on the [LINE Developers Console](../../../console.md), if you check **Also delete the selected developer(s) from the channels that belong to this provider.** and click **OK**, the selected developers will be deleted from the channels under the provider.
>
> However, as a result of deleting the selected developers from the channels under the provider might leave zero developers with an admin role for the channel. Therefore, if you check **Also delete the selected developer(s) from the channels that belong to this provider.**, make sure that there are other developers with admin roles for the channels.
>
> ![delete-developer-from-provider-en](/assets/img/delete-developer-from-provider-en.6e8390d7.png)

## [#](#create-provider-for-each-service-provider) Create a provider for each service provider

| dummy        | dummy                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| Good example | Create a provider for Beverage Manufacturer A and a provider for Beverage Manufacturer B, respectively. |
| Bad example  | Create one provider for Beverage Manufacturer A and Beverage Manufacturer B.                            |

A service provider (service company in the LINE MINI App) is an individual developer, company, or organization that provides services and obtains user information. A service provider is registered as a provider in the [LINE Developers Console](../../../console.md). Therefore, create a provider for each service provider.

For example, suppose Beverage Manufacturer B, the US subsidiary of Beverage Manufacturer A, wants to develop a LINE Bot for "Sally Cola". In this case, instead of creating a Messaging API channel under the provider "Beverage Manufacturer A", Beverage Manufacturer B creates a provider for itself and creates a Messaging API channel under the provider.

![create-provider-for-each-service-provider-1-en](/assets/img/create-provider-for-each-service-provider-1-en.2a6bbb69.png)

If a company (outsourcer) outsources the development of services using the LINE Platform to other companies, a provider should be created for the outsourcer as the main service provider.

For example, Beverage Manufacturer A outsources the development of services using the LINE Platform to Development Company C and Development Company D, respectively. In this case, the main service provider is Beverage Manufacturer A, which is an outsourcer. Therefore, instead of creating a provider for Development Company C or Development Company D, a provider should be created for Beverage Manufacturer A, and channels should be created under the provider.

![create-provider-for-each-service-provider-2-en](/assets/img/create-provider-for-each-service-provider-2-en.8de6b1eb.png)

## [#](#create-channels-under-the-same-provider) Create channels that you want to link under the same provider

| dummy        | dummy                                                            |
| ------------ | ---------------------------------------------------------------- |
| Good example | Create channels that you want to link under the same provider.   |
| Bad example  | Create channels that you want to link under different providers. |

If you develop a service that links multiple channels, create channels that you want to link under the same provider. By creating channels under the same provider, the same [user ID](../../../en/glossary.md#user-id) is assigned to the same user in each channel. Channels can't be moved to a different provider later, so be careful not to create channels that you want to link under different providers.

For example, to encourage users to add the LINE Bot for "Cony Tea" as a friend using [add friend option](../../../en/docs/line-login/link-a-bot.md) when the users log in to the campaign site for "Brown Coffee", create the LINE Login channel for "Brown Coffee" and the Messaging API channel for "Cony Tea" under the provider "Beverage Manufacturer A".

![create-channels-under-the-same-provider-en](/assets/img/create-channels-under-the-same-provider-en.743bcac5.png)

Note that when using the LINE Platform for multiple services, you must publish the provider page and comply with the terms and conditions of use to link the LINE user data obtained from each service. For more information, see Cautions on the common use of user IDs in Options for corporate customers documentation.

## [#](#create-channels-by-region) Create channels by region where you provide services

| dummy        | dummy                                                         |
| ------------ | ------------------------------------------------------------- |
| Good example | Create channels by region where you provide services.         |
| Bad example  | Use a single channel to provide services to multiple regions. |

If you provide services in multiple countries or regions under the same brand, create separate channels for each region instead of sharing a single channel.

For example, assume that Beverage Manufacturer A operates a campaign website for its coffee drink "Brown Coffee" in Japan, and decides to launch campaign websites for the same product in Taiwan and Thailand. In this case, create separate LINE Login channels for each region under the provider "Beverage Manufacturer A".

![create-channels-by-region-en](/assets/img/create-channels-by-region-en.a690decd.png)

## [#](#register-mailing-list-email-address) Register a mailing list email address in Email address on the Basic settings tab

| dummy        | dummy                                                                             |
| ------------ | --------------------------------------------------------------------------------- |
| Good example | Register a mailing list email address in Email address on the Basic settings tab. |
| Bad example  | Register a personal email address in Email address on the Basic settings tab.     |

You receive important announcements at the email address registered in **Email address** on the **Basic settings** tab of each channel. For this reason, register a mailing list email address, not a personal email address, in this **Email address**.

For example, on the **Basic settings** tab of the LINE Login channel "Brown Coffee", register the mailing list email address of the department to which Brown and Cony belong in **Email address**. This will allow the department to receive important announcements about the channel even when Brown and Cony are out of the office.

Important announcements about your channels can also be received at the email addresses of developers who have channel roles, or at the notification center. For more information, see [Receive notifications via email or the notification center](../../../en/docs/line-developers-console/notification.md).
