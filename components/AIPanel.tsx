import React from 'react';
import { Step } from '@/lib/steps-data';

interface AIPanelProps {
  step: Step;
}

export default function AIPanel({ step }: AIPanelProps) {
  return (
    <div className="h-full bg-slate-50 border-r border-slate-200 overflow-y-auto">
      <div className="p-6">
        {/* Step Badge */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
            Step {step.id} of 5
          </span>
          {step.estimatedMinutes && (
            <span className="ml-2 text-xs text-slate-500">
              ~{step.estimatedMinutes} min
            </span>
          )}
        </div>

        {/* Step Title */}
        <h2 className="text-2xl font-bold text-slate-800 mb-3">{step.title}</h2>

        {/* Step Description */}
        <p className="text-slate-600 leading-relaxed mb-6">{step.description}</p>

        {/* Detailed Instructions - Rendered with basic markdown-style formatting */}
        <div className="prose prose-slate prose-sm max-w-none text-slate-700">
          {step.instructions.split('\n').map((line, index) => {
            // Handle markdown-style headings
            if (line.startsWith('### ')) {
              return (
                <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-slate-800">
                  {line.substring(4)}
                </h3>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-slate-900">
                  {line.substring(3)}
                </h2>
              );
            }
            if (line.startsWith('#### ')) {
              return (
                <h4 key={index} className="text-base font-semibold mt-3 mb-2 text-slate-800">
                  {line.substring(5)}
                </h4>
              );
            }
            // Handle list items
            if (line.trim().startsWith('- ')) {
              return (
                <li key={index} className="ml-4 mb-1">
                  {line.trim().substring(2)}
                </li>
              );
            }
            // Handle code blocks
            if (line.trim().startsWith('```')) {
              return <div key={index} className="my-2" />;
            }
            // Handle bold text with ** or __
            if (line.includes('**')) {
              const parts = line.split('**');
              return (
                <p key={index} className="mb-2">
                  {parts.map((part, i) =>
                    i % 2 === 1 ? (
                      <strong key={i} className="font-semibold">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              );
            }
            // Handle inline code with `
            if (line.includes('`') && !line.startsWith('```')) {
              const parts = line.split('`');
              return (
                <p key={index} className="mb-2">
                  {parts.map((part, i) =>
                    i % 2 === 1 ? (
                      <code key={i} className="px-1 py-0.5 bg-slate-200 rounded text-sm font-mono">
                        {part}
                      </code>
                    ) : (
                      part
                    )
                  )}
                </p>
              );
            }
            // Regular paragraphs
            if (line.trim()) {
              return (
                <p key={index} className="mb-2 leading-relaxed">
                  {line}
                </p>
              );
            }
            // Empty lines
            return <div key={index} className="h-2" />;
          })}
        </div>
      </div>
    </div>
  );
}
