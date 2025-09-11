# How to do redirect testing

**Nov 01, 2023**  
Posted by Ian Vanagas

---

## On this page
- [Creating our Next.js app and adding PostHog](#creating-our-nextjs-app-and-adding-posthog)
- [Setting up PostHog](#setting-up-posthog)
- [Adding test pages](#adding-test-pages)
- [Creating our A/B test](#creating-our-ab-test)
- [Setting up the redirect test middleware](#setting-up-the-redirect-test-middleware)
- [Getting or creating a user ID for flag evaluation](#getting-or-creating-a-user-id-for-flag-evaluation)
- [Evaluating our redirect test with PostHog](#evaluating-our-redirect-test-with-posthog)
- [Capturing exposures](#capturing-exposures)
- [Bootstrapping the data](#bootstrapping-the-data)
- [Handling bootstrap data on the frontend](#handling-bootstrap-data-on-the-frontend)
- [Further reading](#further-reading)

---

Redirect testing is a way to A/B test web pages by redirecting users to one or the other.

To show you how to do a redirect test with PostHog, we set up a two-page Next.js app, create an A/B test in PostHog, and then implement it in our app using middleware and feature flags.

> **Note:** Although we are using Next.js in this tutorial, this method works with any framework where you can do server-side redirects.

---

## Creating our Next.js app and adding PostHog

To start, create your Next.js app. Run the command below, select **No** for TypeScript, **Yes** to use the App Router, and the default for all other options.

```bash
npx create-next-app@latest redirect-test
```

---

## Setting up PostHog

Next, set up PostHog. Navigate into your new `redirect-test` folder and install it:

```bash
cd redirect-test
npm i posthog-js
```

In the `redirect-test/app` folder, create a `providers.js` file and set up a component that returns an initialized `PostHogProvider`. You can get the project API key and instance address from your project settings.

```javascript
// app/providers.js
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init("phc_oEMOxaQpUpSsiQMkUb0pSZAYOicVbsyBKVOOdULdBeM", {
    api_host: "https://us.i.posthog.com"
  })
}

export default function PHProvider({ children }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

Import the `PHProvider` component into `layout.js` and wrap your app in it:

```javascript
import './globals.css'
import PHProvider from './providers'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <PHProvider>
        <body>{children}</body>
      </PHProvider>
    </html>
  )
}
```

Once set up, PostHog autocaptures usage and you can use all its tools throughout your app.

---

## Adding test pages

In the `app` folder, create two new folders named `control` and `test`. In each folder, create a basic `page.js` file with a button to capture an event.

**Control page:**
```javascript
// app/control/page.js
'use client'
import { usePostHog } from "posthog-js/react";

export default function Control() {
  const posthog = usePostHog();

  return (
    <main>
      <h1>Hello!</h1>
      <button onClick={() => posthog.capture("main_button_clicked")}>
        Click me!
      </button>
    </main>
  );
}
```

**Test page:**
```javascript
// app/test/page.js
'use client'
import { usePostHog } from "posthog-js/react";

export default function Test() {
  const posthog = usePostHog();

  return (
    <main>
      <h1>Hello from the bright side!</h1>
      <p>Clicking this button will bring you happiness</p>
      <button onClick={() => posthog.capture("main_button_clicked")}>
        I want to be happy!
      </button>
    </main>
  );
}
```

Run your app:
```bash
npm run dev
```
Visit:
- [http://localhost:3000/control](http://localhost:3000/control)
- [http://localhost:3000/test](http://localhost:3000/test)

---

## Creating our A/B test

Our A/B test will compare these two pages to see which drives more button clicks.

1. Go to the **experiment** tab in PostHog.
2. Click **New experiment**.
3. Name your experiment and feature flag key (e.g., `main-redirect`) and save as draft.
4. Set your experiment goal to `main_button_clicked`.
5. Click **Launch**.

---

## Setting up the redirect test middleware

Create a `middleware.js` file in the base `redirect-test` directory. We want it to run on both `/test` and `/control` paths.

```javascript
// redirect-test/middleware.js
import { NextResponse } from 'next/server'

export async function middleware(request) {
  if (request.nextUrl.pathname === '/test') {
    // Placeholder
    return NextResponse.redirect(new URL('/control', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/test', '/control'],
};
```

---

## Getting or creating a user ID for flag evaluation

```javascript
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const ph_project_api_key = 'phc_oEMOxaQpUpSsiQMkUb0pSZAYOicVbsyBKVOOdULdBeM'
  const ph_cookie_key = `ph_${ph_project_api_key}_posthog`
  const cookie = request.cookies.get(ph_cookie_key);

  let distinct_id;
  if (cookie) {
    distinct_id = JSON.parse(cookie.value).distinct_id;
  } else {
    distinct_id = crypto.randomUUID();
  }
  // ... rest of code
}
```

---

## Evaluating our redirect test with PostHog

```javascript
// redirect-test/middleware.js
// ... rest of code

const requestOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_key: ph_project_api_key,
    distinct_id: distinct_id
  })
};

// Evaluate experiment flag
const ph_request = await fetch(
  'https://us.i.posthog.com/flags?v=2',
  requestOptions
);
const data = await ph_request.json();
const flagResponse = data.featureFlags['main-redirect'];

// Redirect to correct page
if (request.nextUrl.pathname === '/test' && flagResponse === 'control') {
  return NextResponse.redirect(new URL('/control', request.url))
}
if (request.nextUrl.pathname === '/control' && flagResponse === 'test') {
  return NextResponse.redirect(new URL('/test', request.url))
}
return NextResponse.next()
```

---

## Capturing exposures

```javascript
// After flag evaluation
const eventOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_key: ph_project_api_key,
    distinct_id: distinct_id,
    properties: {
      "$feature_flag": 'main-redirect',
      "$feature_flag_response": flagResponse
    },
    event: "$feature_flag_called"
  })
};

await fetch('https://us.i.posthog.com/i/v0/e', eventOptions);
```

---

## Bootstrapping the data

```javascript
// middleware.js
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const ph_project_api_key = 'phc_oEMOxaQpUpSsiQMkUb0pSZAYOicVbsyBKVOOdULdBeM'
  const ph_cookie_key = `ph_${ph_project_api_key}_posthog`
  const cookie = request.cookies.get(ph_cookie_key);
  const bootstrapCookie = request.cookies.get('bootstrapData');

  let distinct_id;
  if (bootstrapCookie) {
    distinct_id = JSON.parse(bootstrapCookie.value).distinctId;
  } else if (cookie) {
    distinct_id = JSON.parse(cookie.value).distinct_id;
  } else {
    distinct_id = crypto.randomUUID();
  }

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: ph_project_api_key, distinct_id })
  };

  const ph_request = await fetch(
    'https://us.i.posthog.com/flags?v=2',
    requestOptions
  );
  const data = await ph_request.json();

  const flagResponse = data.featureFlags['main-redirect']

  // Capture exposure
  await fetch('https://us.i.posthog.com/i/v0/e', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: ph_project_api_key,
      distinct_id: distinct_id,
      properties: {
        "$feature_flag": 'main-redirect',
        "$feature_flag_response": flagResponse
      },
      event: "$feature_flag_called"
    })
  });

  const bootstrapData = {
    distinctID: distinct_id,
    featureFlags: data.featureFlags
  }

  if (request.nextUrl.pathname === '/test' && flagResponse === 'control') {
    const res = NextResponse.redirect(new URL('/control', request.url))
    res.cookies.set('bootstrapData', JSON.stringify(bootstrapData))
    return res
  }
  if (request.nextUrl.pathname === '/control' && flagResponse === 'test') {
    const res = NextResponse.redirect(new URL('/test', request.url))
    res.cookies.set('bootstrapData', JSON.stringify(bootstrapData))
    return res
  }
  const res = NextResponse.next()
  res.cookies.set('bootstrapData', JSON.stringify(bootstrapData))
  return res
}

export const config = {
  matcher: ['/test', '/control'],
};
```

---

## Handling bootstrap data on the frontend

Install `cookie-cutter`:
```bash
npm i cookie-cutter
```

Update `app/providers.js`:
```javascript
// app/providers.js
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import cookieCutter from 'cookie-cutter'

if (typeof window !== 'undefined') {
  const bootstrapData = cookieCutter.get('bootstrapData')
  let parsedBootstrapData = {}
  if (bootstrapData) {
    parsedBootstrapData = JSON.parse(bootstrapData)
  }

  posthog.init("<ph_posthog_project_api_key>", {
    api_host: "https://us.i.posthog.com",
    bootstrap: parsedBootstrapData
  })
}

export default function PHProvider({ children }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

---

When we relaunch the application and go to either `/test` or `/control`, the middleware redirects users to the correct page, their experience remains consistent across reloads, and the redirect test runs successfully.
```
