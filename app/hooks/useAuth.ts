import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || '@logicmonitor.com';

    const supabase = supabaseBrowser;

    const isAllowedDomain = (email?: string | null) => {
        return email?.endsWith(allowedDomain);
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setIsLoading(false)

            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                (_event, session) => {
                    setUser(session?.user ?? null)
                }
            )

            return subscription
        }

        let subscription: { unsubscribe: () => void } | undefined;
        getUser().then(sub => {
            subscription = sub;
        });

        return () => {
            subscription?.unsubscribe();
        }
    }, [])

    return {
        isAuthenticated: !!user,
        isAuthorized: isAllowedDomain(user?.email),
        user,
        isLoading,
    }
} 