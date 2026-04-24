const GEMINI_API_KEY = "AIzaSyCmLrDbpFbW9tYd2_ojFm3pjMcOnZKoDxU";

// 1. Seed Data: These show up INSTANTLY while the AI works
let examsDB = [
    { id: "bac_nat", month: 6, day: 10, en: "National Baccalaureate", fr: "Baccalauréat National", ar: "الامتحان الوطني للبكالوريا", link: "https://massar.men.gov.ma" },
    { id: "cnc", month: 5, day: 14, en: "CNC (Engineering)", fr: "CNC (Ingénierie)", ar: "المباراة الوطنية المشتركة", link: "https://www.cpge.ac.ma" },
    { id: "med", month: 7, day: 20, en: "Medicine Concours", fr: "Concours Médecine", ar: "مباراة الطب والصيدلة", link: "https://cursusup.gov.ma" }
];

const i18n = {
    en: { mainTitle: "Moroccan Exams", mainSubtitle: "Track every major concours", loading: "Updating live dates...", share: "SHARE", portal: "Official Portal" },
    fr: { mainTitle: "Examens Marocains", mainSubtitle: "Suivez chaque concours", loading: "Mise à jour des dates...", share: "PARTAGER", portal: "Portail Officiel" },
    ar: { mainTitle: "الامتحانات المغربية", mainSubtitle: "تتبع كل المباريات", loading: "جاري تحديث التواريخ...", share: "مشاركة", portal: "البوابة الرسمية" }
};

let currentLang = "en";
let countdownInterval;

const container = document.getElementById("exams-container");

async function fetchLiveDatesFromGemini() {
    // Show a small subtle indicator that we are checking for updates
    const subtitle = document.getElementById("main-subtitle");
    const originalText = i18n[currentLang].mainSubtitle;
    subtitle.innerText = i18n[currentLang].loading;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${AIzaSyCmLrDbpFbW9tYd2_ojFm3pjMcOnZKoDxU}`;

    const prompt = `Search web for official dates of Moroccan exams (Bac, CNC, Medicine, ENSA) for 2026. Return ONLY a JSON array: [{"id":"","month":num,"day":num,"en":"","fr":"","ar":"","link":""}]`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        let jsonString = data.candidates[0].content.parts[0].text;
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

        const freshData = JSON.parse(jsonString);

        // Update our local database and save it to the browser memory
        examsDB = freshData;
        localStorage.setItem("cachedExams", JSON.stringify(freshData));

        // Refresh the UI with the new AI dates
        subtitle.innerText = originalText;
        renderExams();
        startCountdowns();

    } catch (error) {
        console.error("AI Update failed, using cached/seed data.");
        subtitle.innerText = originalText;
    }
}

function init() {
    // Check if we have saved data in the browser from a previous visit
    const cached = localStorage.getItem("cachedExams");
    if (cached) {
        examsDB = JSON.parse(cached);
    }

    // Setup Lang Buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentLang = e.target.getAttribute('data-lang');
            updateUI();
        });
    });

    // 2. Load the UI immediately (0 second wait!)
    updateUI();

    // 3. Run AI update in the background (User doesn't have to wait for it)
    fetchLiveDatesFromGemini();
}

function updateUI() {
    const htmlTag = document.getElementById("htmlTag");
    if (currentLang === "ar") {
        htmlTag.setAttribute("dir", "rtl");
        document.body.style.fontFamily = "'Cairo', sans-serif";
    } else {
        htmlTag.setAttribute("dir", "ltr");
        document.body.style.fontFamily = "'Inter', sans-serif";
    }
    document.getElementById("main-title").innerText = i18n[currentLang].mainTitle;
    document.getElementById("main-subtitle").innerText = i18n[currentLang].mainSubtitle;
    renderExams();
    startCountdowns();
}

function renderExams() {
    container.innerHTML = "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };

    examsDB.forEach(exam => {
        const now = new Date();
        let targetYear = now.getFullYear();
        let targetDate = new Date(targetYear, exam.month - 1, exam.day);
        if (now > targetDate) targetDate.setFullYear(targetYear + 1);

        const card = document.createElement("div");
        card.className = "exam-card";
        card.innerHTML = `
            <div class="exam-title">${exam[currentLang]}</div>
            <div class="exam-subtitle">${i18n[currentLang].countdownTo || 'Countdown'} ${targetDate.toLocaleDateString(currentLang, options)}</div>
            <a href="${exam.link}" target="_blank" class="portal-link">${i18n[currentLang].portal}</a>
            <div class="countdown-mini" id="countdown-${exam.id}" style="direction:ltr">
                <div class="time-box-mini"><div id="d-${exam.id}" class="number-mini">0</div><div class="label-mini">${i18n[currentLang].days || 'D'}</div></div>
                <div class="time-box-mini"><div id="h-${exam.id}" class="number-mini">0</div><div class="label-mini">${i18n[currentLang].hours || 'H'}</div></div>
                <div class="time-box-mini"><div id="m-${exam.id}" class="number-mini">0</div><div class="label-mini">${i18n[currentLang].minutes || 'M'}</div></div>
                <div class="time-box-mini"><div id="s-${exam.id}" class="number-mini">0</div><div class="label-mini">${i18n[currentLang].seconds || 'S'}</div></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function startCountdowns() {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        examsDB.forEach(exam => {
            const target = new Date(new Date().getFullYear(), exam.month - 1, exam.day).getTime();
            let diff = target - now;
            if (diff < 0) diff = new Date(new Date().getFullYear() + 1, exam.month - 1, exam.day).getTime() - now;

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            if(document.getElementById(`d-${exam.id}`)) {
                document.getElementById(`d-${exam.id}`).innerText = d;
                document.getElementById(`h-${exam.id}`).innerText = h;
                document.getElementById(`m-${exam.id}`).innerText = m;
                document.getElementById(`s-${exam.id}`).innerText = s;
            }
        });
    }, 1000);
}

init();
