'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TerminalPanelProps {
  code: string;
}

interface TestResult {
  success: boolean;
  message: string;
  output: string;
}

export default function TerminalPanel({ code }: TerminalPanelProps) {
  const [output, setOutput] = useState<string>("Click 'Run Tests' to check your work...");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleRunTests = async () => {
    setIsLoading(true);
    setOutput('Running tests...');
    setTestResult(null);

    try {
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result: TestResult = await response.json();
      setTestResult(result);
      setOutput(result.output);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setTestResult({ success: false, message: 'Error', output: '' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header with Run Button */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <Button
          onClick={handleRunTests}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
        >
          {isLoading ? 'Running...' : 'Run Tests'}
        </Button>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Success/Failure Message */}
        {testResult && (
          <div
            className={`mb-3 px-3 py-2 rounded text-sm font-semibold ${
              testResult.success
                ? 'bg-green-900/50 text-green-300 border border-green-700'
                : 'bg-red-900/50 text-red-300 border border-red-700'
            }`}
          >
            {testResult.message}
          </div>
        )}

        {/* Output Text */}
        <pre className="text-slate-300 text-sm font-mono whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}
