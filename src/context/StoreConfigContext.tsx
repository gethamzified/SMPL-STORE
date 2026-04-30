"use client";

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { StoreConfig } from '@/services/config';
import { formatCurrency as utilsFormatCurrency, CurrencyConfig } from '@/lib/utils';

interface StoreConfigContextType {
    config: StoreConfig;
}

const StoreConfigContext = createContext<StoreConfigContextType | undefined>(undefined);

export function StoreConfigProvider({
    children,
    initialConfig
}: {
    children: React.ReactNode;
    initialConfig: StoreConfig;
}) {
    // Use initialConfig directly — no state needed since config comes from server via props.
    // Avoids unnecessary re-render cycle from useEffect → setState.
    const config = initialConfig;

    const contextValue = useMemo(() => ({ config }), [config]);

    return (
        <StoreConfigContext.Provider value={contextValue}>
            {children}
        </StoreConfigContext.Provider>
    );
}

export function useStoreConfig() {
    const context = useContext(StoreConfigContext);
    if (context === undefined) {
        throw new Error('useStoreConfig must be used within a StoreConfigProvider');
    }
    return context.config;
}

/**
 * Hook to get the currency formatter with the correct configuration
 * Use this in Client Components to avoid flashes.
 */
export function useFormatCurrency() {
    const { currency } = useStoreConfig();

    return useCallback((amount: number) => {
        return utilsFormatCurrency(amount, currency);
    }, [currency]);
}
