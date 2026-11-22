# നൂറുൽ ഹിദായ ഹിഫ്ളുൽ ഖുർആൻ കോളേജ് — വെബ്സൈറ്റ് & അഡ്മിഷൻ പോർട്ടൽ

## GitHub & Vercel വഴി Deploy ചെയ്യേണ്ട വിധം
1. ഈ ഫോൾഡറിലെ ഫയലുകൾ നിങ്ങളുടെ GitHub Repository-യിലേക്ക് Upload/Push ചെയ്യുക.
2. **Vercel**-ൽ പോയി **Add New Project** ക്ലിക്ക് ചെയ്ത് ഈ GitHub Repository തിരഞ്ഞെടുത്ത് **Deploy** അമർത്തുക.
3. **Supabase സെറ്റപ്പ്:** `supabase-setup.sql` Supabase SQL Editor-ൽ Run ചെയ്ത്, ലഭിക്കുന്ന `SUPABASE_URL`, `SUPABASE_ANON_KEY` എന്നിവ `app.js`-ൽ നൽകുക.
4. **Google Sheet (Optional):** `Code.gs` Google Sheet Apps Script-ൽ Deploy ചെയ്ത് ആ URL `app.js`-ലെ `GOOGLE_SHEET_WEBHOOK_URL`-ൽ നൽകാം.
