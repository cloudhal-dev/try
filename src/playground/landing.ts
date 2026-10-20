/** The landing page at `/` for visitors without a session (RFC-0036 §1). */

export const LANDING_PATH = "/landing/";

const STYLE = `
:root { color-scheme: light dark; --bg: #fafaf9; --fg: #1c1917; --muted: #57534e; --accent: #f6821f; }
@media (prefers-color-scheme: dark) { :root { --bg: #0c0a09; --fg: #f5f5f4; --muted: #a8a29e; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.6 system-ui, sans-serif; }
main { max-width: 40rem; margin: 0 auto; padding: 4rem 1rem; }
h1 { font-size: 2rem; line-height: 1.2; margin: 0 0 1rem; }
p { color: var(--muted); }
.actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
.button { display: inline-block; padding: .6rem 1.1rem; border-radius: .5rem; text-decoration: none;
  border: 1px solid var(--muted); color: var(--fg); background: none; font: inherit; cursor: pointer; }
.button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
form { margin: 0; }
small { display: block; margin-top: 3rem; color: var(--muted); }
`;

export function landingPage(options: { enabled: boolean; deployUrl: string }): string {
  const open = options.enabled
    ? `<form method="post" action="/_playground/session"><button class="button primary" type="submit">Open the playground</button></form>`
    : `<p><strong>The playground is closed right now.</strong> Try again later, or run Cloudhal on your own account.</p>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Try Cloudhal</title>
<style>${STYLE}</style>
</head>
<body><main>
<h1>Try Cloudhal, no account needed</h1>
<p>Cloudhal is an agent-native site platform on Cloudflare. The playground gives you your own
Studio, API and site for an hour: edit a post, change the design, publish, and see the result.</p>
<div class="actions">
${open}
<a class="button" href="${options.deployUrl}">Run it on your own Cloudflare</a>
</div>
<small>Everything you enter in the playground is deleted when the session ends, at most 2 hours
after it starts. Don't enter personal data.</small>
</main></body>
</html>`;
}
