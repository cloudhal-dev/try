/**
 * The demo pack (RFC-0036 §3): what every new playground session starts with. The starter site
 * (home, about, categories and tags, a first post) plus three images, eight posts and a menu,
 * published, so the visitor sees a real site at once. Written through the store's normal calls,
 * never SQL, so it cannot drift from the migrations.
 *
 * Every session uses the same site id, so the images' content keys (`media/<site>/<sha256>`) are
 * the same everywhere: their bytes are static files under `public/demo/` (the read-only base of
 * the session's blob store) and no session stores a copy.
 */
import type { Actor, ContentEntry, Site } from "@cloudhal/core-contracts";
import { type SiteGraphStore, seedStarterSite } from "@cloudhal/core-ts";
import { DEMO_MEDIA, DEMO_SITE_ID } from "./demo-media.ts";

export { DEMO_SITE_ID };

/** The static files under `public/demo/` the session's blob store may read. */
export const DEMO_MEDIA_KEYS = DEMO_MEDIA.map((m) => `media/${DEMO_SITE_ID}/${m.sha256}`);

const author: Actor = { kind: "human", id: "user_playground", name: "Playground Owner" };

interface DemoPost {
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: "news" | "guides" | "design";
  image?: (typeof DEMO_MEDIA)[number]["slug"];
}

const POSTS: readonly DemoPost[] = [
  {
    slug: "welcome-to-the-playground",
    title: "Welcome to the playground",
    summary:
      "This site is yours for the next hour. Edit anything, publish, and look at the result.",
    category: "news",
    image: "harbour-dawn",
    body: "This is a real Cloudhal: the same Studio, API and renderer you would run on your own Cloudflare account, with demo content.\n\n## Try this\n\n1. Open **Posts** in Studio and change this post.\n2. Click **Publish**, then open the site.\n3. Change the colours under **Appearance** and publish again.\n\nEverything you do here is deleted when the session ends.",
  },
  {
    slug: "snapshots-and-rollbacks",
    title: "Every change is a snapshot",
    summary: "Publishing never overwrites: each publish is a snapshot you can diff and roll back.",
    category: "guides",
    body: "Cloudhal keeps the site as a typed graph. A publish freezes it into a snapshot, and the live site points at one snapshot at a time.\n\n- **Diff** any two snapshots to see what changed.\n- **Roll back** to an earlier snapshot in one step.\n\nTry it: publish twice, then open **Snapshots**.",
  },
  {
    slug: "pages-are-made-of-sections",
    title: "Pages are made of sections",
    summary: "Heroes, content lists, rich text and components, each a block you can reorder.",
    category: "guides",
    image: "forest-light",
    body: "A page is a list of sections. Each section has a kind (hero, rich text, content list, component) and its own fields.\n\nOpen the **Home** page in Studio, add a section and move it up.",
  },
  {
    slug: "a-design-system-for-your-site",
    title: "A design system for your site",
    summary: "Themes declare their settings; you change colours, type and spacing without code.",
    category: "design",
    image: "city-dusk",
    body: "The blog theme exposes its settings: accent colour, fonts, radius, density. Change them under **Appearance** and preview before you publish.\n\nThe site's **Design rules** (a DESIGN.md) tell agents how the site should look.",
  },
  {
    slug: "agents-under-approval",
    title: "Agents work under approval",
    summary: "In your own install, agents edit through MCP; risky changes wait for a person.",
    category: "news",
    body: "Cloudhal is agent-native. Agents connect over MCP, every call goes through a policy engine, and publishing can require a person's approval.\n\nThe playground leaves agents out. Deploy Cloudhal to your own Cloudflare account to try them.",
  },
  {
    slug: "categories-and-tags",
    title: "Categories and tags",
    summary:
      "Taxonomies are part of the graph, with archives, feeds and redirects when you rename.",
    category: "guides",
    body: "Every post has one category and any number of tags. Renaming a term keeps its old URLs working with a redirect.\n\nOpen **Categories** in Studio and rename *Guides*.",
  },
  {
    slug: "menus",
    title: "Menus that follow your pages",
    summary: "Navigation is a menu node: build it from your pages, then edit it by hand.",
    category: "design",
    body: "The header menu of this site was built from its pages. Add a page and add it to the menu under **Menus**.",
  },
  {
    slug: "runs-on-cloudflare",
    title: "Runs on your Cloudflare account",
    summary:
      "Workers, D1 and R2 in your own account: no third-party host between you and your site.",
    category: "news",
    body: "A Cloudhal deployment is two Workers (the site and Studio with its API) over a D1 database and an R2 bucket, all in your account.\n\nThis playground runs the same code in a Durable Object per visitor.",
  },
];

/** Seeds a new session's store; returns the site the session shows. */
export async function seedDemo(store: SiteGraphStore): Promise<{ siteId: string }> {
  let site = await seedStarterSite(store, {
    name: "Playground Notes",
    slug: "playground",
    siteId: DEMO_SITE_ID,
  });
  const images = await addImages(store);
  const terms = await categoryTerms(store, site);
  const now = Date.now();
  for (const [i, post] of POSTS.entries()) {
    const image = post.image ? images.get(post.image) : undefined;
    await store.createContentEntry({
      siteId: site.id,
      collection: "posts",
      slug: post.slug,
      locale: "en",
      status: "published",
      title: post.title,
      summary: post.summary,
      body: { format: "markdown", value: post.body },
      fields: {},
      tags: [],
      terms: { category: { ids: [terms[post.category]], primary: terms[post.category] } },
      author,
      publishedAt: new Date(now - (i + 1) * 3_600_000).toISOString(),
      ...(image ? { coverImage: { assetId: image.id, src: "/", alt: image.alt } } : {}),
    } as Omit<ContentEntry, "schemaVersion" | "id" | "rev" | "createdAt" | "updatedAt">);
  }
  site = (await store.getSite(site.id)) as Site;
  await store.createMenuFromPages(site, "header", { categories: true });
  const snapshot = await store.createSnapshot(site.id, {
    actor: author,
    reason: "publish",
    label: "Demo content",
  });
  await store.publish((await store.getSite(site.id)) as Site, snapshot.id);
  return { siteId: site.id };
}

/** Asset nodes for the demo images, whose bytes are already in the read-only base store. */
async function addImages(store: SiteGraphStore): Promise<Map<string, { id: string; alt: string }>> {
  const out = new Map<string, { id: string; alt: string }>();
  const until = new Date(Date.now() + 10 * 60_000).toISOString();
  for (const m of DEMO_MEDIA) {
    const meta = { bytes: m.bytes, mediaType: "image/png" };
    await store.leaseBlob(DEMO_SITE_ID, m.sha256, until, meta);
    await store.markBlobStored(DEMO_SITE_ID, { sha256: m.sha256, ...meta });
    const { asset } = await store.createAsset({
      siteId: DEMO_SITE_ID,
      kind: "image",
      mediaType: "image/png",
      bytes: m.bytes,
      sha256: m.sha256,
      slug: m.slug,
      storage: { kind: "blob" },
      image: { width: m.width, height: m.height },
      title: { en: m.title },
      alt: { en: m.title },
      status: "active",
      uploadedBy: author,
      source: { kind: "upload", filename: `${m.slug}.png` },
    } as Parameters<SiteGraphStore["createAsset"]>[0]);
    out.set(m.slug, { id: asset.id, alt: m.title });
  }
  return out;
}

/** The category terms the posts use: the starter's "News" plus "Guides" and "Design". */
async function categoryTerms(
  store: SiteGraphStore,
  site: Site,
): Promise<Record<DemoPost["category"], string>> {
  const category = (await store.listTaxonomies(site.id)).find((t) => t.key === "category");
  if (!category) throw new Error("the starter site has no category taxonomy");
  const existing = await store.listTerms(site.id);
  const news = existing.find((t) => t.taxonomyId === category.id && t.slug === "news");
  const make = async (slug: string, name: string, position: number) =>
    (
      await store.createTerm({
        siteId: site.id,
        taxonomyId: category.id,
        slug,
        status: "active",
        visibility: "public",
        labels: { en: { name } },
        position,
      })
    ).id;
  return {
    news: news?.id ?? (await make("news", "News", 0)),
    guides: await make("guides", "Guides", 1),
    design: await make("design", "Design", 2),
  };
}
