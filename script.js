// Dictionary for Multi-Language Support
const i18n = {
  en: {
    days: "DAYS", hours: "HOURS", minutes: "MINUTES", seconds: "SECONDS",
    share: "SHARE", builtBy: "Built by", countdownTo: "Countdown to",
    arrived: "IT'S EXAM DAY! GOOD LUCK!", shareText: "Check out this Moroccan Exams Countdown!"
  },
  fr: {
    days: "JOURS", hours: "HEURES", minutes: "MINUTES", seconds: "SECONDES",
    share: "PARTAGER", builtBy: "Créé par", countdownTo: "Compte à rebours jusqu'au",
    arrived: "C'EST LE JOUR J ! BON COURAGE !", shareText: "Découvrez ce compte à rebours des examens marocains !"
  },
  ar: {
    days: "أيام", hours: "ساعات", minutes: "دقائق", seconds: "ثواني",
    share: "مشاركة", builtBy: "تم التطوير بواسطة", countdownTo: "العد التنازلي لـ",
    arrived: "لقد حان يوم الامتحان! بالتوفيق!", shareText: "تحقق من العد التنازلي للامتحانات المغربية!"
  }
};

// Database of Moroccan Exams (Estimated typical months/days)
// Month is 1-indexed here for easier reading (1 = Jan, 6 = Jun)
const examsDB = [
  { id: "cnc",     month: 5, day: 14, en: "CNC (CPGE)", fr: "CNC (CPGE)", ar: "المباراة الوطنية المشتركة (CNC)" },
  { id: "bac_nat", month: 6, day: 10, en: "National Baccalaureate", fr: "Baccalauréat National", ar: "الامتحان الوطني للبكالوريا" },
  { id: "bac_reg", month: 6, day: 5,  en: "Regional Baccalaureate", fr: "Baccalauréat Régional", ar: "الامتحان الجهوي للبكالوريا" },
  { id: "med",     month: 7, day: 20, en: "Medicine Concours (FMP/FMD)", fr: "Concours Médecine (FMP/FMD)", ar: "مباراة الطب والصيدلة" },
  { id: "ensa",    month: 7, day: 25, en: "ENSA / ENSAM Concours", fr: "Concours ENSA / ENSAM", ar: "مباراة ENSA / ENSAM" },
  { id: "cnaem",   month: 5, day: 25, en: "CNAEM (Commerce)", fr: "CNAEM (Commerce)", ar: "المباراة الوطنية (CNAEM)" }
];

let currentLang = "en";
let currentExamIndex = 0;
let countdownInterval;

// DOM Elements
const htmlTag = document.getElementById("htmlTag");
const langSelect = document.getElementById("langSelect");
const examSelect = document.getElementById("examSelect");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const shareBtn = document.getElementById("shareBtn");
const footerText = document.getElementById("footer-text");

// Initialize App
function init() {
  populateExamSelect();
  langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    updateUI();
  });
  examSelect.addEventListener("change", (e) => {
    currentExamIndex = e.target.value;
    updateUI();
  });
  updateUI();
}

// "Smart" Date Calculation: Auto-adjusts to the next year if the date has passed
function getNextExamDate(month, day) {
  const now = new Date();
  let targetYear = now.getFullYear();
  // Note: JS Date months are 0-indexed, so we subtract 1
  let targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);

  // If the exam date has already passed this year, roll over to next year
  if (now.getTime() > targetDate.getTime()) {
    targetYear++;
    targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);
  }
  return { timestamp: targetDate.getTime(), year: targetYear, dateObj: targetDate };
}

function populateExamSelect() {
  examSelect.innerHTML = "";
  examsDB.forEach((exam, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.innerText = exam[currentLang];
    examSelect.appendChild(option);
  });
}

function updateUI() {
  // Handle RTL for Arabic
  if (currentLang === "ar") {
    htmlTag.setAttribute("dir", "rtl");
    document.body.style.fontFamily = "'Cairo', sans-serif";
  } else {
    htmlTag.setAttribute("dir", "ltr");
    document.body.style.fontFamily = "'Inter', sans-serif";
  }

  // Update Exam Select texts without losing selected value
  const selectedValue = examSelect.value;
  populateExamSelect();
  examSelect.value = selectedValue;

  // Update static translations
  document.getElementById("label-days").innerText = i18n[currentLang].days;
  document.getElementById("label-hours").innerText = i18n[currentLang].hours;
  document.getElementById("label-minutes").innerText = i18n[currentLang].minutes;
  document.getElementById("label-seconds").innerText = i18n[currentLang].seconds;
  shareBtn.innerText = i18n[currentLang].share;
  footerText.innerText = i18n[currentLang].builtBy;

  startCountdown();
}

function startCountdown() {
  clearInterval(countdownInterval);
  
  const exam = examsDB[currentExamIndex];
  const targetInfo = getNextExamDate(exam.month, exam.day);
  
  // Format the date string nicely based on locale
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  const dateString = targetInfo.dateObj.toLocaleDateString(currentLang, options);

  titleEl.innerText = `${exam[currentLang]} ${targetInfo.year}`;
  subtitleEl.innerText = `${i18n[currentLang].countdownTo} ${dateString}`;

  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const diff = targetInfo.timestamp - now;

    if (diff <= 0) {
      document.querySelector(".countdown").innerHTML = `<h2>${i18n[currentLang].arrived}</h2>`;
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setValue("days", days);
    setValue("hours", hours);
    setValue("minutes", minutes);
    setValue("seconds", seconds);
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
      await navigator.share({ title: "Moroccan Exams Countdown", text, url });
    } catch (err) {
      console.log("Share canceled", err);
    }
  } else {
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied!");
    });
  }
});

// Run
init();
