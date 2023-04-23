'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

import type { SupabaseClient } from '@supabase/auth-helpers-nextjs'
//@ts-ignore
import type { Database } from '@/lib/database.types'
import store from "@/app/store/store";
import {Provider} from "react-redux";

type SupabaseContext = {
    supabase: SupabaseClient<Database>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const [supabase] = useState(() => createBrowserSupabaseClient())
    const router = useRouter()

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            router.refresh()
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router, supabase])

    return (
        <Provider store={store}>
        <Context.Provider value={{ supabase }}>

            <>{children}</>

        </Context.Provider>
        </Provider>
    )
}

export const useSupabase = () => {
    const context = useContext(Context)

    if (context === undefined) {
        throw new Error('useSupabase must be used inside SupabaseProvider')
    }

    return context
}