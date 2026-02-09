import { useState, useEffect, useRef } from 'react';

/**
 * Hook that smoothly reveals text content at a natural, adaptive pace.
 * 
 * SSE chunks arrive in bursts (network batching + React batching).
 * This hook smooths that out by revealing characters at a steady rate,
 * creating a typing effect similar to Claude.ai.
 * 
 * KEY: Initializes displayedText to the FULL content on mount.
 * This means messages loaded from the database render instantly.
 * Only text that arrives AFTER mount gets the typing animation.
 * 
 * @param {string} content - The full text received so far (grows as chunks arrive)
 * @returns {string} - The portion of text to display right now
 */
export const useStreamingText = (content = '') => {
  // Initialize with full content so pre-existing messages show instantly
  const [displayedText, setDisplayedText] = useState(content);
  const displayedLengthRef = useRef(content.length);
  const targetTextRef = useRef(content);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const isRunningRef = useRef(false);

  // Keep target in sync (synchronous assignment, no effect needed)
  targetTextRef.current = content;

  const startLoop = () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    lastTimeRef.current = null;

    const tick = (now) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const target = targetTextRef.current;
      const cur = displayedLengthRef.current;
      const behind = target.length - cur;

      if (behind > 0) {
        // Adaptive speed: comfortable reading pace, accelerates when buffer grows
        // 80 c/s base (~16 words/sec), scales up to 1500 c/s when very behind
        const speed = Math.min(1500, 80 + behind * 4);
        const chars = Math.max(1, Math.round((speed / 1000) * dt));
        const newLen = Math.min(cur + chars, target.length);

        displayedLengthRef.current = newLen;
        setDisplayedText(target.slice(0, newLen));

        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        // Caught up — stop loop, wait for new content to restart it
        isRunningRef.current = false;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  // When content grows beyond what we've displayed, start/resume animation
  useEffect(() => {
    if (content.length > displayedLengthRef.current) {
      startLoop();
    }
  }, [content]);

  // Reset everything when content is cleared
  useEffect(() => {
    if (!content) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
      isRunningRef.current = false;
      lastTimeRef.current = null;
      displayedLengthRef.current = 0;
      setDisplayedText('');
    }
  }, [content]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return displayedText;
};
