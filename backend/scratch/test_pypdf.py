import io
from pypdf import PdfReader

try:
    # Create a dummy PDF bytes if possible, but easier to just check import
    print("pypdf version is available")
except Exception as e:
    print(f"Error: {e}")
