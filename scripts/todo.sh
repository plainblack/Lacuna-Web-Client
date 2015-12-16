#!/usr/bin/env bash

# Outputs TODO's and FIXME's that have been left throughout the code
# Ensure you have `ack` installed.
# Usage: (from project root) scripts/todo.sh

ack TODO app/
ack FIXME app/
