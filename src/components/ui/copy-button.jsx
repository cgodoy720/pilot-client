import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

export function CopyButton({
  content,
  copied: controlledCopied,
  onCopiedChange,
  delay = 3000,
  variant = 'outline',
  size = 'icon',
  className,
  ...props
}) {
  const [internalCopied, setInternalCopied] = React.useState(false);
  const copied = controlledCopied !== undefined ? controlledCopied : internalCopied;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      
      if (controlledCopied === undefined) {
        setInternalCopied(true);
      }
      
      onCopiedChange?.(true, content);

      setTimeout(() => {
        if (controlledCopied === undefined) {
          setInternalCopied(false);
        }
        onCopiedChange?.(false, content);
      }, delay);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn('transition-all', className)}
      {...props}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

