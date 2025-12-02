"""
Test suite for Step 5: Handle GET Command
Tests if the user's Redis server can retrieve stored values
"""

import socket
import sys
import subprocess
import time
import signal
import os


def start_server():
    """Start the user's server in the background"""
    try:
        process = subprocess.Popen(
            ['python', '/app/main.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid
        )
        time.sleep(0.5)
        return process
    except Exception as e:
        print(f"Failed to start server: {e}")
        return None


def stop_server(process):
    """Stop the server process"""
    if process:
        try:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            process.wait(timeout=2)
        except:
            pass


def test_server():
    """Test the server functionality"""
    print("Running tests...\n")

    # Read the user's code
    try:
        with open("/app/main.py", "r") as f:
            code = f.read()
    except Exception as e:
        print(f"Error reading code: {e}")
        return False

    # Test 1: Check for GET command handling
    print("- Test: Code handles GET command...", end=" ")
    if "GET" not in code and "get" not in code:
        print("FAILED")
        print("\nHint: You need to check if the command is 'GET'")
        print("Example: `if command == 'GET':`")
        return False
    print("PASSED")

    # Start the server
    print("- Test: Server handles SET followed by GET...", end=" ")
    server_process = start_server()
    if not server_process:
        print("FAILED")
        return False

    try:
        time.sleep(0.3)

        # Connect to server
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.settimeout(2)
        client.connect(('localhost', 6379))

        # First, SET a value
        set_command = b'*3\r\n$3\r\nSET\r\n$7\r\ntestkey\r\n$9\r\ntestvalue\r\n'
        client.send(set_command)
        set_response = client.recv(1024)

        # Small delay between commands
        time.sleep(0.1)

        # Now GET the value back
        get_command = b'*2\r\n$3\r\nGET\r\n$7\r\ntestkey\r\n'
        client.send(get_command)
        get_response = client.recv(1024).decode('utf-8')

        client.close()
        stop_server(server_process)

        # Check if response contains the value "testvalue"
        if 'testvalue' in get_response:
            print("PASSED")

            # Bonus test: Check for null response on missing key
            print("- Test: Server returns null for missing keys...", end=" ")
            server_process2 = start_server()
            time.sleep(0.3)

            client2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            client2.settimeout(2)
            client2.connect(('localhost', 6379))

            # Try to GET a non-existent key
            get_missing = b'*2\r\n$3\r\nGET\r\n$10\r\nmissingkey\r\n'
            client2.send(get_missing)
            missing_response = client2.recv(1024).decode('utf-8')

            client2.close()
            stop_server(server_process2)

            # Check for null bulk string: $-1\r\n
            if '$-1' in missing_response or 'nil' in missing_response.lower():
                print("PASSED")
                return True
            else:
                print("PASSED (with note)")
                print("\nNote: For missing keys, Redis returns '$-1\\r\\n' (null bulk string)")
                print(f"Your response: {repr(missing_response)}")
                return True  # Still pass, but note the issue
        else:
            print("FAILED")
            print(f"\nHint: Server should return the stored value as a bulk string")
            print(f"Expected 'testvalue' in response")
            print(f"Your server responded with: {repr(get_response)}")
            return False

    except socket.timeout:
        print("FAILED")
        print("\nHint: Server didn't respond in time. Make sure it handles GET and returns the value")
        stop_server(server_process)
        return False
    except ConnectionRefusedError:
        print("FAILED")
        print("\nHint: Couldn't connect to server")
        stop_server(server_process)
        return False
    except Exception as e:
        print("FAILED")
        print(f"\nError: {e}")
        stop_server(server_process)
        return False


if __name__ == "__main__":
    success = test_server()

    if success:
        print("\n✓ All tests passed! Congratulations! 🎉")
        print("\nYou've built a working Redis-like server!")
        print("Your server can now:")
        print("  - Accept TCP connections")
        print("  - Parse RESP protocol")
        print("  - Handle PING, ECHO, SET, and GET commands")
        print("  - Store and retrieve key-value pairs")
        sys.exit(0)
    else:
        print("\n✗ Some tests failed.")
        sys.exit(1)
