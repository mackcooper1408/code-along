'use client';

import React, { useState } from 'react';
import AIPanel from '@/components/AIPanel';
import CodeEditorPanel from '@/components/CodeEditorPanel';
import TerminalPanel from '@/components/TerminalPanel';
import { STEPS, getStepById } from '@/lib/steps-data';

export default function Home() {
  const [currentStepId, setCurrentStepId] = useState<number>(1);
  const [code, setCode] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStep = getStepById(currentStepId);

  const handleStepChange = (newStepId: number) => {
    setCurrentStepId(newStepId);
    // Load the initial code for the new step
    const newStep = getStepById(newStepId);
    if (newStep) {
      setCode(newStep.initialCode);
    }
  };

  const handleStepComplete = (stepId: number) => {
    setCompletedSteps((prev) => new Set(prev).add(stepId));
  };

  if (!currentStep) {
    return <div>Error: Step not found</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Three-panel layout using CSS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_400px] h-full">
        {/* Left Panel: AI Instructions */}
        <AIPanel step={currentStep} />

        {/* Center Panel: Code Editor */}
        <CodeEditorPanel
          step={currentStep}
          onCodeChange={setCode}
        />

        {/* Right Panel: Terminal Output */}
        <TerminalPanel
          code={code}
          currentStepId={currentStepId}
          totalSteps={STEPS.length}
          completedSteps={completedSteps}
          onStepChange={handleStepChange}
          onStepComplete={handleStepComplete}
        />
      </div>
    </div>
  );
}
