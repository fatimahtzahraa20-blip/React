# Task 69 — Safepay Checkout

A small full-stack checkout demo that lets a signed-in Supabase user create a Safepay checkout session, then continue to Safepay-hosted payment pages. The app is built with React on the frontend and Express on the backend.

## Overview

This task implements the checkout creation flow only:

- Supabase auth is used for user sign-in.
- The backend validates the authenticated user and request metadata.
- A unique order record is reserved in Postgres before the checkout request is sent to Safepay.
- The server creates a Safepay order and returns a hosted checkout URL.
- The frontend redirects the user to the returned Safepay checkout page.

This project does not complete payment verification or fulfillment. The task explicitly leaves payment confirmation and paid-access logic for a later step.

## Tech stack

- React + Vite for the frontend
- Express for the API layer
- Supabase Auth and Postgres for user/session handling
- Safepay hosted checkout integration
- Node.js built-in test runner for automated tests

## Features

- Sign in or create a Supabase account from the frontend
- Create Safepay checkout sessions through a protected API route
- Enforce idempotency with a required `Idempotency-Key` header
- Prevent duplicate concurrent checkout requests with a reserved order record
- Reuse a successful checkout URL on repeated requests with the same key
- Return helpful JSON errors when configuration is missing or external services fail
- Report backend readiness via `GET /health`

## Prerequisites

Before starting, make sure you have:

- Node.js installed
- A Supabase project with Auth enabled
- A Safepay sandbox account and dashboard access
- A valid `APP_URL` for the hosted app origin

## Environment variables

Create a `.env` file in the project root with the required settings:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

SAFEPAY_PUBLIC_KEY=sec_your_public_api_key
SAFEPAY_UNIT_AMOUNT=100
SAFEPAY_CURRENCY=PKR
SAFEPAY_ENVIRONMENT=sandbox
APP_URL=http://localhost:5173

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Notes:

- `SAFEPAY_PUBLIC_KEY` must be the Safepay Public API Key and must start with `sec_`.
- The private API secret is different and must not be sent by this frontend/backend checkout adapter.
- `SAFEPAY_UNIT_AMOUNT` is a positive integer and is used as the unit price for one quantity item.
- `APP_URL` should be the exact origin of the app, including HTTPS in production.
- If `SAFEPAY_ENVIRONMENT` is not set, the app defaults to `sandbox`.

## Database setup

Run the SQL in `supabase/safepay.sql` in your Supabase SQL editor. This creates the `public.safepay_checkout_sessions` table without affecting existing Stripe-related tables.

```sql
-- run the contents of supabase/safepay.sql in Supabase
```

## Install and run

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal and sign in through Supabase.

## API contract

### Health check

```http
GET /health
```

Response:

```json
{ "status": "ready" }
```

or, when configuration is incomplete:

```json
{ "status": "configuration_required" }
```

### Create checkout

```http
POST /create-payment
Authorization: Bearer <supabase_access_token>
Idempotency-Key: <16-80 chars of letters, numbers, or hyphens>
Content-Type: application/json
```

Request body:

```json
{ "quantity": 1 }
```

Behavior:

- Validates the Supabase token.
- Accepts quantity values from `1` to `10`.
- Reserves an order record using `user_id + idempotency key`.
- Calls Safepay to create a hosted checkout session.
- Stores the returned `payment_token` and `checkout_url`.
- Returns the stored checkout URL on successful retries.

Successful response example:

```json
{
  "id": "token_123",
  "url": "https://sandbox.api.getsafepay.com/checkout/pay?..."
}
```

Error handling:

- `401` for missing or invalid auth
- `400` for invalid quantity or missing idempotency key
- `409` when a duplicate request changes the quantity or the previous attempt is still pending
- `503` when setup or Supabase storage is missing
- `502` when Safepay cannot create the checkout session

## Frontend flow

The browser app:

1. Signs in or creates a Supabase user.
2. Lets the user choose a quantity.
3. Sends `POST /create-payment` with the bearer token and idempotency key.
4. Reads and validates the checkout URL from the API response.
5. Redirects the user to Safepay checkout.

The page also handles return-state messages like `checkout=success` and `checkout=cancelled` after returning from Safepay.

## Notes and task constraints

- The checkout creation route does not capture or verify payment completion.
- Payment fulfillment and paid access should be implemented later with signature-verified Safepay callbacks.
- The return page should not mark an order as paid without a confirmed payment notification.
- The app is designed to fail with clear JSON errors instead of crashing when configuration is incomplete.

## Testing and build

Run the test suite:

```bash
npm test
```

Build the frontend:

```bash
npm run build
```

Run the app in production mode:

```bash
npm start
```

## Production guidance

For production:

- Set `APP_URL` to your HTTPS origin.
- Ensure the Safepay environment matches the configured API base URL.
- Keep all secret credentials server-side and out of the frontend bundle.

## Related references

- Safepay SDK contract: https://github.com/getsafepay/safepay-node
- Safepay API key guidance: https://safepay-docs.netlify.app/developers/safepay/api-keys/

## Summary

This repository implements the checkout session creation part of the Safepay integration: user auth, protected server route, Shopify-style idempotency behavior, safe persistence, and redirect to Safepay-hosted checkout. The actual payment confirmation and fulfillment flow remains the next required step.
