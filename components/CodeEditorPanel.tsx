'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Step } from '@/lib/steps-data';

interface CodeEditorPanelProps {
  step: Step;
  onCodeChange?: (code: string) => void;
}

export default function CodeEditorPanel({ step, onCodeChange }: CodeEditorPanelProps) {
  const [code, setCode] = useState<string>(step.initialCode);

  // Update code when step changes
  useEffect(() => {
    setCode(step.initialCode);
    if (onCodeChange) {
      onCodeChange(step.initialCode);
    }
  }, [step.id, step.initialCode, onCodeChange]);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* File Navigator */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 text-sm font-medium">main.py</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
}
