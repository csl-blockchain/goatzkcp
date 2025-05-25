const fs = require('fs');
const wc = require('./witness_calculator.js');

async function run() {
    try {
        // Read the input.json file
        const input = JSON.parse(fs.readFileSync('../../input.json', 'utf8'));
        
        // Load the WebAssembly module
        const buffer = fs.readFileSync('./hash.wasm');
        const calculator = await wc(buffer);
        
        // Calculate the witness
        const witness = await calculator.calculateWitness(input, true);
        
        // Display the results
        console.log("Expected H value from input.json:", input.H);
        console.log("Calculated hash from circuit:", witness[1]);
        console.log("Are they equal?", input.H === witness[1].toString());
        
        // Write output to a file for reference
        fs.writeFileSync('./hash_output.json', JSON.stringify({
            expected: input.H,
            calculated: witness[1].toString()
        }, null, 2));
        
        console.log("Hash values written to hash_output.json");
    } catch (error) {
        console.error("Error:", error);
    }
}

run().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
}); 