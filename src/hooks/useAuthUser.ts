import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Current signed-in user, plus whether they hold the admin role. The admin
// flag only controls what the UI shows; the database enforces it separately.
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function apply(next: User | null) {
      let admin = false;
      if (next) {
        const { data } = await supabase.rpc("is_admin");
        admin = data === true;
      }
      if (!isMounted) return;
      setUser(next);
      setIsAdmin(admin);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => apply(data.session?.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Defer: supabase calls inside this callback can deadlock the client.
        setTimeout(() => void apply(session?.user ?? null), 0);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading };
}
