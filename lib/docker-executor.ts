/**
 * Docker Code Execution Service
 * Handles secure execution of user code in isolated Docker containers
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const execAsync = promisify(exec);

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

interface ExecutionOptions {
  code: string;
  timeoutMs?: number;
  memoryLimitMb?: number;
}

export class DockerExecutor {
  private readonly imageName = 'codealong-python-runner';
  private readonly tempDir = '/tmp/codealong';
  private readonly defaultTimeout = 10000; // 10 seconds
  private readonly defaultMemoryLimit = 128; // 128 MB

  constructor() {
    this.ensureTempDir();
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Build the Docker image if it doesn't exist
   */
  async buildImage(): Promise<void> {
    try {
      // Check if image exists
      await execAsync(`docker image inspect ${this.imageName}`);
      console.log('Docker image already exists');
    } catch {
      // Image doesn't exist, build it
      console.log('Building Docker image...');
      const dockerfilePath = join(process.cwd(), 'docker');
      await execAsync(`docker build -t ${this.imageName} ${dockerfilePath}`, { timeout: 60000 });
      console.log('Docker image built successfully');
    }
  }

  /**
   * Execute user code in a Docker container
   */
  async executeCode(options: ExecutionOptions): Promise<ExecutionResult> {
    const startTime = Date.now();
    const runId = randomBytes(8).toString('hex');
    const codeFile = join(this.tempDir, `main_${runId}.py`);
    const testFile = join(process.cwd(), 'docker', 'test_step1.py');

    try {
      // Ensure image is built
      await this.buildImage();

      // Write user code to temp file
      await writeFile(codeFile, options.code, 'utf-8');

      const timeout = options.timeoutMs || this.defaultTimeout;
      const memoryLimit = options.memoryLimitMb || this.defaultMemoryLimit;

      // Run code in Docker container with security constraints
      const dockerCommand = [
        'docker run',
        '--rm', // Remove container after execution
        '--network none', // Disable network access
        `--memory=${memoryLimit}m`, // Memory limit
        `--memory-swap=${memoryLimit}m`, // Prevent swap usage
        '--cpus=0.5', // CPU limit
        '--pids-limit=50', // Process limit
        '--read-only', // Read-only filesystem
        '--tmpfs /tmp:rw,noexec,nosuid,size=10m', // Temporary filesystem
        `-v ${codeFile}:/app/main.py:ro`, // Mount user code as read-only
        `-v ${testFile}:/app/test_step1.py:ro`, // Mount test file as read-only
        `--security-opt=no-new-privileges`, // Security hardening
        this.imageName,
        'python',
        '/app/main.py', // Execute user code
      ].join(' ');

      // Execute with timeout
      const { stdout, stderr } = await execAsync(dockerCommand, {
        timeout,
        maxBuffer: 1024 * 1024, // 1MB output limit
      });

      const executionTime = Date.now() - startTime;

      // Clean up temp file
      await this.cleanup(codeFile);

      return {
        success: true,
        output: stdout || stderr || 'Code executed successfully',
        executionTime,
      };
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;
      await this.cleanup(codeFile);

      let errorMessage = 'Execution failed';
      let output = '';

      const err = error as {
        killed?: boolean;
        signal?: string;
        code?: number;
        message?: string;
        stderr?: string;
        stdout?: string;
      };

      if (err.killed || err.signal === 'SIGTERM') {
        errorMessage = 'Execution timeout - your code took too long to run';
        output = 'Error: Code execution exceeded time limit (10 seconds)';
      } else if (err.code === 137) {
        errorMessage = 'Memory limit exceeded';
        output = 'Error: Your code used too much memory';
      } else {
        errorMessage = err.message || 'Unknown error';
        output = err.stderr || err.stdout || errorMessage;
      }

      return {
        success: false,
        output,
        error: errorMessage,
        executionTime,
      };
    }
  }

  /**
   * Run tests against user code
   */
  async runTests(code: string, stepId: number = 1): Promise<ExecutionResult> {
    const startTime = Date.now();
    const runId = randomBytes(8).toString('hex');
    const codeFile = join(this.tempDir, `main_${runId}.py`);
    const testFile = join(process.cwd(), 'docker', `test_step${stepId}.py`);

    try {
      await this.buildImage();
      await writeFile(codeFile, code, 'utf-8');

      // Run tests in a container
      const dockerCommand = [
        'docker run',
        '--rm',
        '--network none',
        '--memory=128m',
        '--cpus=0.5',
        '--pids-limit=50',
        `--tmpfs /tmp:rw,noexec,nosuid,size=10m`,
        `-v ${codeFile}:/app/main.py:ro`,
        `-v ${testFile}:/app/test_step1.py:ro`,
        '--security-opt=no-new-privileges',
        this.imageName,
        'python',
        '/app/test_step1.py',
      ].join(' ');

      const { stdout, stderr } = await execAsync(dockerCommand, {
        timeout: 10000,
        maxBuffer: 1024 * 1024,
      });

      const executionTime = Date.now() - startTime;
      await this.cleanup(codeFile);

      // Check if tests passed
      const output = stdout || stderr;
      const success = output.includes('All tests passed') || output.includes('PASSED');

      return {
        success,
        output: output || 'Tests completed',
        executionTime,
      };
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;
      await this.cleanup(codeFile);

      const err = error as { stderr?: string; stdout?: string; message?: string };

      return {
        success: false,
        output: err.stderr || err.stdout || 'Test execution failed',
        error: err.message,
        executionTime,
      };
    }
  }

  private async cleanup(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('Failed to clean up temp file:', error);
    }
  }
}

// Singleton instance
let executorInstance: DockerExecutor | null = null;

export function getDockerExecutor(): DockerExecutor {
  if (!executorInstance) {
    executorInstance = new DockerExecutor();
  }
  return executorInstance;
}
