#!/usr/bin/env node
/**
 * Test deploying an example using the actual web UI
 */

const puppeteer = require('puppeteer');

async function testExample(exampleName) {
    console.log(`🧪 Testing: ${exampleName}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Navigate to the web UI
        await page.goto('http://localhost:3457', { waitUntil: 'networkidle0' });

        // Click Examples dropdown
        await page.click('.dropdown-button');
        await page.waitForTimeout(500);

        // Click the specific example
        const exampleButton = await page.evaluateHandle((name) => {
            const buttons = Array.from(document.querySelectorAll('.dropdown-menu button'));
            return buttons.find(btn => btn.textContent.includes(name));
        }, exampleName);

        if (!exampleButton) {
            throw new Error(`Example "${exampleName}" not found in menu`);
        }

        await exampleButton.click();
        await page.waitForTimeout(1000);

        console.log('✅ Loaded example workspace');

        // Click Deploy button
        await page.click('.deploy-button');
        await page.waitForTimeout(2000);

        // Wait for deployment to complete (look for success or error message)
        const deployResult = await page.evaluate(() => {
            const outputDiv = document.querySelector('.output pre');
            return outputDiv ? outputDiv.textContent : 'No output';
        });

        console.log('📝 Deployment result:');
        console.log(deployResult);

        // Check if successful
        if (deployResult.includes('✅')) {
            console.log('✅ DEPLOYMENT SUCCESSFUL!');
            return true;
        } else if (deployResult.includes('❌')) {
            console.log('❌ DEPLOYMENT FAILED!');
            return false;
        } else {
            console.log('⚠️  Unclear deployment status');
            return false;
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// Run test
const exampleName = process.argv[2] || '⚡ Example: Lightning Staff';

testExample(exampleName)
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
