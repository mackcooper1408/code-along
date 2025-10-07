# Docker-Based Code Execution

This directory contains the Docker infrastructure for safely executing user code in isolated containers.

## Overview

The code execution system uses Docker containers to:

- Run user code in an isolated environment
- Enforce resource limits (CPU, memory, time)
- Prevent network access
- Execute tests against user code
- Provide secure, sandboxed execution

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js API Route                     │
│                  /api/run-code/route.ts                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Docker Executor Service                 │
│                lib/docker-executor.ts                    │
│  • Manages Docker containers                            │
│  • Enforces security constraints                        │
│  • Handles timeouts and errors                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Docker Container                       │
│              codealong-python-runner                     │
│  • Python 3.11 runtime                                  │
│  • Executes user code                                   │
│  • Runs test suite                                      │
│  • Isolated, read-only filesystem                       │
└─────────────────────────────────────────────────────────┘
```

## Files

### Dockerfile

Defines the Python runtime environment for executing user code.

**Features:**

- Based on Python 3.11 slim image
- Includes pytest for testing
- Runs as non-root user (coderunner)
- Minimal attack surface

### test_step1.py

Test suite for validating Step 1 (TCP server creation).

**Tests:**

- Server binds to port 6379
- Server accepts client connections

## Security Measures

The Docker executor implements multiple layers of security:

### 1. Container Isolation

- `--network none`: No network access
- `--read-only`: Filesystem is read-only
- User code mounted as read-only volume

### 2. Resource Limits

- **Memory**: 128 MB limit
- **CPU**: 0.5 CPU cores
- **Processes**: Maximum 50 processes
- **Time**: 10-second timeout
- **Output**: 1 MB buffer limit

### 3. Security Options

- `--security-opt=no-new-privileges`: Prevents privilege escalation
- Non-root user execution
- Temporary filesystem with restrictions

### 4. Automatic Cleanup

- Containers removed after execution (`--rm`)
- Temporary files cleaned up
- No persistent state

## Setup

### Prerequisites

1. **Docker Desktop** must be installed and running

   - macOS: https://docs.docker.com/desktop/install/mac-install/
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Linux: https://docs.docker.com/desktop/install/linux-install/

2. Verify Docker is running:
   ```bash
   docker info
   ```

### Build the Image

Run the setup script from the project root:

```bash
./scripts/setup-docker.sh
```

Or manually build:

```bash
docker build -t codealong-python-runner ./docker
```

### Verify the Image

```bash
docker images | grep codealong-python-runner
```

## Usage

The Docker executor is automatically used by the `/api/run-code` endpoint. No additional configuration needed.

### Testing the Docker Setup

1. Start the dev server:

   ```bash
   npm run dev
   ```

2. Write some Python code in the editor

3. Click "Run Tests"

The system will:

1. Write your code to a temporary file
2. Spin up a Docker container
3. Execute your code with tests
4. Return results
5. Clean up container and temp files

## Troubleshooting

### "Docker is not running"

**Solution**: Start Docker Desktop application

### "Permission denied" errors

**Solution**: Ensure Docker has proper permissions:

```bash
# macOS/Linux
sudo chmod 666 /var/run/docker.sock
```

### "Image not found"

**Solution**: Build the image:

```bash
./scripts/setup-docker.sh
```

### Slow execution

**Possible causes**:

- First run (image needs to be downloaded/built)
- Docker Desktop resource limits too low
- System under heavy load

**Solution**: Adjust Docker Desktop resource allocation in Settings

### Container timeout errors

**Possible causes**:

- User code has infinite loop
- Code takes too long to execute

**Solution**: This is expected behavior for runaway code

## Development

### Modifying the Docker Image

1. Edit `Dockerfile` or add dependencies
2. Rebuild the image:
   ```bash
   docker build -t codealong-python-runner ./docker
   ```

### Adding New Tests

1. Create test file in `docker/` directory
2. Update `docker-executor.ts` to use new test
3. Rebuild image if needed

### Testing Docker Executor Locally

```typescript
import { getDockerExecutor } from '@/lib/docker-executor';

const executor = getDockerExecutor();

const code = `
import socket

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(('localhost', 6379))
    server.listen(1)
    print("Server started!")

if __name__ == "__main__":
    main()
`;

const result = await executor.runTests(code);
console.log(result);
```

## Performance Considerations

- **Cold start**: ~2-3 seconds (first container launch)
- **Warm start**: ~1-2 seconds (subsequent runs)
- **Container overhead**: ~50-100 MB memory
- **Cleanup time**: <100ms

## Future Enhancements

- [ ] Support for multiple Python versions
- [ ] Persistent test result caching
- [ ] Container pooling for faster execution
- [ ] Support for additional languages (Node.js, Java, etc.)
- [ ] More granular resource controls
- [ ] Detailed execution metrics
- [ ] Network isolation with allowed endpoints

## Security Notes

⚠️ **Never run user code directly on the host system**

Always use Docker containers for isolation. The current setup provides:

- Process isolation
- Filesystem isolation
- Network isolation
- Resource limits
- Timeout enforcement

This prevents:

- File system access to host
- Network attacks
- Resource exhaustion
- Privilege escalation
- Data exfiltration

## References

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Container Isolation](https://docs.docker.com/engine/security/seccomp/)
- [Resource Constraints](https://docs.docker.com/config/containers/resource_constraints/)
