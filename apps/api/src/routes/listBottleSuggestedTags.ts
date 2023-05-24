import { desc, eq, or, sql } from "drizzle-orm";
import type { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { db } from "../db";
import { bottleTags, bottles } from "../db/schema";
import { shuffle } from "../lib/rand";
import { defaultTags } from "../lib/tags";

export default {
  method: "GET",
  url: "/bottles/:bottleId/suggestedTags",
  schema: {
    params: {
      type: "object",
      required: ["bottleId"],
      properties: {
        bottleId: { type: "number" },
      },
    },
    response: {
      200: zodToJsonSchema(
        z.object({
          results: z.array(
            z.object({
              name: z.string(),
              count: z.number(),
            }),
          ),
        }),
      ),
    },
  },
  handler: async (req, res) => {
    const [bottle] = await db
      .select()
      .from(bottles)
      .where(eq(bottles.id, req.params.bottleId));

    if (!bottle) {
      return res.status(404).send({ error: "Not found" });
    }

    const usedTags = Object.fromEntries(
      (
        await db
          .select({
            tag: bottleTags.tag,
            total: sql<number>`SUM(${bottleTags.count})`.as("total"),
          })
          .from(bottleTags)
          .innerJoin(bottles, eq(bottles.id, bottleTags.bottleId))
          .where(
            or(
              eq(bottleTags.bottleId, bottle.id),
              eq(bottles.brandId, bottle.id),
            ),
          )
          .groupBy(bottleTags.tag)
          .orderBy(desc(sql`total`))
      ).map((t) => [t.tag, t.total]),
    );

    const results = shuffle(defaultTags)
      .map((t) => ({
        name: t,
        count: usedTags[t] || 0,
      }))
      .sort((a, b) => b.count - a.count);

    res.send({
      results,
    });
  },
} as RouteOptions<
  Server,
  IncomingMessage,
  ServerResponse,
  {
    Params: {
      bottleId: number;
    };
  }
>;
