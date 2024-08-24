import { db } from "@peated/server/db";
import { externalSites, storePrices } from "@peated/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createCaller } from "../router";

describe("priceList", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("lists prices with default parameters", async ({ fixtures }) => {
    const admin = await fixtures.User({ admin: true });
    const caller = createCaller({ user: admin });
    const price1 = await fixtures.StorePrice({ name: "Price 1" });
    const price2 = await fixtures.StorePrice({ name: "Price 2" });

    const result = await caller.priceList({});

    expect(result.results.length).toBe(2);
    expect(result.results[0].id).toBe(price1.id);
    expect(result.results[1].id).toBe(price2.id);
    expect(result.rel.nextCursor).toBeNull();
    expect(result.rel.prevCursor).toBeNull();
  });

  test("filters prices by site", async ({ fixtures }) => {
    const admin = await fixtures.User({ admin: true });
    const caller = createCaller({ user: admin });
    const site1 = await fixtures.ExternalSite({ type: "whiskyadvocate" });
    const price1 = await fixtures.StorePrice({ externalSiteId: site1.id });
    const site2 = await fixtures.ExternalSite({ type: "healthyspirits" });
    await fixtures.StorePrice({ externalSiteId: site2.id }); // Different site

    const result = await caller.priceList({ site: "whiskyadvocate" });

    expect(result.results.length).toBe(1);
    expect(result.results[0].id).toBe(price1.id);
  });

  test("filters unknown prices", async ({ fixtures }) => {
    const admin = await fixtures.User({ admin: true });
    const caller = createCaller({ user: admin });
    const bottle = await fixtures.Bottle();
    const price1 = await fixtures.StorePrice({ bottleId: null });
    await fixtures.StorePrice({ bottleId: bottle.id }); // Known bottle

    const result = await caller.priceList({ onlyUnknown: true });

    expect(result.results.length).toBe(1);
    expect(result.results[0].id).toBe(price1.id);
  });

  test("filters prices by query", async ({ fixtures }) => {
    const admin = await fixtures.User({ admin: true });
    const caller = createCaller({ user: admin });
    const price1 = await fixtures.StorePrice({ name: "Unique Whiskey" });
    await fixtures.StorePrice({ name: "Common Bourbon" });

    const result = await caller.priceList({ query: "Unique" });

    expect(result.results.length).toBe(1);
    expect(result.results[0].id).toBe(price1.id);
  });

  test("throws NOT_FOUND for non-existent site", async ({ fixtures }) => {
    const admin = await fixtures.User({ admin: true });
    const caller = createCaller({ user: admin });

    await expect(
      caller.priceList({ site: "nonexistent" as any }),
    ).rejects.toThrow(TRPCError);
  });

  test("requires admin permission", async ({ fixtures }) => {
    const user = await fixtures.User({ admin: false });
    const caller = createCaller({ user });

    await expect(caller.priceList({})).rejects.toThrow(TRPCError);
  });

  test("excludes hidden prices", async ({ fixtures }) => {
    const admin = await fixtures.User({ admin: true });
    const caller = createCaller({ user: admin });
    await fixtures.StorePrice({ hidden: true });
    const visiblePrice = await fixtures.StorePrice({ hidden: false });

    const result = await caller.priceList({});

    expect(result.results.length).toBe(1);
    expect(result.results[0].id).toBe(visiblePrice.id);
  });

  test("only includes prices updated within the last week", async ({
    fixtures,
  }) => {
    const admin = await fixtures.User({ admin: true });
    const caller = createCaller({ user: admin });
    const recentPrice = await fixtures.StorePrice();
    const oldPrice = await fixtures.StorePrice();

    // Manually update the oldPrice to be older than a week
    await db
      .update(storePrices)
      .set({ updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) })
      .where(eq(storePrices.id, oldPrice.id));

    const result = await caller.priceList({});

    expect(result.results.length).toBe(1);
    expect(result.results[0].id).toBe(recentPrice.id);
  });
});