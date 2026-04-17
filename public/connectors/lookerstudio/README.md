# ARLO Looker Studio Community Connector

This folder contains the Apps Script source for a Looker Studio (Google Data Studio) Community Connector that pulls live from ARLO. Agencies install it once per Google account, paste an ARLO bearer token, and every Looker Studio dashboard becomes a live view of their client's analytics / ads / e-commerce data.

## How it works

- Every Looker refresh → Apps Script `getData()` POSTs `{ action: "getData", fields, dateRange }` to `https://askarlo.app/api/destinations/live/looker-studio`.
- Authorization is a bearer token stored in Looker's `USER_TOKEN` auth type.
- ARLO resolves the token via `destinations.liveTokenHash`, locks the workspaceId + clientId at the row level, and calls `fetchDataset` with those locked values.
- A leaked token can only ever return **its one client's data**.

## Files

- `manifest.json` — Apps Script manifest. Declares Looker Studio addon metadata.
- `Connector.gs` — the Apps Script entry points (`getAuthType`, `getSchema`, `getData`, `setCredentials`, `resetAuth`, `isAuthValid`).
- `Config.gs` — fixed ARLO endpoint URL.

## Publishing

1. In Google Apps Script, paste `Connector.gs` and `Config.gs` into a new project.
2. Deploy as a Looker Studio Community Connector (Publish → Deploy from manifest).
3. Share the deployment URL with agencies.

Agencies paste the connector's deployment ID into Looker Studio → Add data → Build your own → paste ID. When prompted for credentials, they paste the ARLO bearer token generated on the Destinations page.

## Security notes

- Only `POST`s are made to ARLO. The endpoint verifies the bearer token.
- The bearer token hashes to `destinations.liveTokenHash` — look it up, lock its `workspaceId` + `clientId`, done.
- Never log the bearer token from Apps Script (use `PropertiesService.getUserProperties()` to store it).

## Status

This is a reference implementation. The production publish pipeline (Apps Script project id, deployment id, Partner Gallery submission) is handled outside this repository.
