```javascript
// ============================================================================
// പട്ടാമ്പി നൂറുൽ ഹിദായ ഹിഫ്ളുൽ ഖുർആൻ കോളേജ് — Optimistic UI + Supabase + PDF
// ============================================================================

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const GOOGLE_SHEET_WEBHOOK_URL = '';

const supabaseClient =
  window.supabase && SUPABASE_URL !== 'YOUR_SUPABASE_URL'
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const autoSaveFields = document.querySelectorAll('.auto-save');
const saveStatus = document.getElementById('saveStatus');
let selectedPhotoFile = null;

window.addEventListener('DOMContentLoaded', () => {
  autoSaveFields.forEach(field => {
    const savedValue = localStorage.getItem('nh_app_' + field.id);
    if (savedValue !== null) field.value = savedValue;
  });
  updateProgress();
  syncPendingOfflineData();
});

autoSaveFields.forEach(field => {
  field.addEventListener('input', () => {
    localStorage.setItem('nh_app_' + field.id, field.value);
    if (saveStatus) saveStatus.innerText = '✓ ഫോണിൽ സേവ് ചെയ്തു';
    updateProgress();
  });
});

function updateProgress() {
  const requiredFields = document.querySelectorAll('#admissionForm [required]');
  if (!requiredFields.length) return;
  let filled = 0;
  requiredFields.forEach(f => {
    if (String(f.value || '').trim() !== '') filled++;
  });
  const pct = Math.round((filled / requiredFields.length) * 100);
  const bar = document.getElementById('progressFill');
  const txt = document.getElementById('progressText');
  if (bar) bar.style.width = pct + '%';
  if (txt) txt.innerText = pct + '%';
}

function handlePhotoSelect(event) {
  selectedPhotoFile = event.target.files[0];
  if (selectedPhotoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const formImg = document.getElementById('form_photo_preview');
      const formPh = document.getElementById('form_photo_placeholder');
      if (formImg) { formImg.src = e.target.result; formImg.style.display = 'block'; }
      if (formPh) formPh.style.display = 'none';

      const prImg = document.getElementById('pr_photo');
      const prTxt = document.getElementById('pr_photo_text');
      if (prImg) { prImg.src = e.target.result; prImg.style.display = 'block'; }
      if (prTxt) prTxt.style.display = 'none';
    };
    reader.readAsDataURL(selectedPhotoFile);
  }
}

function clearSavedForm() {
  if (confirm('ഫോമിലെ വിവരങ്ങൾ മായ്ക്കണോ?')) {
    autoSaveFields.forEach(field => {
      field.value = field.tagName === 'SELECT' ? 'അതെ' : '';
      localStorage.removeItem('nh_app_' + field.id);
    });
    document.getElementById('admissionForm').reset();
    selectedPhotoFile = null;

    ['form_photo_preview', 'pr_photo'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.src = ''; el.style.display = 'none'; }
    });
    ['form_photo_placeholder', 'pr_photo_text'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });

    updateProgress();
    if (saveStatus) saveStatus.innerText = 'ഫോം ക്ലിയർ ചെയ്തു';
  }
}

function collectFormData() {
  return {
    name: document.getElementById('name').value,
    house_name: document.getElementById('houseName').value,
    father_name: document.getElementById('fatherName').value,
    job: document.getElementById('job').value,
    mother_name: document.getElementById('motherName').value,
    dob: document.getElementById('dob').value,
    dob_words: document.getElementById('dobWords').value,
    madrasa_info: document.getElementById('madrasaInfo').value,
    samastha_reg: document.getElementById('samasthaReg').value,
    school_info: document.getElementById('schoolInfo').value,
    address: document.getElementById('address').value,
    phone: document.getElementById('phone').value,
    pin: document.getElementById('pin').value,
    district: document.getElementById('district').value,
    whatsapp: document.getElementById('whatsapp').value,
    aadhar: document.getElementById('aadhar').value,
    id_marks: document.getElementById('idMarks').value,
    samastha_agree: document.getElementById('samasthaAgree').value,
    photo_url: ''
  };
}

function fillPrintLayout(data) {
  document.getElementById('pr_name').innerText = data.name;
  document.getElementById('pr_sonName').innerText = data.name || '........................................';
  document.getElementById('pr_house').innerText = data.house_name;
  document.getElementById('pr_father').innerText = [data.father_name, data.job].filter(Boolean).join(', ');
  document.getElementById('pr_mother').innerText = data.mother_name;

  if (data.dob) {
    const d = new Date(data.dob);
    document.getElementById('pr_dob').innerText = !isNaN(d.getTime())
      ? `${('0' + d.getDate()).slice(-2)}-${('0' + (d.getMonth() + 1)).slice(-2)}-${d.getFullYear()}`
      : data.dob;
  } else {
    document.getElementById('pr_dob').innerText = '';
  }

  document.getElementById('pr_dobWords').innerText = data.dob_words ? `(${data.dob_words})` : '';
  document.getElementById('pr_madrasa').innerText = data.madrasa_info;
  document.getElementById('pr_samastha').innerText = data.samastha_reg;
  document.getElementById('pr_school').innerText = data.school_info;
  document.getElementById('pr_address').innerText = data.address;
  document.getElementById('pr_phone').innerText = data.phone;
  document.getElementById('pr_pin').innerText = data.pin;
  document.getElementById('pr_district').innerText = data.district;
  document.getElementById('pr_whatsapp').innerText = data.whatsapp;
  document.getElementById('pr_aadhar').innerText = data.aadhar;
  document.getElementById('pr_marks').innerText = data.id_marks;
  document.getElementById('pr_agree').innerText = data.samastha_agree;
}

async function handleInstantSubmit(event) {
  event.preventDefault();
  if (saveStatus) saveStatus.innerText = '⚡ PDF തയ്യാറാക്കുന്നു & സേവ് ചെയ്യുന്നു...';

  const formData = collectFormData();
  fillPrintLayout(formData);
  await downloadInstantPDF(formData.name || 'Admission');
  saveToBackendsFast(formData, selectedPhotoFile);
}

async function downloadInstantPDF(studentName) {
  const printEl = document.getElementById('printSection');
  printEl.classList.add('pdf-capturing');

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const opt = {
    margin: 0,
    filename: `${studentName.trim()}_Admission_Form.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css'] }
  };

  try {
    await html2pdf().set(opt).from(printEl).save();
  } finally {
    printEl.classList.remove('pdf-capturing');
  }
}

async function saveToBackendsFast(data, photoFile) {
  try {
    if (supabaseClient) {
      if (photoFile) {
        try {
          const fileExt = photoFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError } = await supabaseClient.storage
            .from('student-photos')
            .upload(fileName, photoFile);

          if (!uploadError) {
            const { data: publicUrlData } = supabaseClient.storage
              .from('student-photos')
              .getPublicUrl(fileName);
            data.photo_url = publicUrlData.publicUrl;
          }
        } catch (_) {}
      }

      const { error } = await supabaseClient.from('admissions').insert([data]);
      if (error) throw error;
    }

    if (GOOGLE_SHEET_WEBHOOK_URL) {
      fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(() => {});
    }

    if (saveStatus) {
      saveStatus.innerText = supabaseClient
        ? '✅ Supabase-ൽ വിജയകരമായി സേവ് ചെയ്തു!'
        : '✅ PDF തയ്യാറായി (ഫോണിൽ സേവ് ചെയ്തു)';
    }
  } catch (err) {
    console.warn('Sync error / offline mode:', err);
    const pending = JSON.parse(localStorage.getItem('nh_pending_sync') || '[]');
    pending.push(data);
    localStorage.setItem('nh_pending_sync', JSON.stringify(pending));
    if (saveStatus) {
      saveStatus.innerText = '⚠️ നെറ്റ് സ്ലോ ആണ് – ഫോണിൽ സേവ് ചെയ്തു, നെറ്റ് കിട്ടുമ്പോൾ അപ്ലോഡ് ആകും';
    }
  }
}

window.addEventListener('online', syncPendingOfflineData);

async function syncPendingOfflineData() {
  if (!supabaseClient) return;
  const pending = JSON.parse(localStorage.getItem('nh_pending_sync') || '[]');
  if (pending.length > 0 && navigator.onLine) {
    const { error } = await supabaseClient.from('admissions').insert(pending);
    if (!error) {
      localStorage.removeItem('nh_pending_sync');
      if (saveStatus) saveStatus.innerText = '✅ ഓഫ്ലൈൻ ഡാറ്റ Supabase-ലേക്ക് അപ്ലോഡ് ചെയ്തു!';
    }
  }
}
```