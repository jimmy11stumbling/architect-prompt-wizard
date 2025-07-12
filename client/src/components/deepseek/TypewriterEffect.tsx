
import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  showCursor?: boolean;
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterEffect({
  text,
  speed = 50,
  showCursor = false,
  className = '',
  onComplete
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursorBlink, setShowCursorBlink] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete && currentIndex === text.length) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  // Cursor blink effect
  useEffect(() => {
    if (showCursor) {
      const interval = setInterval(() => {
        setShowCursorBlink(prev => !prev);
      }, 530);

      return () => clearInterval(interval);
    }
  }, [showCursor]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <span className={`inline-block w-0.5 h-4 bg-current ml-0.5 ${showCursorBlink ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
          |
        </span>
      )}
    </span>
  );
}
