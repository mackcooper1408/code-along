"""
Test suite for Step 4: Handle SET Command
Tests if the user's Redis server can store key-value pairs
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

    # Test 1: Check for storage structure
    print("- Test: Code has storage mechanism...", end=" ")
    if ("store" not in code and "dict" not in code and "{}" not in code):
        print("FAILED")
        print("\nHint: You need a dictionary to store key-value pairs")
        print("Example: `store = {}`")
        return False
    print("PASSED")

    # Test 2: Check for SET command handling
    print("- Test: Code handles SET command...", end=" ")
    if "SET" not in code and "set" not in code:
        print("FAILED")
        print("\nHint: You need to check if the command is 'SET'")
        print("Example: `if command == 'SET':`")
        return False
    print("PASSED")

    # Start the server
    print("- Test: Server responds to SET with +OK...", end=" ")
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

        # Send SET command: SET mykey myvalue
        # *3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$7\r\nmyvalue\r\n
        command = b'*3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$7\r\nmyvalue\r\n'
        client.send(command)

        # Receive response
        response = client.recv(1024).decode('utf-8')
        client.close()
        stop_server(server_process)

        # Check if response is +OK\r\n
        if '+OK' in response or 'OK' in response:
            print("PASSED")
            return True
        else:
            print("FAILED")
            print(f"\nHint: Server should respond with '+OK\\r\\n' after a successful SET")
            print(f"Your server responded with: {repr(response)}")
            return False

    except socket.timeout:
        print("FAILED")
        print("\nHint: Server didn't respond in time. Make sure it handles SET and sends '+OK\\r\\n'")
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
        print("\n✓ All tests passed!")
        sys.exit(0)
    else:
        print("\n✗ Some tests failed.")
        sys.exit(1)
