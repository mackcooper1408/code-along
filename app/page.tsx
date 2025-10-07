'use client';

import React, { useState } from 'react';
import AIPanel from '@/components/AIPanel';
import CodeEditorPanel from '@/components/CodeEditorPanel';
import TerminalPanel from '@/components/TerminalPanel';

export default function Home() {
  const [code, setCode] = useState<string>('');

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Three-panel layout using CSS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_400px] h-full">
        {/* Left Panel: AI Instructions */}
        <AIPanel />

        {/* Center Panel: Code Editor */}
        <CodeEditorPanel onCodeChange={setCode} />

        {/* Right Panel: Terminal Output */}
        <TerminalPanel code={code} />
      </div>
    </div>
  );
}
