/**
 * Freshness tracking utilities
 *
 * Tracks when repositories were last indexed and provides staleness detection.
 * Used to ensure the knowledge base stays up-to-date.
 */

import { logger } from "./logger.js";
import { metadataCache } from "./cache.js";

// ============================================================================
// Types
// ============================================================================

export interface RepositoryFreshness {
  repository: string;
  lastIndexedAt: string; // ISO timestamp
  lastCommitSha?: string;
  lastCommitAt?: string; // ISO timestamp of last known commit
  documentCount: number;
  isStale: boolean;
  staleReason?: string;
}

export interface FreshnessReport {
  generatedAt: string;
  totalRepositories: number;
  staleRepositories: number;
  repositories: RepositoryFreshness[];
  overallStatus: "fresh" | "partially-stale" | "stale";
}

// ============================================================================
// Configuration
// ============================================================================

// Staleness thresholds
const STALENESS_THRESHOLDS = {
  // High-priority repos: stale after 4 hours
  priority: 4 * 60 * 60 * 1000,
  // Standard repos: stale after 12 hours
  standard: 12 * 60 * 60 * 1000,
  // Low-priority (rarely changing): stale after 48 hours
  lowPriority: 48 * 60 * 60 * 1000,
};

// Priority repositories that change frequently
const PRIORITY_REPOS = new Set([
  "compact",
  "midnight-js",
  "midnight-examples",
  "lace-wallet-midnight",
  "midnight-wallet",
]);

// Low-priority repos that rarely change
const LOW_PRIORITY_REPOS = new Set([
  "welcome-to-midnight-examples",
  "test-proving-system",
]);

// ============================================================================
// In-Memory Freshness Store
// ============================================================================

// Track when each repository was last indexed
// Key: repository name, Value: freshness info
const freshnessStore = new Map<
  string,
  {
    lastIndexedAt: Date;
    lastCommitSha?: string;
    lastCommitAt?: Date;
    documentCount: number;
  }
>();

/**
 * Record that a repository was indexed
 */
export function recordIndexedRepository(
  repository: string,
  documentCount: number,
  commitSha?: string,
  commitAt?: Date
): void {
  freshnessStore.set(repository, {
    lastIndexedAt: new Date(),
    lastCommitSha: commitSha,
    lastCommitAt: commitAt,
    documentCount,
  });

  logger.debug(`Recorded freshness for ${repository}`, {
    documentCount,
    commitSha: commitSha?.slice(0, 7),
  });
}

/**
 * Get the staleness threshold for a repository
 */
function getStalenessThreshold(repository: string): number {
  if (PRIORITY_REPOS.has(repository)) {
    return STALENESS_THRESHOLDS.priority;
  }
  if (LOW_PRIORITY_REPOS.has(repository)) {
    return STALENESS_THRESHOLDS.lowPriority;
  }
  return STALENESS_THRESHOLDS.standard;
}

/**
 * Check if a repository's data is stale
 */
export function isRepositoryStale(repository: string): {
  isStale: boolean;
  reason?: string;
  lastIndexedAt?: Date;
} {
  const info = freshnessStore.get(repository);

  if (!info) {
    return {
      isStale: true,
      reason: "Never indexed",
    };
  }

  const now = Date.now();
  const threshold = getStalenessThreshold(repository);
  const age = now - info.lastIndexedAt.getTime();

  if (age > threshold) {
    const hoursAgo = Math.round(age / (60 * 60 * 1000));
    return {
      isStale: true,
      reason: `Last indexed ${hoursAgo} hours ago (threshold: ${threshold / (60 * 60 * 1000)}h)`,
      lastIndexedAt: info.lastIndexedAt,
    };
  }

  return {
    isStale: false,
    lastIndexedAt: info.lastIndexedAt,
  };
}

/**
 * Get freshness status for a specific repository
 */
export function getRepositoryFreshness(
  repository: string
): RepositoryFreshness | null {
  const info = freshnessStore.get(repository);
  if (!info) {
    return null;
  }

  const staleness = isRepositoryStale(repository);

  return {
    repository,
    lastIndexedAt: info.lastIndexedAt.toISOString(),
    lastCommitSha: info.lastCommitSha,
    lastCommitAt: info.lastCommitAt?.toISOString(),
    documentCount: info.documentCount,
    isStale: staleness.isStale,
    staleReason: staleness.reason,
  };
}

/**
 * Generate a full freshness report for all tracked repositories
 */
export function generateFreshnessReport(): FreshnessReport {
  const repositories: RepositoryFreshness[] = [];
  let staleCount = 0;

  for (const [repo] of freshnessStore) {
    const freshness = getRepositoryFreshness(repo);
    if (freshness) {
      repositories.push(freshness);
      if (freshness.isStale) {
        staleCount++;
      }
    }
  }

  // Sort: stale first, then by last indexed
  repositories.sort((a, b) => {
    if (a.isStale !== b.isStale) return a.isStale ? -1 : 1;
    return (
      new Date(b.lastIndexedAt).getTime() - new Date(a.lastIndexedAt).getTime()
    );
  });

  const total = repositories.length;
  let overallStatus: FreshnessReport["overallStatus"] = "fresh";

  if (staleCount > 0) {
    overallStatus = staleCount === total ? "stale" : "partially-stale";
  }

  return {
    generatedAt: new Date().toISOString(),
    totalRepositories: total,
    staleRepositories: staleCount,
    repositories,
    overallStatus,
  };
}

/**
 * Get a summary of stale repositories for inclusion in tool responses
 */
export function getStalenessWarning(): string | null {
  const report = generateFreshnessReport();

  if (report.overallStatus === "fresh") {
    return null;
  }

  const staleRepos = report.repositories
    .filter((r) => r.isStale)
    .slice(0, 3)
    .map((r) => r.repository);

  if (staleRepos.length === 0) {
    return null;
  }

  const others = report.staleRepositories - staleRepos.length;
  const otherText = others > 0 ? ` and ${others} more` : "";

  return `⚠️ Data may be outdated for: ${staleRepos.join(", ")}${otherText}. Last full index: ${report.repositories[0]?.lastIndexedAt || "unknown"}`;
}

/**
 * Clear all freshness data (useful for testing)
 */
export function clearFreshnessData(): void {
  freshnessStore.clear();
  logger.debug("Freshness data cleared");
}

/**
 * Initialize freshness data from API or stored state
 * Called at server startup to restore state
 */
export async function initializeFreshnessFromAPI(
  apiBaseUrl: string
): Promise<void> {
  const cacheKey = "freshness:api-stats";

  try {
    // Check cache first
    const cached = metadataCache.get(cacheKey);
    if (cached) {
      logger.debug("Using cached freshness data");
      return;
    }

    // Fetch stats from hosted API
    const response = await fetch(`${apiBaseUrl}/v1/stats`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      logger.warn(`Failed to fetch freshness stats: ${response.status}`);
      return;
    }

    const stats = (await response.json()) as {
      documentsByRepo?: Record<string, number>;
      lastUpdated?: string;
    };

    if (stats.documentsByRepo) {
      const indexedAt = stats.lastUpdated
        ? new Date(stats.lastUpdated)
        : new Date();

      for (const [repo, count] of Object.entries(stats.documentsByRepo)) {
        recordIndexedRepository(repo, count, undefined, indexedAt);
      }

      metadataCache.set(cacheKey, stats);
      logger.info(
        `Initialized freshness data for ${Object.keys(stats.documentsByRepo).length} repositories`
      );
    }
  } catch (error) {
    logger.warn("Failed to initialize freshness from API", {
      error: String(error),
    });
  }
}

/**
 * Get the most recently indexed timestamp across all repositories
 */
export function getMostRecentIndexTime(): Date | null {
  let mostRecent: Date | null = null;

  for (const info of freshnessStore.values()) {
    if (!mostRecent || info.lastIndexedAt > mostRecent) {
      mostRecent = info.lastIndexedAt;
    }
  }

  return mostRecent;
}

/**
 * Format a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();

  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
