import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function InterviewTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <span className="text-sm text-[#666] flex items-center gap-1 font-mono">
      <Clock className="w-3.5 h-3.5" />
      {display}
    </span>
  );
}

export default InterviewTimer;
