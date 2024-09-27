"use client";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/store";
import { useRouter } from "next/navigation";
import React from "react";

const page = () => {
  const name = useStore((state: any) => state.name);
  const { push } = useRouter();
  const redirectToGame = () => {
    push("/game");
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <div className="max-w-[400px] flex flex-col gap-4">
        <h1>Welcome, {name}</h1>
        <Button onClick={redirectToGame} className="p-6">
          Search for a Match
        </Button>
      </div>
    </div>
  );
};

export default page;
