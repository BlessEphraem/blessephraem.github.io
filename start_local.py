import subprocess
import sys
import os
import time

def check_and_install(cwd):
    """Run npm install if node_modules is missing."""
    node_modules = os.path.join(cwd, "node_modules")
    if not os.path.exists(node_modules):
        dir_name = cwd if cwd != "." else "root"
        print(f"[{dir_name}] 'node_modules' not found. Running 'npm install'...")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        subprocess.run([npm_cmd, "install"], check=True, cwd=cwd)

def kill_process_tree(pid):
    """Kills a process and all its children. Required on Windows to kill Node via NPM."""
    if os.name == 'nt':
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        import signal
        try:
            os.killpg(os.getpgid(pid), signal.SIGTERM)
        except Exception:
            pass

def free_ports():
    """Forcefully kills any process listening on the required ports using npx kill-port."""
    npx_cmd = "npx.cmd" if os.name == 'nt' else "npx"
    subprocess.run([npx_cmd, "--yes", "kill-port", "4001", "4002", "8080"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def run():
    print("=== 1. Checking Dependencies ===")
    check_and_install(".")
    check_and_install("Wiki")
    check_and_install("Blog")

    print("\n=== 2. Cleaning Orphaned Processes & Generating Mocks ===")
    # Free the ports so Docusaurus doesn't auto-increment to 3489/3490
    print("Cleaning up old processes (this takes a couple seconds)...")
    free_ports()
    
    mock_script = os.path.join("scripts", "generate_mocks.py")
    if os.path.exists(mock_script):
        subprocess.run([sys.executable, mock_script], check=True)

    print("\n=== 3. Starting Local Servers ===")
    
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    procs = []
    
    # Setting CI=true disables Docusaurus's interactive progress bars
    # This prevents terminal glitching when multiple servers output to the same console.
    env = os.environ.copy()
    env["CI"] = "true"
    
    if os.name == 'nt':
        print("Launching Wiki, Blog, and Proxy in this single terminal...")
        print("-> Close this terminal OR press Ctrl+C to stop EVERYTHING automatically.")
        
        # Start processes in the same window
        procs.append(subprocess.Popen([npm_cmd, "start", "--", "--no-open"], cwd="Wiki", env=env))
        procs.append(subprocess.Popen([npm_cmd, "start", "--", "--no-open"], cwd="Blog", env=env))
        procs.append(subprocess.Popen(["node", "local_proxy.js"]))
    else:
        # Fallback for unix
        print("Launching Wiki, Blog, and Proxy...")
        print("-> Press Ctrl+C to stop everything.")
        procs.append(subprocess.Popen([npm_cmd, "start", "--", "--no-open"], cwd="Wiki", env=env, preexec_fn=os.setsid))
        procs.append(subprocess.Popen([npm_cmd, "start", "--", "--no-open"], cwd="Blog", env=env, preexec_fn=os.setsid))
        procs.append(subprocess.Popen(["node", "local_proxy.js"], preexec_fn=os.setsid))

    try:
        # Keep the main script alive to catch Ctrl+C or terminal closure
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down all servers cleanly...")
    finally:
        # Guarantee that no processes are orphaned when the script ends
        for p in procs:
            kill_process_tree(p.pid)
            
if __name__ == "__main__":
    run()
