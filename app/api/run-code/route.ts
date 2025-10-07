import { NextRequest, NextResponse } from 'next/server';

interface RunCodeRequest {
  code: string;
}

interface RunCodeResponse {
  success: boolean;
  message: string;
  output: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RunCodeRequest = await request.json();
    const { code } = body;

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

    // Simulate execution delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock logic: Check if code includes 'bind'
    const includesBind = code.includes('bind');

    const response: RunCodeResponse = includesBind
      ? {
          success: true,
          message: 'Step 1 Passed! Your server started correctly.',
          output:
            'Running tests...\n- Test: Server binds to port 6379... PASSED\n- Test: Server accepts a connection... PASSED',
        }
      : {
          success: false,
          message: 'Not quite. One test failed.',
          output:
            'Running tests...\n- Test: Server binds to port 6379... FAILED\n\nHint: Have you used the `socket.bind()` method to attach your server to an address?',
        };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
