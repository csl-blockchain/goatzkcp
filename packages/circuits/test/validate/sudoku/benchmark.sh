#!/bin/bash
set -e

# Output file
OUTPUT_FILE="command_times.log"
> "$OUTPUT_FILE"  # Clear the file if it exists

# List of commands (you can replace these with your actual commands)
commands=(
  "circom main.circom --r1cs --wasm -o build/"
  "node ./build/main_js/generate_witness.js ./build/main_js/main.wasm input.json ./build/main_js/witness.wtns"
)

# Run each command and track time
for i in "${!commands[@]}"; do
  cmd="${commands[$i]}"
  echo "Running command $((i+1)): $cmd"
  start_time=$(date +%s)

  eval "$cmd"

  end_time=$(date +%s)
  duration=$((end_time - start_time))
  echo "Command $((i+1)) took ${duration} seconds."
  echo "Command $((i+1)) ('$cmd') took ${duration} seconds." >> "$OUTPUT_FILE"
done

echo "All commands completed. Timing saved in $OUTPUT_FILE."
