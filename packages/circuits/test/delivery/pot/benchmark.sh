#!/bin/bash
set -e

# Output file
OUTPUT_FILE="command_times.log"
> "$OUTPUT_FILE"  # Clear the file if it exists

# List of commands (you can replace these with your actual commands)
commands=(
  "snarkjs powersoftau new bn128 17 pot17_0000.ptau -v"
  "echo 'Random message.' | snarkjs powersoftau contribute pot17_0000.ptau pot17_0001.ptau --name=\"First contribution\" -v"
  "snarkjs powersoftau prepare phase2 pot17_0001.ptau pot17_final.ptau -v"
  "snarkjs groth16 setup ../build/ciminion_ks_poseidon.r1cs pot17_final.ptau ciminion_ks_poseidon_0000.zkey"
  "echo 'Random message.' | snarkjs zkey contribute ciminion_ks_poseidon_0000.zkey ciminion_ks_poseidon_0001.zkey --name=\"Daffa\" -v"
  "snarkjs zkey export verificationkey ciminion_ks_poseidon_0001.zkey verification_key.json"
  "snarkjs groth16 prove ciminion_ks_poseidon_0001.zkey ../build/ciminion_ks_poseidon_js/witness.wtns proof.json public.json"
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
