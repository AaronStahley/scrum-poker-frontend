"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const RoomNotFound = () => {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/");
    }, 2000); // Redirect after 2 seconds

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="text-center text-red-500">
      Room not found. Redirecting...
    </div>
  );
};

export default RoomNotFound;
