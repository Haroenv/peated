import { normalizeBottleName } from "@peated/server/lib/normalize";
import { parseDetailsFromName } from "@peated/server/lib/smws";
import {
  BottleInputSchema,
  type EntityInputSchema,
} from "@peated/server/schemas";
import { type BottlePreviewResult } from "@peated/server/types";
import { TRPCError } from "@trpc/server";
import { type z } from "zod";
import { authedProcedure } from "..";
import { type Context } from "../context";
import { entityById } from "./entityById";

async function getEntity(
  input: number | z.infer<typeof EntityInputSchema>,
  ctx: Context,
) {
  if (typeof input === "number") {
    try {
      return await entityById({ input, ctx });
    } catch (err) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Entity not found [id: ${input}]`,
        cause: err,
      });
    }
  }
  return input;
}

export async function bottleNormalize({
  input,
  ctx,
}: {
  input: z.infer<typeof BottleInputSchema>;
  ctx: Context;
}) {
  const user = ctx.user;
  if (!user) {
    throw new TRPCError({
      message: "Unauthorzed!",
      code: "UNAUTHORIZED",
    });
  }

  const brand = await getEntity(input.brand, ctx);

  const rv: BottlePreviewResult = {
    ...input,
    category: input.category ?? null,
    brand,
    bottler: null,
    distillers: null,
    statedAge: input.statedAge ?? null,
    flavorProfile: input.flavorProfile ?? null,
  };

  if (rv.brand?.name.toLowerCase() === "the scotch malt whisky society") {
    rv.bottler = rv.brand;

    if (input.name) {
      const details = parseDetailsFromName(input.name);
      if (details) {
        rv.name = details.name;

        if (details.category) rv.category = details.category;

        if (details.distiller) {
          const distiller = await getEntity(
            {
              name: details.distiller,
            },
            ctx,
          );
          if (distiller) rv.distillers = [distiller];
        }
      }
    }
  }

  if (!rv.bottler && input.bottler) {
    rv.bottler = await getEntity(input.bottler, ctx);
  }

  if (!rv.distillers && input.distillers) {
    rv.distillers = await Promise.all(
      input.distillers.map((d) => getEntity(d, ctx)),
    );
  }

  // remove duplicate brand name prefix on bottle name
  // e.g. Hibiki 12-year-old => Hibiki
  if (rv.brand && rv.name && rv.name.startsWith(rv.brand.name)) {
    rv.name = rv.name.substring(rv.brand.name.length + 1);
  }

  if (rv.name) {
    const [name, statedAge] = normalizeBottleName(rv.name, rv.statedAge);

    rv.name = name;
    rv.statedAge = statedAge;
  }

  return rv;
}

export default authedProcedure.input(BottleInputSchema).query(bottleNormalize);
