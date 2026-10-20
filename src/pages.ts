const STYLE = `
:root { color-scheme: light dark; --bg: #fafaf9; --fg: #1c1917; --muted: #57534e; --accent: #f6821f; }
@media (prefers-color-scheme: dark) { :root { --bg: #0c0a09; --fg: #f5f5f4; --muted: #a8a29e; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.6 system-ui, sans-serif; }
main { max-width: 40rem; margin: 0 auto; padding: 4rem 1rem; }
h1 { font-size: 2rem; line-height: 1.2; margin: 0 0 1rem; }
p { color: var(--muted); }
.actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
a.button { display: inline-block; padding: .6rem 1.1rem; border-radius: .5rem; text-decoration: none;
  border: 1px solid var(--muted); color: var(--fg); }
a.button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
small { display: block; margin-top: 3rem; color: var(--muted); }
`;

function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>${STYLE}</style>
</head>
<body><main>${body}</main></body>
</html>`;
}

/** The landing page. It is served even with the kill switch on. */
export function landingPage(deployUrl: string): string {
  return page(
    "Try Cloudhal",
    `<h1>Try Cloudhal, no account needed</h1>
<p>Cloudhal is an agent-native site platform on Cloudflare. The playground will give you your own
Studio, API and site for an hour: edit a post, change the design, publish, and see the result.</p>
<p>It is not open yet.</p>
<div class="actions">
  <a class="button primary" href="/playground">Open the playground</a>
  <a class="button" href="${deployUrl}">Run it on your own Cloudflare</a>
</div>
<small>Everything you enter in the playground is deleted within 2 hours. Don't enter personal data.</small>`,
  );
}

export function comingSoonPage(): string {
  return page(
    "Coming soon · Try Cloudhal",
    `<h1>The playground is coming soon</h1>
<p>Each visitor will get a private Cloudhal that is deleted after an hour. It is being built now.</p>
<div class="actions"><a class="button" href="/">Back</a></div>`,
  );
}
