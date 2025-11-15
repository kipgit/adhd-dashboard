/**
 * Brain Dump Input
 * Hero feature - frictionless thought capture
 */

'use client';

import { useState, FormEvent, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export function BrainDumpInput() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addBrainDump = useStore((state) => state.addBrainDump);
  const addToast = useStore((state) => state.addToast);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const { brainDump, suggestion: aiSuggestion } = await api.createBrainDump(content);
      addBrainDump(brainDump);
      addToast('Got it! Thought captured.', 'success');

      if (aiSuggestion) {
        setSuggestion(aiSuggestion);
        setTimeout(() => setSuggestion(''), 5000);
      }

      setContent('');
      textareaRef.current?.focus();
    } catch (error) {
      addToast('Oops, couldn\'t save that thought. Try again?', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? Just type or paste..."
            className={cn(
              'w-full min-h-[120px] p-4 rounded-2xl resize-none',
              'bg-surface dark:bg-dark-surface',
              'border-2 border-border dark:border-dark-border',
              'text-lg text-text dark:text-dark-text',
              'placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary',
              'focus:outline-none focus:border-ios-blue focus:ring-4 focus:ring-ios-blue/20',
              'transition-all'
            )}
            autoFocus
          />

          {content && (
            <div className="absolute bottom-3 right-3">
              <Button
                type="submit"
                size="sm"
                isLoading={isLoading}
              >
                Capture
              </Button>
            </div>
          )}
        </div>

        {suggestion && (
          <div className="p-3 rounded-xl bg-ios-blue/10 text-ios-blue text-sm animate-slide-down">
            💡 {suggestion}
          </div>
        )}

        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
          Press Cmd/Ctrl + Enter to capture quickly
        </p>
      </form>
    </div>
  );
}
