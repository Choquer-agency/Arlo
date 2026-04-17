'use client';
import { cn } from '@/lib/utils';
import { useMotionValue, animate, motion } from 'framer-motion';
import { useEffect } from 'react';
import useMeasure from 'react-use-measure';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
  speed?: number;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  direction = 'horizontal',
  reverse = false,
  className,
  speed,
}: InfiniteSliderProps) {
  const effectiveDuration = speed ? 80 / speed * 25 : duration;
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);

  useEffect(() => {
    const size = direction === 'horizontal' ? width : height;
    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    const controls = animate(translation, [from, to], {
      ease: 'linear',
      duration: effectiveDuration,
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 0,
      onRepeat: () => {
        translation.set(from);
      },
    });

    return controls?.stop;
  }, [translation, effectiveDuration, width, height, gap, direction, reverse]);

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className='flex w-max items-center'
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
