import React from 'react';

export default function AIPanel() {
  return (
    <div className="h-full bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Step 1: Listening for Connections</h2>
        <p className="text-slate-700 leading-relaxed">
          Let&apos;s start by creating a simple TCP server using Python&apos;s socket library that
          can accept a single client connection.
        </p>
      </div>
    </div>
  );
}
