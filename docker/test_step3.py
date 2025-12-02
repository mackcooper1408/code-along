"""
Test suite for Step 3: Handle ECHO Command
Tests if the user's Redis server can parse RESP format and handle ECHO
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

    # Test 1: Basic code structure check
    print("- Test: Code has RESP parsing logic...", end=" ")
    if "split" not in code and "\\r\\n" not in code:
        print("FAILED")
        print("\nHint: You need to parse the RESP format by splitting on '\\r\\n'")
        print("Example: `lines = data.decode('utf-8').split('\\r\\n')`")
        return False
    print("PASSED")

    # Start the server
    print("- Test: Server responds to ECHO command...", end=" ")
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

        # Send ECHO command in RESP format: ECHO "hello"
        # *2\r\n$4\r\nECHO\r\n$5\r\nhello\r\n
        command = b'*2\r\n$4\r\nECHO\r\n$5\r\nhello\r\n'
        client.send(command)

        # Receive response
        response = client.recv(1024).decode('utf-8')
        client.close()
        stop_server(server_process)

        # Check if response contains "hello" as a bulk string
        # Expected: $5\r\nhello\r\n
        if 'hello' in response and ('$5' in response or '$' in response):
            print("PASSED")
            return True
        else:
            print("FAILED")
            print(f"\nHint: Server should respond with the echoed message as a RESP bulk string")
            print(f"Expected format: '$5\\r\\nhello\\r\\n'")
            print(f"Your server responded with: {repr(response)}")
            return False

    except socket.timeout:
        print("FAILED")
        print("\nHint: Server didn't respond in time. Make sure it parses ECHO and sends back the argument")
        stop_server(server_process)
        return False
    except ConnectionRefusedError:
        print("FAILED")
        print("\nHint: Couldn't connect to server. Check your socket binding")
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
