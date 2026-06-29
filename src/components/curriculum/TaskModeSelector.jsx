import React from 'react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { FileText, MessageCircle, Sparkles, History } from 'lucide-react';
import { cn } from '../../lib/utils';

// The three mutually-exclusive task_mode values a chat-type task can take.
// `conversation` and `personalized` are intentionally separate paths in the
// learning engine — conversation is the legacy fixed AI chat, personalized is
// the V2 coach loop — so a task is only ever one of them at a time.
export const TASK_MODE_OPTIONS = [
  {
    value: 'basic',
    title: 'Basic Task',
    icon: FileText,
    description:
      'No AI interaction. The builder reads the task and submits a deliverable (or nothing). Use for stand-ups, breaks, and simple instructions.',
  },
  {
    value: 'conversation',
    title: 'Conversation Mode',
    icon: MessageCircle,
    description:
      'A fixed AI chat: the builder works through your intro, scripted questions, and conclusion — the same guided flow for every builder.',
  },
  {
    value: 'personalized',
    title: 'Personalized Mode',
    icon: Sparkles,
    description:
      "The V2 coach adapts the lesson to each builder's skill level and learning style, then grades their deliverable against competency criteria. Set the learning goal & criteria at upload time.",
  },
];

/**
 * Mutually-exclusive task-mode picker rendered as selectable cards.
 * `value` is the task_mode string; anything other than conversation/personalized
 * is treated as basic. `onChange(mode)` receives the new task_mode.
 * Pass `onHistory` to show a field-history button (edit dialog only).
 */
const TaskModeSelector = ({ value, onChange, disabled = false, onHistory }) => {
  const current = value === 'conversation' || value === 'personalized' ? value : 'basic';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-proxima-bold text-[#1E1E1E]">Task Mode</Label>
        {onHistory && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onHistory}
            className="h-8 text-[#666] hover:text-[#4242EA]"
          >
            <History className="h-4 w-4 mr-1" />
            History
          </Button>
        )}
      </div>
      <p className="text-xs text-[#666] font-proxima">
        Choose how this task runs — a task can only be in one mode at a time.
      </p>
      <RadioGroup
        value={current}
        onValueChange={(mode) => onChange?.(mode)}
        disabled={disabled}
        className="gap-3 pt-1"
      >
        {TASK_MODE_OPTIONS.map((mode) => {
          const Icon = mode.icon;
          const selected = current === mode.value;
          return (
            <Label
              key={mode.value}
              htmlFor={`task-mode-${mode.value}`}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 transition-colors',
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                selected
                  ? 'border-[#4242EA] bg-[#4242EA]/[0.06] ring-1 ring-[#4242EA]'
                  : 'border-[#E3E3E3] bg-[#F5F5F5] hover:border-[#C8C8C8]'
              )}
            >
              <RadioGroupItem
                value={mode.value}
                id={`task-mode-${mode.value}`}
                className="mt-0.5 border-[#C8C8C8] text-[#4242EA]"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-proxima-bold text-[#1E1E1E]">
                  <Icon className={cn('h-4 w-4', selected ? 'text-[#4242EA]' : 'text-[#666]')} />
                  {mode.title}
                </div>
                <p className="text-xs text-[#666] font-proxima leading-relaxed">
                  {mode.description}
                </p>
              </div>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default TaskModeSelector;
