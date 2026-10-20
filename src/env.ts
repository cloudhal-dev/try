/** Bindings declared in wrangler.jsonc. */
export interface Env {
  PLAYGROUND_DB: DurableObjectNamespace;
  SESSION_RATE_LIMIT: RateLimit;
  WRITE_RATE_LIMIT: RateLimit;
  ASSETS: Fetcher;
  /** Kill switch: anything but "true" serves only the landing page. */
  PLAYGROUND_ENABLED: string;
  PLAYGROUND_DAILY_SESSIONS: string;
  DEPLOY_URL: string;
}
