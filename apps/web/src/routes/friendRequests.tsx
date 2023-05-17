import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/button";
import EmptyActivity from "../components/emptyActivity";
import ListItem from "../components/listItem";
import TimeSince from "../components/timeSince";
import UserAvatar from "../components/userAvatar";
import { useSuspenseQuery } from "../hooks/useSuspenseQuery";
import api from "../lib/api";
import type { FollowRequest, FollowStatus, Paginated } from "../types";

export default function FriendRequests() {
  const {
    data: { results: requestList },
  } = useSuspenseQuery(
    ["friends", "pending"],
    (): Promise<Paginated<FollowRequest>> =>
      api.get("/users/me/followers", {
        query: {
          status: "pending",
        },
      }),
  );

  const [theirFollowStatus, setTheirFollowStatus] = useState<
    Record<string, FollowStatus>
  >(Object.fromEntries(requestList.map((r) => [r.id, r.status])));

  const [myFollowStatus, setMyFollowStatus] = useState<
    Record<string, FollowStatus>
  >(Object.fromEntries(requestList.map((r) => [r.user.id, r.followsBack])));

  const acceptRequest = async (id: string) => {
    const data = await api.put(`/users/me/followers/${id}`, {
      data: { action: "accept" },
    });
    setTheirFollowStatus((state) => ({
      ...state,
      [id]: data.status,
    }));
  };

  const followUser = async (toUserId: string, follow: boolean) => {
    const data = await api[follow ? "post" : "delete"](
      `/users/${toUserId}/follow`,
    );
    setMyFollowStatus((state) => ({
      ...state,
      [toUserId]: data.status,
    }));
  };

  const followLabel = (status: FollowStatus) => {
    switch (status) {
      case "following":
        return "Unfollow";
      case "pending":
        return "Request Sent";
      case "none":
      default:
        return "Follow Back";
    }
  };

  return (
    <ul role="list" className="divide-y divide-slate-800 sm:rounded">
      {requestList.length ? (
        requestList.map(({ user, ...follow }) => {
          return (
            <ListItem key={user.id}>
              <div className="flex flex-1 items-center space-x-4">
                <UserAvatar size={48} user={user} />
                <div className="flex-1 space-y-1 font-medium">
                  <Link to={`/users/${user.id}`} className="hover:underline">
                    {user.displayName}
                  </Link>
                  <TimeSince
                    className="text-peated-light block text-sm font-light"
                    date={follow.createdAt}
                  />
                </div>
                <div className="flex items-center gap-x-4">
                  <Button
                    color="primary"
                    onClick={() => {
                      if (theirFollowStatus[follow.id] === "pending") {
                        acceptRequest(follow.id);
                      } else {
                        followUser(user.id, myFollowStatus[user.id] === "none");
                      }
                    }}
                  >
                    {theirFollowStatus[follow.id] === "pending"
                      ? "Accept"
                      : followLabel(myFollowStatus[user.id])}
                  </Button>
                </div>
              </div>
            </ListItem>
          );
        })
      ) : (
        <EmptyActivity>There's no requests pending.</EmptyActivity>
      )}
    </ul>
  );
}
