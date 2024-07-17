import { chromium } from 'playwright';

const fetchDownloadLinks = async (url) => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Wait for the download links to load
    await page.waitForSelector('.dowload a');

    // Extract download links
    const downloadLinks = await page.$$eval('.dowload a', anchors =>
        anchors.map(anchor => ({
            link: anchor.href,
            label: anchor.textContent.trim()
        }))
    );

    await browser.close();
    return downloadLinks;
};

// Example usage
const url = 'https://s3taku.com/download?id=MTg0MTQx&token=ZATOFLq4U3gpgQLBl7dSIA&expires=1720874003'; // Replace with the actual URL
fetchDownloadLinks(url).then((links) => {
    console.log('Download Links:', links);
}).catch(err => {
    console.error('Error fetching links:', err);
});
