import fs from 'fs';

// Get the input file name from command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Please provide the input file name as a command line argument.');
    process.exit(1);
}

const inputFilePath = args[0];
const outputFilePath = 'output.redis';
let synonymGroup = []

fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        const jsonData = JSON.parse(data);
        const hsetCommands = [];

        jsonData.forEach(entry => {
            if (entry.description === "") {
                // Add to synonym group
                synonymGroup.push(entry.key)
            }
            else {     
                const formattedDescription = entry.description.replace(/\n/g, '<br />');           
                if (synonymGroup.length === 0) {
                    // Not in synonym group 
                    // Replace newline characters with <br />
                    //const formattedDescription = entry.description.replace(/\n/g, '<br />');
                    const command = `HSET "DONTDICT:${entry.key}" description "${formattedDescription.replace(/"/g, '\\"')}"`;
                    hsetCommands.push(command);
                } else {
                    // Synonym group processing
                    // Replace newline characters with <br />
                    //const formattedDescription = entry.description.replace(/\n/g, '<br />');
                    synonymGroup.forEach((item) => {
                        const command = `HSET "DONTDICT:${item}" description "${formattedDescription.replace(/"/g, '\\"')}"`;
                        hsetCommands.push(command);
                    });
                    const command = `HSET "DONDICT:${entry.key}" description "${formattedDescription.replace(/"/g, '\\"')}"`;
                    hsetCommands.push(command);

                    synonymGroup = []
                }
            }
        });

        // Write the HSET commands to output.redis
        fs.writeFileSync(outputFilePath, hsetCommands.join('\n'), 'utf8');
        console.log(`HSET commands written to ${outputFilePath}`);
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
});

/*
    Written by Chat-GPT

    node generateHSET.js output.json
*/    