"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const HomeView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.hello.queryOptions({
      text: "ayan",
    })
  );
  return (
    <div className="">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
export const HomeViewLoading = () => {
  return <h1>Loading...</h1>;
};
export const HomeViewError = () => {
  return <h1>Something went wrong</h1>;
};
