import { NextRequest, NextResponse } from 'next/server';
import { getDockerExecutor } from '@/lib/docker-executor';

interface RunCodeRequest {
  code: string;
  mode?: 'execute' | 'test';
  stepId?: number;
}

interface RunCodeResponse {
  success: boolean;
  message: string;
  output: string;
  executionTime?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RunCodeRequest = await request.json();
    const { code, stepId = 1 } = body;

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: 'No code provided',
          output: 'Error: Code is required',
        },
        { status: 400 }
      );
    }

    const executor = getDockerExecutor();

    // Run tests against the user's code for the specified step
    const result = await executor.runTests(code, stepId);

    // Parse the output to create a user-friendly message
    const output = result.output || 'Test execution completed';
    const success = result.success && output.includes('PASSED');

    const message = success
      ? `✓ Step ${stepId} Passed! Great work!`
      : '✗ Not quite. One or more tests failed.';

    const response: RunCodeResponse = {
      success,
      message,
      output,
      executionTime: result.executionTime,
    };

    console.log('Code execution response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Code execution error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        output: `Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }\n\nPlease make sure Docker is running and try again.`,
      },
      { status: 500 }
    );
  }
}
