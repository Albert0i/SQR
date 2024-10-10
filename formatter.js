import fs from 'fs';
import readline from 'readline';

async function processFile(inputFilePath, outputFilePath) {
    const inputStream = fs.createReadStream(inputFilePath);
    const rl = readline.createInterface({
        input: inputStream,
        crlfDelay: Infinity,
    });

    const jsonData = [];
    let currentDescription = [];
    let currentKeys = [];

    for await (const line of rl) {
        // Check if the line starts with the item pattern
        const match = line.match(/^\|(\S+)/);
        if (match) {
            // If there are current keys, save the previous entry
            if (currentKeys.length > 0) {
                const cleanedDescription = currentDescription.join('\n').trim();
                // Create an object for the first synonym
                jsonData.push({ key: currentKeys[0], description: cleanedDescription });
                // Assign empty string to all following synonyms
                for (let i = 1; i < currentKeys.length; i++) {
                    jsonData.push({ key: currentKeys[i], description: "" });
                }
            }
            // Start a new set of synonyms
            currentKeys = [match[1]]; // Start a new array with the current synonym
            currentDescription = []; // Reset description for the new entry
        } else if (currentKeys.length > 0) {
            // Collect description lines
            currentDescription.push(line);
        }
    }

    // Save the last group if there are any keys
    if (currentKeys.length > 0) {
        const cleanedDescription = currentDescription.join('\n').trim();
        jsonData.push({ key: currentKeys[0], description: cleanedDescription });
        for (let i = 1; i < currentKeys.length; i++) {
            jsonData.push({ key: currentKeys[i], description: "" });
        }
    }

    // Write the JSON output to a file
    fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`Processing complete. JSON written to ${outputFilePath}`);
}

// Usage: node formatter.mjs input.txt
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Please provide the input file name as a command line argument.');
    process.exit(1);
}

const inputFilePath = args[0];
const outputFilePath = 'output.json'; // Output file
processFile(inputFilePath, outputFilePath)
    .catch(err => console.error(err));

/*
    Written by Chat-GPT

    node formatter.js 東的-2019.txt
*/    