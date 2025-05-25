const fs = require('fs');

// Read the input file
const input = JSON.parse(fs.readFileSync('../../input.json', 'utf8'));
const MK_0 = input.MK_0;
const MK_1 = input.MK_1;
const H = input.H;
const S = input.S;

console.log('Analyzing input values for hash calculation:');
console.log('MK_0:', MK_0);
console.log('MK_1:', MK_1);
console.log('H (expected hash):', H);

// Puzzl array from the Circom circuit
const puzzl = [0, 15, 0, 1, 0, 2, 10, 14, 12, 0, 0, 0, 0, 0, 0, 0, 0, 6, 3, 16, 12, 0, 8, 4, 14, 15, 1, 0, 2, 0, 0, 0, 14, 0, 9, 7, 11, 3, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 13, 2, 12, 0, 0, 0, 0, 6, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 14, 1, 11, 7, 3, 5, 10, 0, 0, 8, 0, 12, 3, 16, 0, 0, 2, 4, 0, 0, 0, 14, 7, 13, 0, 0, 5, 15, 11, 0, 5, 0, 0, 0, 0, 0, 0, 9, 4, 0, 0, 6, 0, 0, 0, 0, 0, 0, 13, 0, 16, 5, 15, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 1, 12, 0, 8, 3, 10, 11, 0, 15, 0, 2, 12, 0, 11, 0, 0, 14, 3, 5, 4, 0, 0, 0, 0, 9, 0, 6, 3, 0, 4, 0, 0, 13, 0, 0, 11, 9, 1, 0, 12, 16, 2, 0, 0, 10, 9, 0, 0, 0, 0, 0, 0, 12, 0, 8, 0, 6, 7, 12, 8, 0, 0, 16, 0, 0, 10, 0, 13, 0, 0, 0, 5, 0, 0, 5, 0, 0, 0, 3, 0, 4, 6, 0, 1, 15, 0, 0, 0, 0, 0, 0, 9, 1, 6, 0, 14, 0, 11, 0, 0, 2, 0, 0, 0, 10, 8, 0, 14, 0, 0, 0, 13, 9, 0, 4, 12, 11, 8, 0, 0, 2, 0];

// Count zeros in puzzl to verify
const zeroCount = puzzl.filter(val => val === 0).length;
console.log('Number of zeros in puzzl:', zeroCount);
console.log('Length of S array:', S.length);

// Reconstruct solution array as it would be in the circuit
let solution = [];
let index = 0;

for (let i = 0; i < 256; i++) {
    if (puzzl[i] === 0) {
        if (index < S.length) {
            solution[i] = S[index];
            index++;
        } else {
            solution[i] = 1; // Default if S array is exhausted
        }
    } else {
        solution[i] = puzzl[i];
    }
}

// Extract first 140 elements for hash calculation
const hashInputs = solution.slice(0, 140);

// Write the analysis to files for reference
fs.writeFileSync('./solution_array.json', JSON.stringify({
    full_solution: solution,
    length: solution.length,
    unique_values: [...new Set(solution)].sort((a, b) => a - b)
}, null, 2));

fs.writeFileSync('./hash_inputs.json', JSON.stringify({
    hash_inputs: hashInputs,
    length: hashInputs.length,
    MK_0: MK_0,
    MK_1: MK_1
}, null, 2));

console.log('Analysis complete. Data saved to solution_array.json and hash_inputs.json'); 