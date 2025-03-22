const fs = require('fs');
const path = require('path');

// Define paths
const directoryPath = './dist/assets';
const userScriptConfigPath = './dev_scripts/userScriptConfig.js';

// Regular expressions to match files
const cssPattern = /^index-[a-zA-Z0-9\-_]+\.css$/;
const jsPattern = /^index-[a-zA-Z0-9\-_]+\.js$/;

async function main() {
    try {
        // Read directory and find necessary files
        const files = await readDirectory(directoryPath);
        const cssFile = files.find(file => cssPattern.test(file));
        const jsFile = files.find(file => jsPattern.test(file));

        if (!cssFile || !jsFile) {
            throw new Error('Required CSS or JS file not found.');
        }

        // Read configuration, CSS, and JS files concurrently
        const [configContent, cssContent, jsContent] = await Promise.all([
            readFile(userScriptConfigPath),
            readFile(path.join(directoryPath, cssFile)),
            readFile(path.join(directoryPath, jsFile))
        ]);

        // Extract @name from the script config header
        const scriptName = extractScriptName(configContent);
        
        // Get package version or default to '1.0.0'
        const version = process.env.npm_package_version || '1.0.0';
        const updatedUserscriptHeaders = configContent.replace("${_VERSION}", version);

        // Inject CSS into JS file
        const injectedJsContent = `${jsContent}\n\n/* Injected CSS */\n${injectStyleCSS(cssContent)}`;
        
        // Wrap the final user script in an IIFE
        const userScriptBody = `${updatedUserscriptHeaders}\n\n${wrapInIIFE(injectedJsContent)}`;

        // Generate output filename
        const outputFileName = generateOutputFileName(scriptName, version);
        const outputPath = path.join(directoryPath, outputFileName);
        
        // Write the final userscript to a file
        await writeFile(outputPath, userScriptBody);
        console.log(`User script saved successfully as ${outputPath}`);
    } catch (error) {
        console.error(error.message);
    }
}

// Reads the contents of a directory and returns an array of file names
function readDirectory(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) reject(new Error(`Error reading directory: ${err.message}`));
            else resolve(files);
        });
    });
}

// Reads a file and returns its content as a string
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) reject(new Error(`Error reading file ${filePath}: ${err.message}`));
            else resolve(content);
        });
    });
}

// Writes content to a file
function writeFile(filePath, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, 'utf8', (err) => {
            if (err) reject(new Error(`Error saving file ${filePath}: ${err.message}`));
            else resolve();
        });
    });
}

// Extracts the @name field from the user script header
function extractScriptName(configContent) {
    const nameMatch = configContent.match(/^\/\/\s*@name\s+(.+)$/m);
    return nameMatch ? nameMatch[1].trim().replace(/\s+/g, '_') : 'UserScript';
}

// Injects CSS into the script as a <style> element
function injectStyleCSS(css) {
    return `const styleToInject = document.createElement('style');\n        styleToInject.textContent = \`${css.replace(/`/g, '\\`')}\`;\n        document.head.appendChild(styleToInject);`;
}

// Wraps the final script in an Immediately Invoked Function Expression (IIFE)
function wrapInIIFE(code) {
    return `(function() {\n    ${code}\n})();`;
}

// Generates the output file name based on script name, date, and version
function generateOutputFileName(scriptName, version) {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${scriptName}_${currentDate}_${version}.user.js`;
}

// Execute main function
main();
