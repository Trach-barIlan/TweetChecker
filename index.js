const puppeteer = require("puppeteer");
const express = require("express");
const app = express();

app.use(express.json());

app.post("/check", async (req, res) => {
    const { url } = req.body;
    console.log("Checking tweet URL:", url);
  
    if (!url || !url.startsWith("https://twitter.com/")) {
      return res.status(400).json({ error: "Invalid URL" });
    }
  
    try {
      const browser = await puppeteer.launch({
        headless: "true",
        executablePath: "/usr/bin/google-chrome",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
      
      
      const page = await browser.newPage();
  
      // Set mobile User-Agent to avoid login wall
      await page.setUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
      );
  
      await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      const html = await page.content();
      const postDeleted = html.includes("Hmm...this page doesn’t exist") || 
                            html.includes("Try searching for something else.");
        const deletedTextFound = await page.evaluate(() => {
        return document.body.innerText.includes("Hmm...this page doesn’t exist");
        });
      const hasTweet = html.includes('data-testid="tweet"') || html.includes('dir="auto"');
      const hasTimeline = await page.$("section[aria-labelledby='accessible-list-0']") !== null;
  
      console.log("postDeleted:", postDeleted);
      console.log("hasTweet:", hasTweet);
      console.log("Found section[aria-labelledby='accessible-list-0']:", hasTimeline);
      console.log("Found 'page doesn’t exist' text:", deletedTextFound);
  
      await browser.close();
  
      if (postDeleted || deletedTextFound) return res.json({ status: "Suspended Account" });
      if (hasTweet || hasTimeline) return res.json({ status: "Active" });
  
      return res.json({ status: "Removed" });
  
    } catch (err) {
      console.error("Error checking tweet:", err.message);
      return res.status(500).json({ status: "Error", detail: err.message });
    }
  });
  
  app.listen(3000, () => console.log("Server running on http://localhost:3000"));

    // instructions:
  // run npm install
  // run the backend using "node index.js"
  // Then run the frontend by pressing the run button