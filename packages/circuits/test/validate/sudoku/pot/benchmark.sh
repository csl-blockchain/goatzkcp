#!/bin/bash
set -e

# Output file
OUTPUT_FILE="command_times.log"
> "$OUTPUT_FILE"  # Clear the file if it exists

# List of commands (you can replace these with your actual commands)
commands=(
  "snarkjs powersoftau new bn128 21 pot21_0000.ptau -v"
  "echo 'Random message.' | snarkjs powersoftau contribute pot21_0000.ptau pot21_0001.ptau --name=\"First contribution\" -v"
  "snarkjs powersoftau prepare phase2 pot21_0001.ptau pot21_final.ptau -v"
  "snarkjs groth16 setup ../build/main.r1cs pot21_final.ptau main_0000.zkey"
  "echo 'Random message.' | snarkjs zkey contribute main_0000.zkey main_0001.zkey --name=\"Daffa\" -v"
  "snarkjs zkey export verificationkey main_0001.zkey verification_key.json"
  "snarkjs groth16 prove main_0001.zkey ../build/main_js/witness.wtns proof.json public.json"
  "snarkjs groth16 verify verification_key.json public.json proof.json"
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
