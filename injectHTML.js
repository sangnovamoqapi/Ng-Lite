const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Function to find HTML files in a directory and inject HTML into them
function processDirectory(directoryPath, customTags) {
    try {
        const files = fs.readdirSync(directoryPath);
        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            // Check if the file is a directory
            if (fs.statSync(filePath).isDirectory()) {
                // If it is a directory, recursively process its content
                processDirectory(filePath, customTags);
            } else {
                customTags.forEach((tag) => {
                    if (file.startsWith(tag) && file.endsWith('.html')) {
                        injectHtmlIntoIndex(filePath, tag);
                    }
                });
            }
        });
    } catch (error) {
        console.error(`Error processing directory ${directoryPath}: ${error.message}`);
    }
}

// Function to find and inject HTML into the index.html file
function injectHtmlIntoIndex(htmlFilePath, customTag) {
    try {
        const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
        const indexPath = path.join(path.dirname(htmlFilePath), 'index.html');
        let indexContent = fs.readFileSync(indexPath, 'utf-8');
        const $ = cheerio.load(indexContent);
        const customTagElement = $(customTag);

        if (customTagElement.length > 0) {
            customTagElement.replaceWith(htmlContent);
            fs.writeFileSync(indexPath, $.html(), 'utf-8');
            console.log(`HTML successfully injected into ${indexPath}`);
        } else {
            console.error(`Custom tag "${customTag}" not found in ${indexPath}`);
        }
    } catch (error) {
        console.error(`Error injecting HTML into index.html: ${error.message}`);
    }
}

// Function to find custom tags in the index.html file
function findCustomTagsInIndex(indexPath) {
    try {
        const indexContent = fs.readFileSync(indexPath, 'utf-8');
        const $ = cheerio.load(indexContent);
        const customTags = $('[id]').map(function () {
            return $(this).prop('tagName').toLowerCase();
        }).get();
        return customTags;
    } catch (error) {
        console.error(`Error finding custom tags in ${indexPath}: ${error.message}`);
        return [];
    }
}

const directoryPath = './helper-project'; 
const indexPath = './helper-project/index.html';
const customTags = findCustomTagsInIndex(indexPath);
processDirectory(directoryPath, customTags);
