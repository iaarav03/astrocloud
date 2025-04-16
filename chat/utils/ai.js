const fetch = require('node-fetch');
require('dotenv').config();

const apiKey = process.env.AI_API_KEY;

async function generateSummary(promptText) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    "contents": [{
      "parts": [{"text": promptText}]
    }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("HTTP error!", response.status, errorData);
      return `Unable to generate content. HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`;
    }

    const responseData = await response.json();

    if (responseData.candidates && responseData.candidates.length > 0 &&
        responseData.candidates[0].content && responseData.candidates[0].content.parts &&
        responseData.candidates[0].content.parts.length > 0 && responseData.candidates[0].content.parts[0].text) {
      return responseData.candidates[0].content.parts[0].text.trim();
    } else {
      console.error("Unexpected response structure:", responseData);
      return "Unable to extract content from the response.";
    }

  } catch (error) {
    console.error("Error generating content:", error);
    return "Unable to generate content at this time.";
  }
}

async function main() {
  const prompt = "Explain how AI works";
  const generatedText = await generateSummary(prompt);
  if (generatedText) {
    console.log("Generated Text from Gemini:\n", generatedText);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateSummary };