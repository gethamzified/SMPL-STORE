'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

type RevealVariant =
  | 'fade'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scale'
  | 'blur'
  | 'typewriter'
  | 'wave'
  | 'stagger'
  | 'rotate'
  | 'elastic';

interface TextRevealProps {
  children: string;
  variant?: RevealVariant;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  staggerDelay?: number;
  once?: boolean;
  startOnView?: boolean;
  wordLevel?: boolean;
  onComplete?: () => void;
}

const getVariantClasses = (variant: RevealVariant, isVisible: boolean) => {
  const baseTransition = 'transition-all ease-out-expo will-change-[transform,opacity,filter]';
  let hidden = '';
  let visible = '';

  switch (variant) {
    case 'slideUp':
    case 'stagger':
      hidden = 'opacity-0 translate-y-8 scale-95';
      visible = 'opacity-100 translate-y-0 scale-100';
      break;
    case 'slideDown':
      hidden = 'opacity-0 -translate-y-6 scale-98';
      visible = 'opacity-100 translate-y-0 scale-100';
      break;
    case 'slideLeft':
      hidden = 'opacity-0 translate-x-12 skew-x-2';
      visible = 'opacity-100 translate-x-0 skew-x-0';
      break;
    case 'slideRight':
      hidden = 'opacity-0 -translate-x-12 -skew-x-2';
      visible = 'opacity-100 translate-x-0 skew-x-0';
      break;
    case 'scale':
      hidden = 'opacity-0 scale-75';
      visible = 'opacity-100 scale-100';
      break;
    case 'blur':
      hidden = 'opacity-0 blur-md scale-105';
      visible = 'opacity-100 blur-0 scale-100';
      break;
    case 'rotate':
      hidden = 'opacity-0 rotate-12 scale-90 translate-y-4';
      visible = 'opacity-100 rotate-0 scale-100 translate-y-0';
      break;
    case 'wave':
      hidden = 'opacity-0 translate-y-4 rotate-3';
      visible = 'opacity-100 translate-y-0 rotate-0';
      break;
    case 'elastic':
      hidden = 'opacity-0 scale-50';
      visible = 'opacity-100 scale-100';
      // override base transition for elastic feel
      return `${isVisible ? visible : hidden} transition-all duration-1000 cubic-bezier(0.68,-0.55,0.265,1.55) will-change-[transform,opacity]`;
    case 'typewriter':
      // Basic typing effect fallback via simple reveal
      hidden = 'opacity-0';
      visible = 'opacity-100';
      break;
    case 'fade':
    default:
      hidden = 'opacity-0';
      visible = 'opacity-100';
      break;
  }

  return `${baseTransition} ${isVisible ? visible : hidden}`;
};

/**
 * Premium CSS-Only Text Reveal
 * Replaces Framer Motion with tailored CSS transitions, Intersection Observer, and hardware acceleration (will-change)
 * to maintain the clean, staggered feel of the original hero animations.
 */
export function TextReveal({
  children,
  variant = 'fade',
  className,
  style,
  delay = 0,
  duration = 0.8,
  staggerDelay = 0.04,
  once = true,
  startOnView = true,
  wordLevel = false,
}: TextRevealProps) {
  const { ref, isVisible } = useScrollReveal({
    threshold: 0.1,
    triggerOnce: once,
  });

  const [hasAnimated, setHasAnimated] = useState(false);
  const shouldAnimate = startOnView ? isVisible : true;

  useEffect(() => {
    if (shouldAnimate && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [shouldAnimate, hasAnimated]);

  // Determine state for animations
  const isActive = shouldAnimate || hasAnimated;
  const lines = children.split('\n');

  const renderElements = (text: string, lineIndex: number) => {
    const elements = wordLevel
      ? text.split(' ').map((word, i, arr) => (i < arr.length - 1 ? `${word} ` : word))
      : text.split('');

    // Calculate a progressive offset so each line continues the stagger sequence
    const previousLinesLength = lines
      .slice(0, lineIndex)
      .reduce((acc, line) => acc + (wordLevel ? line.split(' ').length : line.length), 0);

    return elements.map((element, index) => {
      const globalIndex = previousLinesLength + index;
      const elementDelay = delay + globalIndex * staggerDelay;

      return (
        <span
          key={`${lineIndex}-${index}`}
          className={cn('inline-block', getVariantClasses(variant, isActive), {
            'whitespace-pre': !wordLevel,
          })}
          style={{
            transitionDuration: `${duration}s`,
            transitionDelay: `${elementDelay}s`,
            transformOrigin: variant === 'rotate' ? 'center center' : undefined,
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        >
          {element === ' ' ? '\u00A0' : element}
        </span>
      );
    });
  };

  return (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      style={style}
    >
      {lines.map((line, i) => (
        <div key={i} className="block overflow-hidden pb-1">
          {renderElements(line, i)}
        </div>
      ))}
    </div>
  );
}
