# 🎓 Moroccan Exams & Concours Countdown

A sleek, multilingual, and fully automated web application designed to help Moroccan students track national exams (Baccalaureate) and major higher education concours (Grandes Écoles, CPGE, etc.). 

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-Web-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Key Features

* ⏱️ **Precision Countdowns:** Real-time tracking of upcoming exams down to the second, automatically adjusting for past dates and leap years.
* 🌍 **True Multilingual UI:** Seamlessly switch between **French (Default), Arabic, and English**. Includes dynamic typographical adjustments (RTL/LTR) and native-level grammatical pluralization using `Intl.PluralRules`.
* 📰 **Automated Live News Feed:** A built-in Python scraper fetches the latest educational news from Tawjihnet via RSS.
* 🧠 **Smart Translation System:** The fetched news is automatically translated and corrected using a custom Moroccan academic dictionary (e.g., mapping "Concours" to "مباراة" and "CPGE" to "الأقسام التحضيرية") to ensure perfect local context.
* ⚙️ **Zero-Maintenance Automation:** Powered by **GitHub Actions**, the news scraper runs automatically twice a day to commit the latest updates without any manual intervention.
* 🎨 **Modern Aesthetic:** A dark-mode-first design utilizing CSS Grid, smooth fade-in animations, and crisp typography (`Inter` for LTR, `Cairo` for RTL).

## 🛠️ Tech Stack

**Frontend:**
* HTML5 / CSS3 (Flexbox & Grid)
* Vanilla JavaScript (ES6+)
* JSON (Data storage for exams and news)

**Backend & Automation:**
* Python 3.10 (Feedparser, Requests, BeautifulSoup, Deep-Translator)
* GitHub Actions (CI/CD Cron Jobs)

## 🚀 How the Automation Works

This repository uses a custom GitHub Actions workflow (`auto-update.yml`) to keep the site updated:
1. Every 12 hours, the workflow triggers `scraper.py`.
2. The script connects to the Tawjihnet RSS feed and extracts the latest 15 announcements.
3. It translates the headlines into AR, FR, and EN, applying a strict mapping dictionary for Moroccan academic terms to avoid literal translation errors.
4. The output is saved to `tawjihnet_news.json`.
5. If there are new updates, the GitHub Action Bot automatically commits and pushes the changes, updating the live website instantly.

## 📂 Project Structure

```text
📦 Concours-Countdown
 ┣ 📜 index.html              # Main HTML structure
 ┣ 📜 style.css               # Styling, animations, and responsive grid
 ┣ 📜 script.js               # Countdown logic, translation handling, and DOM manipulation
 ┣ 📜 exams.json              # Static database of exam dates
 ┣ 📜 tawjihnet_news.json     # Dynamically updated news database
 ┣ 📜 scraper.py              # Python script for RSS scraping and translation
 ┣ 📜 requirements.txt        # Python dependencies
 ┗ 📂 .github/workflows
   ┗ 📜 auto-update.yml       # GitHub Actions configuration

```
## 💻 Local Installation
To run this project locally:
 1. Clone the repository:
   ```bash
   git clone [https://github.com/MarwaneF98/Concours-Countdown.git](https://github.com/MarwaneF98/Concours-Countdown.git)
   
   ```
 2. Navigate to the project directory:
   ```bash
   cd Concours-Countdown
   
   ```
 3. Open index.html in your browser. *(Note: For the JSON fetch requests to work properly, you may need to open the site using a local server like VS Code's "Live Server" extension).*
To test the Python scraper locally:
```bash
pip install -r requirements.txt
python scraper.py

```
## 🤝 Credits & Authors
 * Developed and maintained by **@marwanef98** & **@z3kri**.
 * Built to serve the Moroccan student community. Best of luck to everyone preparing for their exams!
*If you find this project helpful, consider giving it a ⭐!*
