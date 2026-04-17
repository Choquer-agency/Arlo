/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as clients from "../clients.js";
import type * as customConnectors from "../customConnectors.js";
import type * as destinationRuns from "../destinationRuns.js";
import type * as destinationSyncs from "../destinationSyncs.js";
import type * as destinations from "../destinations.js";
import type * as http from "../http.js";
import type * as lib_currentUser from "../lib/currentUser.js";
import type * as mcpAuditLog from "../mcpAuditLog.js";
import type * as mcpTokens from "../mcpTokens.js";
import type * as members from "../members.js";
import type * as platformConnections from "../platformConnections.js";
import type * as shareableDashboards from "../shareableDashboards.js";
import type * as usageCounters from "../usageCounters.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  clients: typeof clients;
  customConnectors: typeof customConnectors;
  destinationRuns: typeof destinationRuns;
  destinationSyncs: typeof destinationSyncs;
  destinations: typeof destinations;
  http: typeof http;
  "lib/currentUser": typeof lib_currentUser;
  mcpAuditLog: typeof mcpAuditLog;
  mcpTokens: typeof mcpTokens;
  members: typeof members;
  platformConnections: typeof platformConnections;
  shareableDashboards: typeof shareableDashboards;
  usageCounters: typeof usageCounters;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
