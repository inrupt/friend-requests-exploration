type WithArgument<Result> = (identifier: string) => Promise<Result>;
type WithoutArgument<Result> = () => Promise<Result>;

type CachedResult = any;
type CacheEntry = Map<string, CachedResult>;
const cache: Map<string, CacheEntry | CachedResult> = new Map();

/**
 * Wraps a function so that its result is cached in this module's closure.
 * @param dataFetcher Function whose result should be cached
 * @param useCache If set to false, the cache will be ignored, and the fresh result will be cached.
 */
export function fromCache<Result>(
  dataFetcher: WithArgument<Result> | WithoutArgument<Result>,
  useCache = true,
) {
  return async (identifier?: string) => {
    const functionName = dataFetcher.name;
    const fetcherCache = cache.get(functionName);
    if (fetcherCache && useCache) {
      if (typeof identifier === 'undefined') {
        // There can be just one result, and it's been cached:
        return fetcherCache;
      }
      // The result depends on the parameter, so this has a separate cache:
      const cachedResult = fetcherCache.get(identifier);
      if (cachedResult && useCache) {
        return cachedResult;
      }

      // This specific result has not been cached yet, so fetch it, then cache it:
      const result = await dataFetcher(identifier);
      (fetcherCache as Map<string, CachedResult>).set(identifier, result);
      return result;
    }

    // The `as any` is needed here because TypeScript can't discern between a function that takes
    // a string, and one that takes no arguments:
    const result = await dataFetcher(identifier as any);
    if (typeof identifier === 'string') {
      const fetcherCache = new Map();
      fetcherCache.set(identifier, result);
      cache.set(functionName, fetcherCache);
      return result;
    }
    cache.set(functionName, result);
    return result;
  };
}