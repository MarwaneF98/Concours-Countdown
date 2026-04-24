// Put your actual key here! (Keep it safe if you publish this online)
const GEMINI_API_KEY = "AIzaSyCmLrDbpFbW9tYd2_ojFm3pjMcOnZKoDxU"; 

// We start with an empty array. Gemini will fill this dynamically.
let examsDB = []; 

// Dictionary for Multi-Language Support
const i18n = {
  en: {
    mainTitle: "Moroccan Exams", mainSubtitle: "Track every major concours and exam",
    loading: "Checking the web for live dates...", error: "Error loading live dates. Please check API Key.",
    days: "DAYS", hours: "HOURS", minutes: "MIN", seconds: "SEC",
    share: "SHARE", builtBy: "Built by", countdownTo: "Countdown to",
    arrived: "IT'S EXAM DAY! GOOD LUCK!", shareText: "Track all Moroccan Exams Countdowns here!",
    portal: "Official Portal"
  },
  fr: {
    mainTitle: "Examens Marocains", mainSubtitle: "Suivez chaque concours et examen majeur",
    loading: "Recherche des dates en direct...", error: "Erreur de chargement. Vérifiez la clé API.",
    days: "JOURS", hours: "HEURES", minutes: "MIN", seconds: "SEC",
    share: "PARTAGER", builtBy: "Créé par", countdownTo: "Prévu pour le",
    arrived: "C'EST LE JOUR J ! BON COURAGE !", shareText: "Suivez tous les comptes à rebours des examens marocains !",
    portal: "Portail Officiel"
  },
  ar: {
    mainTitle: "الامتحانات المغربية", mainSubtitle: "تتبع كل المباريات والامتحانات الوطنية",
    loading: "جاري البحث عن التواريخ المباشرة عبر الذكاء الاصطناعي...", error: "خطأ في التحميل. يرجى التحقق من مفتاح API.",
    days: "أيام", hours: "ساعات", minutes: "دقيقة", seconds: "ثانية",
    share: "مشاركة", builtBy: "تم التطوير بواسطة", countdownTo: "العد التنازلي لـ",
    arrived: "لقد حان يوم الامتحان! بالتوفيق!", shareText: "تحقق من العد التنازلي للامتحانات المغربية!",
    portal: "البوابة الرسمية"
  }
};

let currentLang = "en";
let countdownInterval;

const htmlTag = document.getElementById("htmlTag");
const langBtns = document.querySelectorAll('.lang-btn');
const container = document.getElementById("exams-container");
const shareBtn = document.getElementById("shareBtn");

async function fetchLiveDatesFromGemini() {
  // Update the loading text on the screen while we wait for AI
  document.getElementById("main-subtitle").innerText = i18n[currentLang].loading;

  // You can change the model string here based on Google's exact preview naming (e.g., gemini-1.5-flash or gemini-2.5-flash)
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AIzaSyCmLrDbpFbW9tYd2_ojFm3pjMcOnZKoDxU}`;

  const prompt = `
    Search the web for the official estimated or exact dates for these Moroccan exams for the current year: 
    Baccalauréat National, Baccalauréat Régional, CNC (CPGE), CNAEM, Médecine (FMP/FMD), ENSA, ENSAM, ENCG, IAV, ENA.
    
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
    document.getElementById("main-subtitle").innerText = i18n[currentLang].error;
  }
}

function init() {
  // Setup language squares
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = btn.getAttribute('data-lang');
      updateUI();
    });
  });
  
  updateUI();
  
  // Call the AI when the app starts
  fetchLiveDatesFromGemini(); 
}

function getNextExamDate(month, day) {
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);
  const isToday = now.getDate() === day && now.getMonth() === month - 1;

  if (now.getTime() > targetDate.getTime() + (24 * 60 * 60 * 1000) && !isToday) {
    targetYear++;
    targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);
  }
  return { timestamp: targetDate.getTime(), year: targetYear, dateObj: targetDate, isToday };
}

function updateUI() {
  if (currentLang === "ar") {
    htmlTag.setAttribute("dir", "rtl");
    document.body.style.fontFamily = "'Cairo', sans-serif";
  } else {
    htmlTag.setAttribute("dir", "ltr");
    document.body.style.fontFamily = "'Inter', sans-serif";
  }

  document.getElementById("main-title").innerText = i18n[currentLang].mainTitle;
  // If the array is still empty, keep showing the loading or error message
  if (examsDB.length > 0) {
    document.getElementById("main-subtitle").innerText = i18n[currentLang].mainSubtitle;
  }
  
  document.getElementById("footer-text").innerText = i18n[currentLang].builtBy;
  shareBtn.innerText = i18n[currentLang].share;

  renderExams();
  startCountdowns();
}

function renderExams() {
  container.innerHTML = "";
  if (examsDB.length === 0) return; // Do not render if data hasn't loaded yet

  const options = { month: 'long', day: 'numeric', year: 'numeric' };

  examsDB.forEach(exam => {
    const targetInfo = getNextExamDate(exam.month, exam.day);
    const dateString = targetInfo.dateObj.toLocaleDateString(currentLang, options);

    const card = document.createElement("div");
    card.className = "exam-card";
    card.innerHTML = `
      <div class="exam-title">${exam[currentLang]}</div>
      <div class="exam-subtitle">${i18n[currentLang].countdownTo} ${dateString}</div>
      <a href="${exam.link}" target="_blank" class="portal-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        ${i18n[currentLang].portal}
      </a>
      
      <div class="countdown-mini" id="countdown-${exam.id}">
        <div class="time-box-mini">
          <div id="days-${exam.id}" class="number-mini">0</div>
          <div class="label-mini">${i18n[currentLang].days}</div>
        </div>
        <div class="time-box-mini">
          <div id="hours-${exam.id}" class="number-mini">0</div>
          <div class="label-mini">${i18n[currentLang].hours}</div>
        </div>
        <div class="time-box-mini">
          <div id="minutes-${exam.id}" class="number-mini">0</div>
          <div class="label-mini">${i18n[currentLang].minutes}</div>
        </div>
        <div class="time-box-mini">
          <div id="seconds-${exam.id}" class="number-mini">0</div>
          <div class="label-mini">${i18n[currentLang].seconds}</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function startCountdowns() {
  clearInterval(countdownInterval);
  if (examsDB.length === 0) return;

  countdownInterval = setInterval(() => {
    const now = new Date().getTime();

    examsDB.forEach(exam => {
      const targetInfo = getNextExamDate(exam.month, exam.day);
      const diff = targetInfo.timestamp - now;
      const countdownEl = document.getElementById(`countdown-${exam.id}`);
      
      if (!countdownEl) return;

      if (targetInfo.isToday || diff <= 0) {
        countdownEl.innerHTML = `<div class="arrived-msg">${i18n[currentLang].arrived}</div>`;
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setValue(`days-${exam.id}`, days);
      setValue(`hours-${exam.id}`, hours);
      setValue(`minutes-${exam.id}`, minutes);
      setValue(`seconds-${exam.id}`, seconds);
    });
  }, 1000);
}

// Clean text update without any animation class
function setValue(id, value) {
  const el = document.getElementById(id);
  if (el && el.innerText != value) {
    el.innerText = value;
  }
}

shareBtn.addEventListener("click", async () => {
  const url = window.location.href;
  const text = `${i18n[currentLang].shareText} @marwanef98`;

  if (navigator.share) {
    try { await navigator.share({ title: "Moroccan Exams", text, url }); } 
    catch (err) { console.log("Share canceled", err); }
  } else {
    navigator.clipboard.writeText(url).then(() => alert("Link copied!"));
  }
});

// Run app
init();
