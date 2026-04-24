// Dictionary for Multi-Language Support
const i18n = {
  en: {
    mainTitle: "Moroccan Exams", mainSubtitle: "Track every major concours and exam",
    days: "DAYS", hours: "HOURS", minutes: "MIN", seconds: "SEC",
    share: "SHARE", builtBy: "Built by", countdownTo: "Countdown to",
    arrived: "IT'S EXAM DAY! GOOD LUCK!", shareText: "Track all Moroccan Exams Countdowns here!",
    portal: "Official Portal"
  },
  fr: {
    mainTitle: "Examens Marocains", mainSubtitle: "Suivez chaque concours et examen majeur",
    days: "JOURS", hours: "HEURES", minutes: "MIN", seconds: "SEC",
    share: "PARTAGER", builtBy: "Créé par", countdownTo: "Prévu pour le",
    arrived: "C'EST LE JOUR J ! BON COURAGE !", shareText: "Suivez tous les comptes à rebours des examens marocains !",
    portal: "Portail Officiel"
  },
  ar: {
    mainTitle: "الامتحانات المغربية", mainSubtitle: "تتبع كل المباريات والامتحانات الوطنية",
    days: "أيام", hours: "ساعات", minutes: "دقيقة", seconds: "ثانية",
    share: "مشاركة", builtBy: "تم التطوير بواسطة", countdownTo: "العد التنازلي لـ",
    arrived: "لقد حان يوم الامتحان! بالتوفيق!", shareText: "تحقق من العد التنازلي للامتحانات المغربية!",
    portal: "البوابة الرسمية"
  }
};

// Expanded Database of Moroccan Exams with Official Websites
const examsDB = [
  { id: "bac_nat", month: 6, day: 10, en: "National Baccalaureate", fr: "Baccalauréat National", ar: "الامتحان الوطني للبكالوريا", link: "https://massarservice.men.gov.ma/moutamadris" },
  { id: "bac_reg", month: 6, day: 5,  en: "Regional Baccalaureate", fr: "Baccalauréat Régional", ar: "الامتحان الجهوي للبكالوريا", link: "https://massarservice.men.gov.ma/moutamadris" },
  { id: "cnc",     month: 5, day: 14, en: "CNC (Engineering)", fr: "CNC (Ingénierie)", ar: "المباراة الوطنية المشتركة (CNC)", link: "https://www.cpge.ac.ma" },
  { id: "cnaem",   month: 5, day: 25, en: "CNAEM (Commerce)", fr: "CNAEM (Commerce)", ar: "المباراة الوطنية (CNAEM)", link: "https://www.cnaem.ma" },
  { id: "med",     month: 7, day: 20, en: "Medicine & Pharmacy", fr: "Médecine & Pharmacie (FMP)", ar: "مباراة الطب والصيدلة", link: "https://cursusup.gov.ma/medecine" },
  { id: "ensa",    month: 7, day: 25, en: "ENSA Network", fr: "Réseau ENSA", ar: "شبكة المدارس الوطنية (ENSA)", link: "https://cursusup.gov.ma/ensa" },
  { id: "ensam",   month: 7, day: 26, en: "ENSAM Network", fr: "Réseau ENSAM", ar: "المدارس الوطنية (ENSAM)", link: "https://cursusup.gov.ma/ensam" },
  { id: "encg",    month: 7, day: 24, en: "ENCG Network", fr: "Réseau ENCG", ar: "التجارة والتسيير (ENCG)", link: "https://cursusup.gov.ma/encg" },
  { id: "ena",     month: 7, day: 15, en: "ENA (Architecture)", fr: "ENA (Architecture)", ar: "الهندسة المعمارية (ENA)", link: "https://www.concoursena.ma" },
  { id: "iav",     month: 7, day: 12, en: "IAV Hassan II (APESA)", fr: "IAV Hassan II (APESA)", ar: "معهد الحسن الثاني (IAV)", link: "https://www.iav.ac.ma" },
  { id: "ispits",  month: 9, day: 15, en: "ISPITS (Nursing)", fr: "ISPITS (Infirmiers)", ar: "المهن التمريضية (ISPITS)", link: "https://ispits.sante.gov.ma" }
];

let currentLang = "en";
let countdownInterval;

const htmlTag = document.getElementById("htmlTag");
const langBtns = document.querySelectorAll('.lang-btn');
const container = document.getElementById("exams-container");
const shareBtn = document.getElementById("shareBtn");

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
  document.getElementById("main-subtitle").innerText = i18n[currentLang].mainSubtitle;
  document.getElementById("footer-text").innerText = i18n[currentLang].builtBy;
  shareBtn.innerText = i18n[currentLang].share;

  renderExams();
  startCountdowns();
}

function renderExams() {
  container.innerHTML = "";
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
    void el.offsetWidth;
    el.classList.add("fade");
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
