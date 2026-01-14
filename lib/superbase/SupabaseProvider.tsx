'use client'
import { SupabaseClient } from "@supabase/supabase-js";
import React from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSession } from "@clerk/nextjs";

type Context = {
    supabase: SupabaseClient | null,
    loading: boolean,
}

export const context = React.createContext<Context>({ supabase: null, loading: false });

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const { session } = useSession();
    const [supabase, setSupabase] = React.useState<SupabaseClient | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        if (!session) {
            setLoading(false);
            return;
        }
        const client = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,    
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                accessToken: async () => session?.getToken() ?? null
            }
        );
        setSupabase(client);
        setLoading(false);
    }, [session])

    return (
        <context.Provider value={{ supabase, loading }}>
            {children}
        </context.Provider>
    )
}

export const useSupabase = () => {
    const newcontext = React.useContext(context);
    if (newcontext === undefined) {
        throw new Error("useSupabase need to be inside the provider");
    }
    return newcontext;
}