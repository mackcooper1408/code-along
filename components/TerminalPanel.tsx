'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TerminalPanelProps {
  code: string;
  currentStepId: number;
  totalSteps: number;
  completedSteps: Set<number>;
  onStepChange: (stepId: number) => void;
  onStepComplete: (stepId: number) => void;
}

interface TestResult {
  success: boolean;
  message: string;
  output: string;
}

export default function TerminalPanel({
  code,
  currentStepId,
  totalSteps,
  completedSteps,
  onStepChange,
  onStepComplete,
}: TerminalPanelProps) {
  const [output, setOutput] = useState<string>("Click 'Run Tests' to check your work...");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Reset terminal output when step changes
  useEffect(() => {
    setOutput("Click 'Run Tests' to check your work...");
    setTestResult(null);
  }, [currentStepId]);

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
        body: JSON.stringify({ code, stepId: currentStepId }),
      });

      const result: TestResult = await response.json();
      setTestResult(result);
      setOutput(result.output);

      // Mark step as complete if tests passed
      if (result.success) {
        onStepComplete(currentStepId);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setTestResult({ success: false, message: 'Error', output: '' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepId > 1) {
      onStepChange(currentStepId - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepId < totalSteps) {
      onStepChange(currentStepId + 1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header with Step Navigation and Run Button */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 space-y-3">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Progress</span>
          <span>
            {completedSteps.size} / {totalSteps} steps completed
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
            <div
              key={stepNum}
              className={`h-2 flex-1 rounded ${
                completedSteps.has(stepNum)
                  ? 'bg-green-500'
                  : stepNum === currentStepId
                  ? 'bg-blue-500'
                  : 'bg-slate-700'
              }`}
              title={`Step ${stepNum}${completedSteps.has(stepNum) ? ' (completed)' : ''}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handlePreviousStep}
            disabled={currentStepId === 1 || isLoading}
            variant="outline"
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600"
          >
            ← Previous
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={currentStepId === totalSteps || isLoading}
            variant="outline"
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600"
          >
            Next →
          </Button>
        </div>

        {/* Run Tests Button */}
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
