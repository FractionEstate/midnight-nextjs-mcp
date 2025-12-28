/**
 * Shared version constant
 * Injected at build time by tsup via NPM_PACKAGE_VERSION
 */
export const CURRENT_VERSION = process.env.NPM_PACKAGE_VERSION ?? "unknown";
