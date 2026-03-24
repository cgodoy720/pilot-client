"""Pebble test configuration — ensure imports resolve correctly."""

import os
import sys

# Add project root to sys.path so `from pebble.xxx import ...` works
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
