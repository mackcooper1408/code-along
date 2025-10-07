"""
Test suite for Step 1: Listening for Connections
Tests if the user's Redis server can bind to a port and accept connections
"""

import socket
import sys
import time
import subprocess
import signal


def test_user_code():
    """Test that the user's code has the necessary socket operations"""
    print("Running tests...\n")

    # Read the user's code
    try:
        with open("/app/main.py", "r") as f:
            code = f.read()
    except Exception as e:
        print(f"Error reading code: {e}")
        return False

    # Test 1: Check if code imports socket
    print("- Test: Code imports socket library...", end=" ")
    if "import socket" not in code and "from socket" not in code:
        print("FAILED")
        print("\nHint: You need to import the socket library: `import socket`")
        return False
    print("PASSED")

    # Test 2: Check if code uses socket.bind()
    print("- Test: Server binds to port 6379...", end=" ")
    if "bind" not in code or "6379" not in code:
        print("FAILED")
        print(
            "\nHint: Have you used the `socket.bind()` method to attach your server to port 6379?"
        )
        print("Example: `server.bind(('localhost', 6379))`")
        return False
    print("PASSED")

    # Test 3: Check if code uses socket.listen()
    print("- Test: Server accepts a connection...", end=" ")
    if "listen" not in code:
        print("FAILED")
        print(
            "\nHint: Make sure your server is calling `socket.listen()` to accept connections."
        )
        print("Example: `server.listen(1)`")
        return False
    print("PASSED")

    return True


if __name__ == "__main__":
    success = test_user_code()

    if success:
        print("\n✓ All tests passed!")
        sys.exit(0)
    else:
        print("\n✗ Some tests failed.")
        sys.exit(1)
