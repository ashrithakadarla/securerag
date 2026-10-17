import sys
import os

# Add the backend directory (which contains the 'app' package) to sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.abspath(os.path.join(project_root, "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)
