import {
  ALLOWED_VOLUMES,
  SCRAPER_PRICE_BATCH_SIZE,
} from "@peated/server/constants";
import BatchQueue from "@peated/server/lib/batchQueue";
import { normalizeBottle, normalizeVolume } from "@peated/server/lib/normalize";
import type { StorePrice } from "@peated/server/lib/scraper";
import { getUrl, parsePrice } from "@peated/server/lib/scraper";
import { toTitleCase } from "@peated/server/lib/strings";
import { trpcClient } from "@peated/server/lib/trpc/server";
import { absoluteUrl } from "@peated/server/lib/urls";
import type { ExternalSiteType } from "@peated/server/types";
import { ExternalSite } from "@peated/server/types";
import { load as cheerio } from "cheerio";

function extractVolume(name: string): [string, string] | [string] {
  const match = name.match(/^(.+)\s([\d.]+(?:ml|l))$/i);
  if (!match) return [name];
  return match.slice(1, 3) as [string, string];
}

export async function scrapeProducts(
  url: string,
  cb: (product: StorePrice) => Promise<void>,
) {
  const data = await getUrl(url);
  const $ = cheerio(data);
  $(".collection-products-row .product-block").each((_, el) => {
    const brand = toTitleCase($("div.brand", el).first().text().trim());
    const bottle = $("a.title", el).first().text().trim();
    if (!bottle || !brand) {
      console.warn("Unable to identify Product Name");
      return;
    }

    const [name, volumeRaw] = extractVolume(
      normalizeBottle({
        name: toTitleCase(`${bottle}`),
        isFullName: false,
      }).name,
    );

    const volume = volumeRaw ? normalizeVolume(volumeRaw) : null;
    if (!volume) {
      console.warn(`Invalid size: ${volumeRaw}`);
      return;
    }

    if (!ALLOWED_VOLUMES.includes(volume)) {
      console.warn(`Invalid size: ${volume}`);
      return;
    }

    const productUrl = $("a.title", el).first().attr("href");
    if (!productUrl) throw new Error("Unable to identify Product URL");

    const priceRaw = $("div.product-block-price > strong", el)
      .first()
      .text()
      .trim();
    const price = parsePrice(priceRaw);
    if (!price) {
      console.warn(`Invalid price: ${priceRaw}`);
      return;
    }

    const fullName = `${brand} ${name}`;
    console.log(`${fullName} - ${(price / 100).toFixed(2)}`);

    cb({
      name: fullName,
      price,
      currency: "usd",
      volume,
      url: absoluteUrl(url, productUrl),
    });
  });
}

export default async function scrapePrices(site: ExternalSiteType) {
  const workQueue = new BatchQueue<StorePrice>(
    SCRAPER_PRICE_BATCH_SIZE,
    async (prices) => {
      console.log("Pushing new price data to API");
      await trpcClient.priceCreateBatch.mutate({
        site,
        prices,
      });
    },
  );

  const uniqueProducts = new Set<string>();

  let hasProducts = true;
  let page = 1;
  while (hasProducts) {
    hasProducts = false;
    await scrapeProducts(
      `https://www.healthyspirits.com/spirits/whiskey/page${page}.html?limit=72`,
      async (product) => {
        console.log(`${product.name} - ${(product.price / 100).toFixed(2)}`);
        if (uniqueProducts.has(product.name)) return;
        await workQueue.push(product);
        uniqueProducts.add(product.name);
        hasProducts = true;
      },
    );
    page += 1;
  }

  const products = Array.from(uniqueProducts.values());
  if (products.length === 0) {
    throw new Error("Failed to scrape any products.");
  }

  await workQueue.processRemaining();

  console.log(`Complete - ${products.length} products found`);
}
