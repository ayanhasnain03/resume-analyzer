"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { data: session } = useSession();
  if (!session) return <div>Not authenticated</div>;

  return (
    <div>
      <Button onClick={() => signOut()}>Sign Out</Button>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
