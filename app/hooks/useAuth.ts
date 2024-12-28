import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = supabaseBrowser;

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

        // Execute getUser and store the subscription
        let subscription: { unsubscribe: () => void } | undefined;
        getUser().then(sub => {
            subscription = sub;
        });

        // Return the cleanup function directly in useEffect
        return () => {
            subscription?.unsubscribe();
        }
    }, [])

    return {
        isAuthenticated: !!user,
        user,
        isLoading,
    }
} 