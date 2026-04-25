import json
import requests
from bs4 import BeautifulSoup
import re

# 1. Load the current database
def load_db(filepath='exams.json'):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

# 2. Save the updated database
def save_db(data, filepath='exams.json'):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 3. The Web Scraper (Template)
def fetch_latest_dates():
    """
    This is where the actual scraping happens. 
    You need to adapt the URL and HTML classes based on your target source.
    """
    url = "https://www.tawjihnet.net/actualites/" # Example target
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        updates = {}
        
        # Example Logic: Searching for articles related to ENSA
        # You will need to inspect the actual website to get the right CSS classes
        articles = soup.find_all('article') 
        for article in articles:
            title = article.find('h2').text if article.find('h2') else ""
            
            # If the article is about ENSA and contains a date pattern
            if "ENSA" in title.upper() or "المدارس الوطنية للعلوم التطبيقية" in title:
                text_content = article.text
                # Look for a date format like DD/MM/YYYY
                match = re.search(r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})', text_content)
                if match:
                    day, month, year = match.groups()
                    updates['ensa'] = {"day": int(day), "month": int(month)}
                    print(f"Found new ENSA date: {day}/{month}")
        
        return updates

    except Exception as e:
        print(f"Scraping failed: {e}")
        return {}

# 4. Main Execution
def main():
    print("Starting automated date check...")
    exams_db = load_db()
    new_dates = fetch_latest_dates()
    
    updated = False
    
    # Apply updates to the database
    for exam in exams_db:
        if exam['id'] in new_dates:
            if exam['day'] != new_dates[exam['id']]['day'] or exam['month'] != new_dates[exam['id']]['month']:
                exam['day'] = new_dates[exam['id']]['day']
                exam['month'] = new_dates[exam['id']]['month']
                updated = True
                print(f"Updated {exam['id']} to {exam['day']}/{exam['month']}")

    # Save only if changes were found
    if updated:
        save_db(exams_db)
        print("exams.json has been updated successfully.")
    else:
        print("No changes found. Database is up to date.")

if __name__ == "__main__":
    main()
