"use client";

import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FadeInViewProps {
    children: ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    className?: string;
}

export function FadeInView({ children, delay = 0, direction = 'up', className }: FadeInViewProps) {
    const { ref, isVisible } = useScrollReveal({
        threshold: 0.1,
        triggerOnce: true,
    });

    const getDirectionClasses = () => {
        switch (direction) {
            case 'up': return 'translate-y-8';
            case 'down': return '-translate-y-8';
            case 'left': return 'translate-x-8';
            case 'right': return '-translate-x-8';
            default: return '';
        }
    };

    return (
        <div
            ref={ref}
            className={cn(
                'transition-all duration-700 ease-out-expo will-change-[transform,opacity]',
                isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${getDirectionClasses()}`,
                className
            )}
            style={{
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
