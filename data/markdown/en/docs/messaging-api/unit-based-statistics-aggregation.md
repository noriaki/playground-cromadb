---
title: 'Get statistics of sent messages | LINE Developers'
description: 'The LINE Developers site is a portal site for developers. It contains documents and tools that will help you use our various developer products. Creating LINE Login and Messaging API applications and services has never been easier!'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/messaging-api/unit-based-statistics-aggregation/'
---

## Table of Contents

[What are message statistics](#about-message-statistics)

[Notes on aggregated statistics](#notes-about-message-statistics)

[Assign a unit name](#assign-names-to-units-when-sending-messages)

[Maximum number of unit name types](#limit-to-the-number-of-units)

[Get statistics per unit](#get-statistics-per-unit)

[Example of getting statistics of a message containing a URL](#get-statistics-of-a-message-containing-the-url)

[1\. Send a message by assigning a unit name](#get-statistics-of-a-message-containing-the-url-step-1) [2\. Get and aggregate statistics](#get-statistics-of-a-message-containing-the-url-step-2)

[Get statistics on narrowcast messages or broadcast messages](#get-statistics-on-narrowcast-or-broadcast)

# [#](#page-title) Get statistics of sent messages

You can get statistics per aggregation unit of how users interact with [push messages](../../../en/reference/messaging-api.md#send-push-message) and [multicast messages](../../../en/reference/messaging-api.md#send-multicast-message) you send to multiple users.

Normally, you can't get statistics about actions that users perform on messages, such as opening a message or tapping a URL, to protect user privacy. However, it is possible to get statistics by aggregating into units you define and making it impossible to identify individuals.

As illustrated below, you can get statistics for each unit by assigning a unit name and sending a message.

![customAggregationUnits_en](/assets/img/customAggregationUnits_en.7aee8be4.png)

## [#](#about-message-statistics) What are message statistics

You can get the following statistics per unit about your messages:

- Number of users who opened the message
- Number of users who opened any URL in the message
- Number of users who started playing any video or audio in the message

By getting message statistics, you can see what users have done with the messages you sent. By using such statistics, the following information can be checked:

**Example of using got statistics**

| Number of recipients | Number of openings | Opening rate | Number of URL taps | URL tap rate |
| -------------------- | ------------------ | ------------ | ------------------ | ------------ |
| 500                  | 433                | 87%          | 323                | 65%          |

### [#](#notes-about-message-statistics) Notes on aggregated statistics

The statistical data may contain some errors. To protect users' privacy, the values of some properties related to user interactions will be displayed as `null` in these cases:

- The value of the aggregated statistics is less than 20.
- Even if the value of the aggregated statistics is higher than or equal to 20, the actual number of users who generated the event is less than 20.
  - For example, if the number of times the video has been started is 30, but the number of users who have started the video is 15, both will be displayed as `null`.

## [#](#assign-names-to-units-when-sending-messages) Assign a unit name

To aggregate data, you must assign an aggregation unit name to push messages or multicast messages when you send the messages. To assign a unit name to a push or multicast message, specify the name in the `customAggregationUnits` property of the request body. You can only specify one unit name when you send the messages. For the specification on sending push messages or multicast messages, see [Message](../../../en/reference/messaging-api.md#messages) in the Messaging API reference.

Here is an example request to assign an aggregation unit name, `promotion_a`, on a push message:

```
curl -v -X POST https://api.line.me/v2/bot/message/push \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {channel access token}' \
-d '{
    "to": "U4af4980629...",
    "messages":[
        {
            "type": "text",
            "text": "Hello, world1"
        }
    ],
    "customAggregationUnits": [
        "promotion_a"
    ]
}'
```

Assigning or changing unit name later

You can't assign or change a unit name on a push message or multicast message after you send the message.

### [#](#limit-to-the-number-of-units) Maximum number of unit name types

During the current month (from the 1st to the last day of the month), you can send messages with up to 1,000 different unit names.

For example, if you send messages in March with 1,000 unit name types from `promotion_0001` to `promotion_1000`, you can send messages in the next month (April) with the same 1,000 unit name types from `promotion_0001` to `promotion_1000`. It is also possible to send messages with 1,000 new unit name types, from `promotion_1001` to `promotion_2000`, in the next month (April).

Note that when messages are sent with the 1,001st or later unit name type, those unit names are treated as if they weren't assigned to the messages. For example, if you send messages with 1,500 unit name types from `promotion_0001` to `promotion_1500`, the messages will be sent for the 1,001st unit name type after `promotion_1001`, but the unit names won't be assigned to the messages.

You can get the number of unit names assigned during this month by using the [Get the number of unit name types assigned during this month](../../../en/reference/messaging-api.md#get-the-number-of-unit-name-types-assigned-during-this-month) endpoint.

Regarding the unit name limit

There is a limit of "up to 1,000 unit name types in this month" when assigning unit names, but if you [get statistics per unit](#get-statistics-per-unit) after sending a message, you can get statistics for all units that exist from `from` to `to` for the period covered by the aggregation.

## [#](#get-statistics-per-unit) Get statistics per unit

You can get user interaction statistics for push messages and multicast messages sent with unit names by using the [Get statistics per unit](../../../en/reference/messaging-api.md#get-statistics-per-unit) endpoint. Here is an example request to get statistics of a unit named `promotion_a`:

```
curl -v -X GET https://api.line.me/v2/bot/insight/message/event/aggregation \
-H 'Authorization: Bearer {channel access token}' \
--data-urlencode 'customAggregationUnit=promotion_a' \
--data-urlencode 'from=20210301' \
--data-urlencode 'to=20210331' \
-G
```

In addition, you can get a list of unit names assigned in this month by using the [Get a list of unit names assigned during this month](../../../en/reference/messaging-api.md#get-a-list-of-unit-names-assigned-during-this-month) endpoint. There is no endpoint to check unit names assigned before the previous month.

## [#](#get-statistics-of-a-message-containing-the-url) Example of getting statistics of a message containing a URL

Here is an example of the steps to get statistics of a message containing a URL on a per unit:

### [#](#get-statistics-of-a-message-containing-the-url-step-1) 1. Send a message by assigning a unit name

First, send a message with the same content to multiple users.

![new-item-message-example-en](/assets/img/new-item-message-example-en.8cbfc7ec.png)

Suppose we want to send the message to 150 users using multicast messages. The unit name is then specified in the `customAggregationUnits` property.

```
curl -v -X POST https://api.line.me/v2/bot/message/multicast \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {channel access token}' \
-d '{
    "to": ["U4af4980629...","U0c229f96c4...",...], // 150 user IDs
    "messages":[
        {
            "type": "text",
            "text": "🆕 Our new product is available now!\nhttps://example.com/new-item/"
        }
    ],
    "customAggregationUnits": [
        "new-item-message-yyyymmdd"
    ]
}'
```

### [#](#get-statistics-of-a-message-containing-the-url-step-2) 2. Get and aggregate statistics

Wait a few days after sending the message to get statistics per unit.

```
curl -v -X GET https://api.line.me/v2/bot/insight/message/event/aggregation \
-H 'Authorization: Bearer {channel access token}' \
--data-urlencode 'customAggregationUnit=new-item-message-yyyymmdd' \
--data-urlencode 'from=20210301' \
--data-urlencode 'to=20210331' \
-G
```

In this example, the following statistics can be obtained:

```
{
  "overview": {
    "uniqueImpression": 111,
    "uniqueClick": 74,
    "uniqueMediaPlayed": null,
    "uniqueMediaPlayed100Percent": null
  },
  "messages": [
    {
      "seq": 1,
      "impression": 111,
      "uniqueImpression": 111,
      "mediaPlayed": null,
      "mediaPlayed25Percent": null,
      "mediaPlayed50Percent": null,
      "mediaPlayed75Percent": null,
      "mediaPlayed100Percent": null,
      "uniqueMediaPlayed": null,
      "uniqueMediaPlayed25Percent": null,
      "uniqueMediaPlayed50Percent": null,
      "uniqueMediaPlayed75Percent": null,
      "uniqueMediaPlayed100Percent": null
    }
  ],
  "clicks": [
    {
      "seq": 1,
      "url": "https://example.com/new-item/",
      "click": 74,
      "uniqueClick": 74,
      "uniqueClickOfRequest": 74
    }
  ]
}
```

You can use this information to check message open rates, URL tap rates, etc.

| Number of recipients | Number of openings | Opening rate | Number of URL taps | URL tap rate |
| -------------------- | ------------------ | ------------ | ------------------ | ------------ |
| 150                  | 111                | 74%          | 74                 | 67%          |

## [#](#get-statistics-on-narrowcast-or-broadcast) Get statistics on narrowcast messages or broadcast messages

By using the Get user interaction statistics endpoint, you can get statistics about how users interact with narrowcast messages or broadcast messages sent from your LINE Official Account. For more information, see [Get user interaction statistics](../../../en/reference/messaging-api.md#get-message-event) in the Messaging API reference.
