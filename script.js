// Put your actual key here!
const GEMINI_API_KEY = "YOUR_API_KEY_HERE"; 

// We start with an empty array. Gemini will fill this.
let examsDB = []; 

async function fetchLiveDatesFromGemini() {
  // Update the loading text on the screen while we wait for AI
  document.getElementById("main-subtitle").innerText = "Checking the web for live dates...";

  // The direct URL to Google's Gemini API
  // Note: Adjust the model name if the exact 3.1 lite preview string changes in the API docs
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // The strict instructions for the AI
  const prompt = `
    Search the web for the official estimated or exact dates for these Moroccan exams for the current year: 
    Baccalauréat National, Baccalauréat Régional, CNC (CPGE), CNAEM, Médecine (FMP), ENSA, ENSAM.
    
    Return ONLY a valid JSON array of objects. Do not use markdown blocks like \`\`\`json. 
    Each object must exactly match this structure:
    {
      "id": "short_name",
      "month": number (1-12),
      "day": number (1-31),
      "en": "English Name",
      "fr": "French Name",
      "ar": "Arabic Name",
      "link": "Official Website URL"
    }
  `;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    // Extract the text from Gemini's response
    let jsonString = data.candidates[0].content.parts[0].text;
    
    // Clean up the string just in case Gemini added markdown formatting
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

    // Convert the text into our JavaScript array
    examsDB = JSON.parse(jsonString);

    // Reset the subtitle and start the countdowns!
    document.getElementById("main-subtitle").innerText = i18n[currentLang].mainSubtitle;
    renderExams();
    startCountdowns();

  } catch (error) {
    console.error("Failed to fetch from Gemini:", error);
    document.getElementById("main-subtitle").innerText = "Error loading live dates. Please check API Key.";
  }
}

// Our new init function
function init() {
  // Setup language squares
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = btn.getAttribute('data-lang');
      updateUI(); // Updates text, but won't re-fetch from API to save your quota
    });
  });
  
  updateUI();
  
  // Call the AI when the app starts
  fetchLiveDatesFromGemini(); 
}
