---
title: 'Trying the LIFF starter app | LINE Developers'
description: 'The LINE Developers site is a portal site for developers. It contains documents and tools that will help you use our various developer products. Creating LINE Login and Messaging API applications and services has never been easier!'
date: '2025-04-16'
source_url: 'https://developers.line.biz/en/docs/liff/trying-liff-app/'
---

## Table of Contents

[What is the LIFF starter app?](#what-is-liff-starter-app)

[How to get started with the LIFF starter app](#how-to-start-liff-starter-app)

[Environment](#environment) [Downloading and running the source code](#download-run-source-code) [Deploying to a server](#deploy-to-server) [Getting and Setting a LIFF ID](#get-and-set-liff-id)

[Next step](#next-step)

# [#](#page-title) Trying the LIFF starter app

When you're new to learning about LIFF, you may not know how to get started with LIFF app development. In this case the [LIFF starter app (opens new window)](https://github.com/line/line-liff-v2-starter) can help.

The LIFF starter app is a template with the minimum features required for LIFF app development. You can develop your own LIFF app by customizing it based on the LIFF starter app. This page describes the LIFF starter app in the following steps:

- [What is the LIFF starter app?](#what-is-liff-starter-app)
- [How to get started with the LIFF starter app](#how-to-start-liff-starter-app)
  - [Environment](#environment)
  - [Downloading and running the source code](#download-run-source-code)
  - [Deploying to a server](#deploy-to-server)
  - [Getting and Setting a LIFF ID](#get-and-set-liff-id)
- [Next step](#next-step)

By reading this page, you'll be able to deploy a LIFF app on a server and experience opening a LIFF app on LINE, which will give you an idea of how to build an app using LIFF.

Before trying the LIFF starter app

- For more information about LIFF, see [Overview](../../../en/docs/liff/overview.md).
- If you would like to try out the LIFF features online, use the [LIFF Playground (opens new window)](https://liff-playground.netlify.app/) to see what you can do with LIFF. [The source code for LIFF Playground (opens new window)](https://github.com/line/liff-playground) is available on GitHub, so developers can set their LIFF ID and run their own LIFF Playground. For example, each client API such as [`liff.login()`](../../../en/reference/liff.md#login) or [`liff.getProfile()`](../../../en/reference/liff.md#get-profile) can be run on the web based on the developer's LIFF ID.

## [#](#what-is-liff-starter-app) What is the LIFF starter app?

The LIFF starter app is a template for LIFF apps. You can create LIFF apps from scratch, but using the LIFF starter app will give you a faster development experience.

The LIFF starter app provides implementations in vanilla JavaScript as well as Next.js and Nuxt. Each repository is as follows:

- [Implementation using vanilla JavaScript (opens new window)](https://github.com/line/line-liff-v2-starter/tree/master/src/vanilla)
- [Implementation using Next.js (opens new window)](https://github.com/line/line-liff-v2-starter/tree/master/src/nextjs)
- [Implementation using Nuxt (opens new window)](https://github.com/line/line-liff-v2-starter/tree/master/src/nuxtjs)

You can start developing LIFF apps by following the README of each repository. This page explains how to start developing LIFF apps with vanilla JavaScript.

## [#](#how-to-start-liff-starter-app) How to get started with the LIFF starter app

The goal of this section is to deploy the LIFF starter app on a server and open it on the LINE's [LIFF browser](../../../en/glossary.md#liff-browser). The first step is to check the LIFF app in a local environment. Then deploy the LIFF app on a server, and finally set a value called LIFF ID to the server side.

### [#](#environment) Environment

The LIFF starter app runs on Node.js. Also, Yarn is used for package management. The content of this page, including the Netlify CLI described below, has been tested with each of the following versions:

| Name                           | Version |
| ------------------------------ | ------- |
| Node.js (opens new window)     | 16.13.1 |
| Yarn (opens new window)        | 1.22.17 |
| Netlify CLI (opens new window) | 9.16.3  |

### [#](#download-run-source-code) Downloading and running the source code

1. First of all, download the source code of the LIFF starter app. Open a terminal or command line tool (hereinafter referred to as "terminal"). On any directory, run the following command:

    ```
    git clone https://github.com/line/line-liff-v2-starter.git
    ```

2. In the `src` directory of the downloaded source code (`line-liff-v2-starter` directory), you'll find LIFF apps implemented with vanilla JavaScript, Next.js, and Nuxt. Go to the directory of the implementation you want to use. In this case, we'll use vanilla JavaScript.

    ```
    cd line-liff-v2-starter/src/vanilla
    ```

    If you want to use Next.js or Nuxt

    If you want to use Next.js, run `cd line-liff-v2-starter/src/nextjs/`, and if you want to use Nuxt, run `cd line-liff-v2-starter/src/nuxtjs/` to go to each directories.

3. The next step is to install the dependency packages and then launch the LIFF app. Execute the `yarn install` command to install and the `yarn dev` command to launch the LIFF app. When the compile success message (`compiled successfully`) appears and the terminal screen output stops, the LIFF app is running on the local server.

    ```
    yarn install
    yarn dev
    ```

4. When you access the URL (`http://localhost:3000` for vanilla JavaScript) displayed in the terminal with a browser, you'll see the following screen.

    ![LIFF app](/assets/img/screenshot-pc.db885252.png)

    > [!warning]
    > You'll need to set up a LIFF ID
    >
    > You'll need to set the LIFF ID as an environment variable, but we haven't done that yet. You can set the LIFF ID in [Getting and Setting a LIFF ID](#get-and-set-liff-id).

5. Once you've confirmed that the LIFF app is running in your browser, stop the local server with ctrl+c for Windows or command+c for macOS.

### [#](#deploy-to-server) Deploying to a server

By following the steps so far, we've been able to launch the LIFF starter app on the local server. The next step is to deploy the LIFF app to a server using Netlify.

A Netlify account is required

[Netlify (opens new window)](https://www.netlify.com/) is a hosting service for static sites, open an account before deploying to Netlify. The content on this page can be run on Netlify's free plan.

1. The first step is to install the Netlify CLI. This is a command line tool that allows you to log in to Netlify and deploy your websites.

    ```
    npm install -g netlify-cli
    ```

2. You can now use the `netlify` command. Next, login to your Netlify account with the `netlify login` command. After executing the command, the Netlify login screen will open in your browser, so login.

    Before executing the netlify login command

    Open an account on the [Netlify (opens new window)](https://www.netlify.com/) site first, then run the `netlify login` command.

    ```
    netlify login
    ```

3. After logging in, when the Netlify authorization screen appears, click **Authorize**.

    ![Netlify authorization screen](/assets/img/netlify-authorized.7ef9424d.png)

4. The next step is to generate files for deployment. This can be done by executing the following command under the `src/vanilla` directory. Note that the LIFF starter app is built using [webpack (opens new window)](https://webpack.js.org/).

    ```
    yarn build
    ```

5. Now, HTML and JavaScript files have been generated under `src/vanilla/dist`. Then you need to deploy these files to Netlify.

    To deploy to Netlify, run the `netlify deploy` command in the root directory (`line-liff-v2-starter`) of the repository. Without the option, the `netlify deploy` command will deploy in a draft state. First, try to deploy in draft state.

    ```
    cd ../../      # Go to the root directory of the repository
    netlify deploy # Deploy in draft state
    ```

    After running the `netlify deploy` command, when asked for the site to deploy to as follows, select `Create & configure a new site`. You can use the up and down keys to move through the choices.

    ```
    This folder isn't linked to a site yet
    ? What would you like to do?
    Link this directory to an existing site
    ❯ +  Create & configure a new site # Create and configure a new site
    ```

    You will be asked which team you want to create the site under. Continue with the default team.

    ```
    ? Team: (Use arrow keys)
    ❯ testlinedevelopers's team # Continue with the default team
    ```

    You will be asked what you want to name the site. Enter a unique name.

    ```
    ? Site name (optional): # Enter a unique name
    ```

    Deployment in draft status has been completed. You can view the page by accessing the `Website Draft URL` displayed in the terminal with a browser.

6. Deploy to the production environment with the `--prod` option to the `netlify deploy` command if there are no problems after trying it in the draft state.

    ```
    netlify deploy --prod # Deploy to the production environment
    ```

You've now deployed your LIFF app to Netlify. You can view the page by accessing the `Website URL` displayed in the terminal during deployment with a web browser.

### [#](#get-and-set-liff-id) Getting and Setting a LIFF ID

You've now deployed the LIFF starter app on the server.

At this point, if you open Netlify's `Website URL` in [external browser](../../../en/glossary.md#external-browser) or [in-app browser](../../../en/glossary.md#line-iab), you will see the deployed LIFF starter app as a page. However, the LIFF starter app can't be opened as a LIFF app in LINE's [LIFF browser](../../../en/glossary.md#liff-browser).

A LIFF ID is required to open the LIFF starter app as a LIFF App. Read [Create a channel](../../../en/docs/liff/getting-started.md) and [Adding a LIFF app to your channel](../../../en/docs/liff/registering-liff-apps.md) first to get your LIFF ID.

Enter the endpoint URL

You'll need to enter the **Endpoint URL** when adding the LIFF app to the channel. Enter here the `Website URL` that you obtained during deployment to the production environment in the previous step.

You can obtain your LIFF ID by following the above procedure. Set this as the server-side environment variable `LIFF_ID`.

1. To set an environment variable in Netlify, use the `netlify env:set` command. In other words, to set `LIFF_ID`, execute the following command:

    ```
    netlify env:set LIFF_ID "Your LIFF ID"
    ```

2. Once you've set the environment variables, deploy to Netlify again. This is because Netlify will set the environment variables at deployment time.

    ```
    netlify build
    netlify deploy --prod
    ```

    How to check the environment variables

    You can check the environment variables in Netlify's site settings. For more information, see [Build environment variables (opens new window)](https://docs.netlify.com/configure-builds/environment-variables/) in the Netlify Docs.

    ![Netlify's site settings](/assets/img/netlify-environment.92c02e7e.png)

3. You can now open the LIFF app from the LINE, and the LIFF app URL will be displayed as the LIFF URL in the **LIFF** tab of the channel you created in the [LINE Developers Console](../../../console.md).

    Send the LIFF URL to a LINE chat room and tap the LIFF URL on the chat room to open the LIFF app on LINE's [LIFF browser](../../../en/glossary.md#liff-browser).

    ![LIFF app](/assets/img/screenshot-mobile.8f3187f8.png)

If you open the LIFF app without setting the LIFF ID

If you open the LIFF app without setting the `LIFF_ID` environment variable, initializing the LIFF app with [`liff.init()`](../../../en/reference/liff.md#initialize-liff-app) will fail, but there is no change in the appearance of the LIFF starter app.

When setting LIFF_ID on the local server

To set the `LIFF_ID` on the local server, run the following command:

```
LIFF_ID="Your LIFF ID" yarn dev
```

## [#](#next-step) Next step

You're now ready to develop your LIFF app. For more information on the actual development, see [Developing a LIFF app](../../../en/docs/liff/developing-liff-apps.md).
