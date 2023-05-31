import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";

import EntityIcon from "~/components/assets/Entity";
import BottleTable from "~/components/bottleTable";
import Button from "~/components/button";
import Chip from "~/components/chip";
import Layout from "~/components/layout";
import useApi from "~/hooks/useApi";
import useAuth from "~/hooks/useAuth";
import { useSuspenseQuery } from "~/hooks/useSuspenseQuery";
import { defaultClient } from "~/lib/api";
import { authMiddleware } from "~/services/auth.server";
import type { Bottle, Entity, Paginated } from "~/types";

export async function loader({ params, request }: LoaderArgs) {
  const intercept = await authMiddleware({ request });
  if (intercept) return intercept;

  invariant(params.entityId);

  const entity: Entity = await defaultClient.get(
    `/entities/${params.entityId}`,
  );

  return json({ entity });
}

export default function EntityDetails() {
  const api = useApi();
  const { entity } = useLoaderData<typeof loader>();
  const params = useParams();
  invariant(params.entityId);

  const {
    data: { results: bottleList },
  } = useSuspenseQuery(
    ["entity", params.entityId, "bottles"],
    (): Promise<Paginated<Bottle>> =>
      api.get(`/bottles`, {
        query: { entity: params.entityId },
      }),
  );

  const { user } = useAuth();

  const stats = [
    { name: "Bottles", value: entity.totalBottles.toLocaleString() },
  ];

  return (
    <Layout title={entity.name}>
      <div className="my-4 flex min-w-full flex-wrap gap-x-3 gap-y-4  p-3 sm:flex-nowrap sm:py-0">
        <EntityIcon className="hidden h-14 w-auto sm:inline-block" />

        <div className="w-full flex-1 flex-col items-center space-y-1 sm:w-auto sm:items-start">
          <h1 className="mb-2 truncate text-center text-3xl font-semibold leading-7 sm:text-left">
            {entity.name}
          </h1>
          <p className="truncate text-center text-slate-500 sm:text-left">
            {!!entity.country && (
              <>
                Located in{" "}
                <Link
                  to={`/entities?country=${encodeURIComponent(entity.country)}`}
                  className="hover:underline"
                >
                  {entity.country}
                </Link>
              </>
            )}
            {!!entity.region && (
              <span>
                {" "}
                &middot;{" "}
                <Link
                  to={`/entities?region=${encodeURIComponent(entity.region)}`}
                  className="hover:underline"
                >
                  {entity.region}
                </Link>
              </span>
            )}
          </p>
        </div>
        <div className="sm:justify-left mb-4 flex w-full justify-center space-x-2 sm:w-auto">
          {entity.type.sort().map((t) => (
            <Chip
              key={t}
              size="small"
              color="highlight"
              as={Link}
              to={`/entities?type=${encodeURIComponent(t)}`}
            >
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div className="my-8 flex justify-center gap-4 sm:justify-start">
        <Button
          to={`/addBottle?${
            entity.type.indexOf("brand") !== -1 ? `brand=${entity.id}&` : ""
          }${
            entity.type.indexOf("distiller") !== -1
              ? `distiller=${entity.id}`
              : ""
          }${
            entity.type.indexOf("bottler") !== -1 ? `bottler=${entity.id}` : ""
          }`}
          color="primary"
        >
          Add a Bottle
        </Button>

        {user?.mod && (
          <Menu as="div" className="menu">
            <Menu.Button as={Button}>
              <EllipsisVerticalIcon className="h-5 w-5" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right">
              <Menu.Item as={Link} to={`/entities/${entity.id}/edit`}>
                Edit Entity
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )}
      </div>

      <div className="my-8 grid grid-cols-1 items-center gap-3 text-center sm:text-left">
        {stats.map((stat) => (
          <div key={stat.name}>
            <p className="text-peated-light leading-7">{stat.name}</p>
            <p className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <BottleTable
        bottleList={bottleList}
        groupBy={(bottle) => bottle.brand}
        groupTo={(group) => `/entities/${group.id}`}
      />
    </Layout>
  );
}