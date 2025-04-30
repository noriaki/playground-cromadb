---
title: 'Messaging API development guidelines | LINE Developers'
description: 'The LINE Developers site is a portal site for developers. It contains documents and tools that will help you use our various developer products. Creating LINE Login and Messaging API applications and services has never been easier!'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/messaging-api/development-guidelines/'
---

## Table of Contents

[Prohibited matters](#prohibited-matters)

[Don't send mass requests to the LINE Platform](#prohibiting-mass-requests-to-line-platform) [Don't do load testing through the LINE Platform](#prohibiting-line-platform-load-tests) [Don't send mass messages to the same user](#prohibiting-mass-transmissions-to-same-user) [Don't send requests to invalid user IDs](#prohibiting-requests-for-non-existent-user-ids) [Don't try to identify user attributes](#prohibiting-identify-users-attribute) [Don't restrict access by IP address](#prohibiting-ip-address-restrictions)

[Recommended matters](#recommended-matters)

[Recommended processing on receipt of unsend event](#webhook-unsend-message) [Recommendation for implementation assuming non-breaking feature additions](#assume-non-breaking-changes) [Save logs](#save-logs)

# [#](#page-title) Messaging API development guidelines

Before you start with bot development, learn what is recommended and prohibited in regards to developing a bot with the Messaging API.

**Prohibited matters**

- [Don't send mass requests to the LINE Platform](#prohibiting-mass-requests-to-line-platform)
- [Don't do load testing through the LINE Platform](#prohibiting-line-platform-load-tests)
- [Don't send mass messages to the same user](#prohibiting-mass-transmissions-to-same-user)
- [Don't send requests to invalid user IDs](#prohibiting-requests-for-non-existent-user-ids)
- [Don't try to identify user attributes](#prohibiting-identify-users-attribute)
- [Don't restrict access by IP address](#prohibiting-ip-address-restrictions)

**Recommended matters**

- [Recommended processing on receipt of unsend event](#webhook-unsend-message)
- [Recommendation for implementation assuming non-breaking feature additions](#assume-non-breaking-changes)
- [Save logs](#save-logs)

> [!warning]
> Note
>
> The basic rules for bot development are based on the [terms and policies](../../../en/terms-and-policies.md).

## [#](#prohibited-matters) Prohibited matters

### [#](#prohibiting-mass-requests-to-line-platform) Don't send mass requests to the LINE Platform

Don't send a large number of requests to the LINE Platform for load test or operation test. In all cases, keep the number of requests under the specified [rate limits](../../../en/reference/messaging-api.md#rate-limits). If you send requests more than the rate limit, you'll get a `429 Too Many Requests` error.

> [!warning]
> Operation tests within rate limits
>
> Even if you keep the rate limit, don't send these kinds of requests at a high frequency:
>
> - Repeatedly creating and deleting [audiences](../../../en/docs/messaging-api/using-audience.md#create-audience) even though they're not actually used for sending narrowcast messages
> - Repeatedly making requests that don't use the Messaging API features

### [#](#prohibiting-line-platform-load-tests) Don't do load testing through the LINE Platform

The LINE Platform doesn't have a service for load testing bot servers. Don't send large numbers of messages through the LINE Platform to load test your bot servers. Prepare a separate environment dedicated for load testing bot servers.

### [#](#prohibiting-mass-transmissions-to-same-user) Don't send mass messages to the same user

In all cases, don't send too many messages to the same user.

### [#](#prohibiting-requests-for-non-existent-user-ids) Don't send requests to invalid user IDs

Don't send a request to a [user ID](../../../en/glossary.md#user-id) that doesn't exist.

### [#](#prohibiting-identify-users-attribute) Don't try to identify user attributes

Don't try to identify user [attributes](../../../en/reference/messaging-api.md#narrowcast-demographic-filter) for a specific user ID. Also, don't use the [Managing Audience](../../../en/reference/messaging-api.md#manage-audience-group) API or send [narrowcast messages](../../../en/reference/messaging-api.md#send-narrowcast-message) to identify user attributes.

### [#](#prohibiting-ip-address-restrictions) Don't restrict access by IP address

On bot servers that receive webhooks, don't restrict access that sends webhook requests by the IP address of the LINE Platform. Instead of access control by IP address, use [signature validation](../../../en/reference/messaging-api.md#signature-validation) to deny requests from unauthorized sources. This is because we don't disclose the IP addresses of the LINE Platform. Also, IP addresses are subject to change without notice.

## [#](#recommended-matters) Recommended matters

### [#](#webhook-unsend-message) Recommended processing on receipt of unsend event

When a user unsends a sent message, an [unsend event](../../../en/reference/messaging-api.md#unsend-event) is sent to the bot server.

When the unsend event is received, we recommend that service providers respect the user's intent to unsend a sent message and handle the message appropriately with the utmost care so that the target message can't be seen or used in the future.

For more information, see [Processing on receipt of unsend event](../../../en/docs/messaging-api/receiving-messages.md#webhook-unsend-message).

### [#](#assume-non-breaking-changes) Recommendation for implementation assuming non-breaking feature additions

In the Messaging API, non-breaking feature additions may be made. These changes are intended to expand the API without breaking existing features. Therefore, the following types of changes may be made without advance notice:

- Adding new endpoints
- Adding optional parameters, fields, and headers to API requests
- Adding fields and headers to API responses
- Adding properties to webhook event objects
- Changing the order of properties in API responses and webhook event objects
- Adding enumerated values (Example: Adding the value of the `type` property of the [webhook event object](../../../en/reference/messaging-api.md#common-properties))
- Whether or not to include spaces or line breaks between data elements

Implement your bot server so that it will work without any problems even with these non-breaking feature additions.

### [#](#save-logs) Save logs

We recommend that you save logs for [Messaging API requests](#messaging-api-logs) you send and [webhooks](#webhook-logs) you received, for a period of time. These logs help you when you investigate the cause of a problem.

Helpful data to save in a log

In addition to the basic information to log as recommended in this section, this data can also help you. Consider saving this data depending on your bot requirements:

- Request body parameters of the Messaging API you call
- Response body returned by the LINE Platform for the API call
- Signature (`x-line-signature`) of the [request header](../../../en/reference/messaging-api.md#request-headers) when a webhook is sent from the LINE Platform
- [Webhook event object](../../../en/reference/messaging-api.md#webhook-event-objects) that the LINE Platform sent

> [!warning]
> We don't provide logs
>
> We don't provide logs for Messaging API requests or for webhooks sent from the LINE Platform even if you inquire. You are responsible to save logs.

#### [#](#messaging-api-logs) Save logs for Messaging API requests

We recommend that you log this information when you make a request to the Messaging API:

- Request ID (`x-line-request-id`) in the [Response header](../../../en/reference/messaging-api.md#response-headers)
- The time the API request was made
- HTTP method for the request
- API endpoint called
- [Status code](../../../en/reference/messaging-api.md#status-codes) returned by the LINE Platform

Save each data in a log file in the format like the below:

| Request ID (x-line-request-id)       | Time of API request           | HTTP method | API endpoint                            | Status code |
| ------------------------------------ | ----------------------------- | ----------- | --------------------------------------- | ----------- |
| 8e36bade-c5d6-4d00-9e69-72244675a9a1 | Mon, 05 Jul 2021 08:14:35 GMT | POST        | <https://api.line.me/v2/bot/message/push> | 200         |

#### [#](#webhook-logs) Save logs for webhooks received

We recommend that you log this information when your bot server receives a [webhook](../../../en/reference/messaging-api.md#webhooks) from the LINE Platform:

- IP address of the webhook sender
- The time the webhook was received
- HTTP method
- Request path
- Status code the bot server returned in [response](../../../en/reference/messaging-api.md#response) to the webhook received

Save each data in a log file in the format like the below:

| Sender IP address | Time webhook was received     | HTTP method | Request path     | Status code |
| ----------------- | ----------------------------- | ----------- | ---------------- | ----------- |
| 203.0.113.1       | Mon, 05 Jul 2021 08:10:00 GMT | POST        | /linebot/webhook | 200         |
