// Dictionary for Multi-Language Support
const i18n = {
  en: {
    mainTitle: "Moroccan Exams", mainSubtitle: "Track every major concours and exam",
    days: "DAYS", hours: "HOURS", minutes: "MIN", seconds: "SEC",
    share: "SHARE", builtBy: "Built by", countdownTo: "Countdown to",
    arrived: "IT'S EXAM DAY! GOOD LUCK!", shareText: "Track all Moroccan Exams Countdowns here!"
  },
  fr: {
    mainTitle: "Examens Marocains", mainSubtitle: "Suivez chaque concours et examen majeur",
    days: "JOURS", hours: "HEURES", minutes: "MIN", seconds: "SEC",
    share: "PARTAGER", builtBy: "Créé par", countdownTo: "Prévu pour le",
    arrived: "C'EST LE JOUR J ! BON COURAGE !", shareText: "Suivez tous les comptes à rebours des examens marocains !"
  },
  ar: {
    mainTitle: "الامتحانات المغربية", mainSubtitle: "تتبع كل المباريات والامتحانات الوطنية",
    days: "أيام", hours: "ساعات", minutes: "دقيقة", seconds: "ثانية",
    share: "مشاركة", builtBy: "تم التطوير بواسطة", countdownTo: "العد التنازلي لـ",
    arrived: "لقد حان يوم الامتحان! بالتوفيق!", shareText: "تحقق من العد التنازلي للامتحانات المغربية!"
  }
};

// Database of Moroccan Exams
const examsDB = [
  { id: "cnc",     month: 5, day: 14, en: "CNC (CPGE)", fr: "CNC (CPGE)", ar: "المباراة الوطنية المشتركة" },
  { id: "bac_nat", month: 6, day: 10, en: "National Baccalaureate", fr: "Baccalauréat National", ar: "الامتحان الوطني للبكالوريا" },
  { id: "bac_reg", month: 6, day: 5,  en: "Regional Baccalaureate", fr: "Baccalauréat Régional", ar: "الامتحان الجهوي للبكالوريا" },
  { id: "med",     month: 7, day: 20, en: "Medicine Concours", fr: "Concours Médecine", ar: "مباراة الطب والصيدلة" },
  { id: "ensa",    month: 7, day: 25, en: "ENSA / ENSAM", fr: "Concours ENSA / ENSAM", ar: "مباراة ENSA / ENSAM" },
  { id: "cnaem",   month: 5, day: 25, en: "CNAEM (Commerce)", fr: "CNAEM (Commerce)", ar: "المباراة الوطنية (CNAEM)" }
];

let currentLang = "en";
let countdownInterval;

const htmlTag = document.getElementById("htmlTag");
const langSelect = document.getElementById("langSelect");
const container = document.getElementById("exams-container");
const shareBtn = document.getElementById("shareBtn");

function init() {
  langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    updateUI();
  });
  updateUI();
}

// Smart Auto-Update: Rolls over to next year ONLY if the exam day has fully passed
function getNextExamDate(month, day) {
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);
  
  const isToday = now.getDate() === day && now.getMonth() === month - 1;

  // If the date has passed and it's NOT today, roll over to next year
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
  document.getElementById("main-subtitle").innerText = i18n[currentLang].mainSubtitle;
  document.getElementById("footer-text").innerText = i18n[currentLang].builtBy;
  shareBtn.innerText = i18n[currentLang].share;

  renderExams();
  startCountdowns();
}

function renderExams() {
  container.innerHTML = ""; // Clear existing
  const options = { month: 'long', day: 'numeric', year: 'numeric' };

  examsDB.forEach(exam => {
    const targetInfo = getNextExamDate(exam.month, exam.day);
    const dateString = targetInfo.dateObj.toLocaleDateString(currentLang, options);

    const card = document.createElement("div");
    card.className = "exam-card";
    card.innerHTML = `
      <div class="exam-title">${exam[currentLang]} ${targetInfo.year}</div>
      <div class="exam-subtitle">${i18n[currentLang].countdownTo} ${dateString}</div>
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

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el && el.innerText != value) {
    el.innerText = value;
    el.classList.remove("fade");
    void el.offsetWidth; // trigger reflow
    el.classList.add("fade");
  }
}

shareBtn.addEventListener("click", async () => {
  const url = window.location.href;
  const text = `${i18n[currentLang].shareText} @marwanef98`;

  if (navigator.share) {
    try {
      await navigator.share({ title: "Moroccan Exams", text, url });
    } catch (err) {
      console.log("Share canceled", err);
    }
  } else {
    navigator.clipboard.writeText(url).then(() => alert("Link copied!"));
  }
});

// Run app
init();
