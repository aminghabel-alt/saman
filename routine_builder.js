// ══════════════════════════════════════════════
//  PAYWALL — Trial & Subscription Logic
//  Pieter Levels style: ship fast, charge early
// ══════════════════════════════════════════════

// ⚠️ IN VA LINK HARO AZ STRIPE DASHBOARD BIAR:
// Products → Payment Links → Create Link
// Success URL: https://YOUR-DOMAIN/routine_builder.html?paid=true
const STRIPE_MONTHLY = 'https://buy.stripe.com/test_8x2cN6cWDgjTdZ3bIB3ZK00';
const STRIPE_YEARLY  = 'https://buy.stripe.com/test_8x2cN6cWDgjTdZ3bIB3ZK00'; // TODO: yearly link

const TRIAL_KEY  = 'saman_trialStart';
const PAID_KEY   = 'saman_paid';
const TRIAL_DAYS = 7;

function initPaywall() {
  // 1. Agar paid — hich paywall neshoon nade
  if (localStorage.getItem(PAID_KEY) === 'true') {
    _applyPaidBadge();
    return;
  }

  // 2. Agar az Stripe bargashte ba ?paid=true
  const params = new URLSearchParams(window.location.search);
  if (params.get('paid') === 'true') {
    localStorage.setItem(PAID_KEY, 'true');
    window.history.replaceState({}, '', window.location.pathname);
    _applyPaidBadge();
    // Bere step 1 baad az inke init kamel shod
    setTimeout(() => { if (typeof goToStep === 'function') goToStep(1); }, 50);
    return;
  }

  // 3. Trial start ro set ya bekhan
  let trialStart = localStorage.getItem(TRIAL_KEY);
  if (!trialStart) {
    trialStart = Date.now().toString();
    localStorage.setItem(TRIAL_KEY, trialStart);
  }

  const msLeft   = parseInt(trialStart) + TRIAL_DAYS * 86400000 - Date.now();
  const daysLeft = Math.ceil(msLeft / 86400000);

  if (daysLeft <= 0) {
    showPaywall();
  } else {
    _showTrialBanner(daysLeft);
  }
}

function showPaywall() {
  // Stripe link setesh kon
  document.getElementById('paywallCta').href       = STRIPE_MONTHLY;
  document.getElementById('paywallCtaYearly').href = STRIPE_YEARLY;
  document.getElementById('paywallOverlay').style.display = 'flex';
  document.getElementById('trialBanner').style.display    = 'none';
}

function _showTrialBanner(daysLeft) {
  const banner = document.getElementById('trialBanner');
  const text   = document.getElementById('trialBannerText');
  const daysFa = ['صفر','یک','دو','سه','چهار','پنج','شش','هفت'];
  const label  = daysLeft <= 7 ? (daysFa[daysLeft] || daysLeft) : daysLeft;
  text.textContent = `⏳ ${label} روز دیگه از دوره رایگان باقیه — بعدش €5/ماه`;
  banner.style.display = 'flex';
}

function _applyPaidBadge() {
  // Kholaseh: pro badge ro to header neshoon bede (optional)
  const h1 = document.querySelector('.header h1');
  if (h1 && !h1.querySelector('.pro-badge')) {
    const badge = document.createElement('span');
    badge.className = 'pro-badge';
    badge.textContent = 'Pro';
    badge.style.cssText = 'font-size:.55rem;background:#34d399;color:#080b12;padding:2px 7px;border-radius:6px;font-weight:800;margin-right:8px;vertical-align:middle';
    h1.appendChild(badge);
  }
}

// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let currentStep = 1;
const TOTAL_STEPS = 7;
const STEP_LABELS = ['شخصی','کار','ورزش','تمرین','تغذیه','روتین','مرور'];

// ══════════════════════════════════════════════
//  LOCAL STORAGE — ذخیره و بازیابی وضعیت
// ══════════════════════════════════════════════
const LS_KEY = 'saman_v1';

function saveState() {
  const FIELD_IDS = ['f_name','f_gender','f_age','f_height','f_weight','f_city',
    'f_work_start','f_work_end','f_side_start','f_side_end','f_side_name',
    'f_gym_time','f_gym_dur','f_days_per_week','f_wake','f_sleep','f_sleep_hours',
    'f_breakfast_time','f_dinner_time','f_avoid'];
  const fieldVals = {};
  FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) fieldVals[id] = el.value;
  });
  const chipVals = {};
  ['chips_lang','chips_haswork','chips_sideproject','chips_activity','chips_cardio','chips_diet','chips_meals']
    .forEach(id => { chipVals[id] = getChipVal(id); });
  const multiChipVals = {};
  ['chips_workdays','chips_heavydays']
    .forEach(id => { multiChipVals[id] = getChipVals(id); });
  const optVals = {};
  ['opt_goal','opt_gym','opt_split']
    .forEach(id => { optVals[id] = getOptVal(id); });
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ currentStep, fieldVals, chipVals, multiChipVals, optVals, habits }));
  } catch(e) {}
}

function restoreState() {
  let state;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    state = JSON.parse(raw);
  } catch(e) { return false; }
  if (!state) return false;

  // Fields
  if (state.fieldVals) {
    Object.entries(state.fieldVals).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  }
  // Single chips
  if (state.chipVals) {
    Object.entries(state.chipVals).forEach(([id, val]) => {
      const wrap = document.getElementById(id);
      if (!wrap || !val) return;
      wrap.querySelectorAll('.chip').forEach(c => c.classList.toggle('selected', c.dataset.val === val));
    });
  }
  // Multi chips
  if (state.multiChipVals) {
    Object.entries(state.multiChipVals).forEach(([id, vals]) => {
      const wrap = document.getElementById(id);
      if (!wrap || !vals) return;
      wrap.querySelectorAll('.chip').forEach(c => c.classList.toggle('selected', vals.includes(c.dataset.val)));
    });
  }
  // Option cards
  if (state.optVals) {
    Object.entries(state.optVals).forEach(([id, val]) => {
      const wrap = document.getElementById(id);
      if (!wrap || !val) return;
      wrap.querySelectorAll('.opt-card').forEach(c => c.classList.toggle('selected', c.dataset.val === val));
    });
  }
  // Habits
  if (state.habits && Array.isArray(state.habits) && state.habits.length > 0) {
    habits = state.habits;
  }
  // Step
  if (state.currentStep >= 1 && state.currentStep <= TOTAL_STEPS) {
    currentStep = state.currentStep;
  }
  // Sync dependent UI
  toggleWorkFields();
  toggleSideProject();
  const dpwEl = document.getElementById('f_days_per_week');
  if (dpwEl) updateDPW(dpwEl.value);
  return true;
}

// ══════════════════════════════════════════════
//  PROGRESS BAR
// ══════════════════════════════════════════════
function renderProgress() {
  const row = document.getElementById('stepsRow');
  row.innerHTML = '';
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.createElement('div');
    dot.className = 'step-dot' + (i < currentStep ? ' done' : i === currentStep ? ' active' : '');
    dot.textContent = i < currentStep ? '✓' : i;
    row.appendChild(dot);
    if (i < TOTAL_STEPS) {
      const line = document.createElement('div');
      line.className = 'step-line' + (i < currentStep ? ' done' : '');
      row.appendChild(line);
    }
  }
  document.getElementById('stepTitle').innerHTML =
    `گام <span>${currentStep}</span> از ${TOTAL_STEPS} — ${STEP_LABELS[currentStep-1]}`;
  document.getElementById('progFill').style.width = ((currentStep-1)/(TOTAL_STEPS-1)*100) + '%';

  // Buttons
  document.getElementById('prevBtn').style.display = currentStep === 1 ? 'none' : '';
  const nb = document.getElementById('nextBtn');
  if (currentStep === TOTAL_STEPS) {
    nb.textContent = '🚀 بساز!';
    nb.className = 'btn btn-gen';
  } else {
    nb.textContent = 'بعدی ←';
    nb.className = 'btn btn-next';
  }
}

// ══════════════════════════════════════════════
//  DEBOUNCED SAVE (baraye input fields)
// ══════════════════════════════════════════════
let _saveTimer = null;
function debouncedSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveState, 600);
}

// ══════════════════════════════════════════════
//  CHIPS (multi or single select)
// ══════════════════════════════════════════════
function initChips(id, multi = false) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  wrap.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => {
      if (!multi) wrap.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
      c.classList.toggle('selected');
      if (id === 'chips_haswork') toggleWorkFields();
      if (id === 'chips_sideproject') toggleSideProject();
      if (id === 'opt_split' || id === 'chips_activity') updateWeekPlan();
      if (id === 'f_days_per_week') updateWeekPlan();
      saveState();
    });
  });
}

function initOptionCards(id) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  wrap.querySelectorAll('.opt-card').forEach(c => {
    c.addEventListener('click', () => {
      wrap.querySelectorAll('.opt-card').forEach(x => x.classList.remove('selected'));
      c.classList.add('selected');
      if (id === 'opt_split') updateWeekPlan();
      saveState();
    });
  });
}

function getChipVal(id) {
  const sel = document.querySelector(`#${id} .chip.selected`);
  return sel ? sel.dataset.val : null;
}

function getChipVals(id) {
  return [...document.querySelectorAll(`#${id} .chip.selected`)].map(c => c.dataset.val);
}

function getOptVal(id) {
  const sel = document.querySelector(`#${id} .opt-card.selected`);
  return sel ? sel.dataset.val : null;
}

// ══════════════════════════════════════════════
//  STEP 2 TOGGLES
// ══════════════════════════════════════════════
function toggleWorkFields() {
  const val = getChipVal('chips_haswork');
  document.getElementById('work_fields').style.display = val === 'no' ? 'none' : '';
}
function toggleSideProject() {
  const val = getChipVal('chips_sideproject');
  document.getElementById('sideproject_fields').style.display = val === 'yes' ? '' : 'none';
}

// ══════════════════════════════════════════════
//  STEP 3 — Days per week
// ══════════════════════════════════════════════
function updateDPW(v) {
  document.getElementById('dpw_val').textContent = v + ' روز';
  updateWeekPlan();
}

// ══════════════════════════════════════════════
//  STEP 4 — Week Plan Preview
// ══════════════════════════════════════════════
const SPLITS = {
  ppl: {
    4: [{t:'train',i:'💪',l:'Push\nسینه+سه‌سر'},{t:'train',i:'🦾',l:'Pull\nپشت+دوسر'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'🦵',l:'پا+شانه'},{t:'cardio',i:'🏃',l:'Cardio\nCore'},{t:'train',i:'💥',l:'Full\nBody'},{t:'rest',i:'🚶',l:'Rest\nفعال'}],
    3: [{t:'train',i:'💪',l:'Push'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'🦾',l:'Pull'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'🦵',l:'Legs'},{t:'rest',i:'❌',l:'Rest'},{t:'rest',i:'🚶',l:'فعال'}],
    5: [{t:'train',i:'💪',l:'Push'},{t:'train',i:'🦾',l:'Pull'},{t:'train',i:'🦵',l:'Legs'},{t:'train',i:'💪',l:'Push 2'},{t:'train',i:'🦾',l:'Pull 2'},{t:'rest',i:'❌',l:'Rest'},{t:'rest',i:'🚶',l:'فعال'}],
    6: [{t:'train',i:'💪',l:'Push'},{t:'train',i:'🦾',l:'Pull'},{t:'train',i:'🦵',l:'Legs'},{t:'train',i:'💪',l:'Push'},{t:'train',i:'🦾',l:'Pull'},{t:'train',i:'🦵',l:'Legs'},{t:'rest',i:'🚶',l:'فعال'}],
  },
  upper_lower: {
    4: [{t:'train',i:'⬆️',l:'Upper A'},{t:'train',i:'⬇️',l:'Lower A'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'⬆️',l:'Upper B'},{t:'train',i:'⬇️',l:'Lower B'},{t:'cardio',i:'🏃',l:'Cardio'},{t:'rest',i:'🚶',l:'فعال'}],
    3: [{t:'train',i:'⬆️',l:'Upper'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'⬇️',l:'Lower'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'⬆️',l:'Upper'},{t:'rest',i:'❌',l:'Rest'},{t:'rest',i:'🚶',l:'فعال'}],
    5: [{t:'train',i:'⬆️',l:'Upper'},{t:'train',i:'⬇️',l:'Lower'},{t:'train',i:'⬆️',l:'Upper'},{t:'train',i:'⬇️',l:'Lower'},{t:'cardio',i:'🏃',l:'Cardio'},{t:'rest',i:'❌',l:'Rest'},{t:'rest',i:'🚶',l:'فعال'}],
    6: [{t:'train',i:'⬆️',l:'Upper'},{t:'train',i:'⬇️',l:'Lower'},{t:'train',i:'⬆️',l:'Upper'},{t:'train',i:'⬇️',l:'Lower'},{t:'cardio',i:'🏃',l:'Cardio'},{t:'train',i:'💪',l:'Full Body'},{t:'rest',i:'🚶',l:'فعال'}],
  },
  fullbody: {
    3: [{t:'train',i:'💥',l:'Full A'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'💥',l:'Full B'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'💥',l:'Full C'},{t:'rest',i:'❌',l:'Rest'},{t:'rest',i:'🚶',l:'فعال'}],
    4: [{t:'train',i:'💥',l:'Full A'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'💥',l:'Full B'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'💥',l:'Full C'},{t:'train',i:'💥',l:'Full D'},{t:'rest',i:'🚶',l:'فعال'}],
    2: [{t:'train',i:'💥',l:'Full A'},{t:'rest',i:'❌',l:'Rest'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'💥',l:'Full B'},{t:'rest',i:'❌',l:'Rest'},{t:'rest',i:'❌',l:'Rest'},{t:'rest',i:'🚶',l:'فعال'}],
  },
  bro: {
    5: [{t:'train',i:'🫁',l:'سینه'},{t:'train',i:'🦾',l:'پشت'},{t:'train',i:'🙌',l:'شانه'},{t:'train',i:'💪',l:'بازو'},{t:'train',i:'🦵',l:'پا'},{t:'rest',i:'❌',l:'Rest'},{t:'rest',i:'🚶',l:'فعال'}],
    6: [{t:'train',i:'🫁',l:'سینه'},{t:'train',i:'🦾',l:'پشت'},{t:'train',i:'🙌',l:'شانه'},{t:'train',i:'💪',l:'بازو'},{t:'train',i:'🦵',l:'پا'},{t:'cardio',i:'🏃',l:'Cardio'},{t:'rest',i:'🚶',l:'فعال'}],
    4: [{t:'train',i:'🫁',l:'سینه+سه‌سر'},{t:'train',i:'🦾',l:'پشت+دوسر'},{t:'rest',i:'❌',l:'Rest'},{t:'train',i:'🦵',l:'پا'},{t:'train',i:'🙌',l:'شانه'},{t:'rest',i:'❌',l:'Rest'},{t:'rest',i:'🚶',l:'فعال'}],
  },
};
const DAY_NAMES = ['Mo','Di','Mi','Do','Fr','Sa','So'];

function updateWeekPlan() {
  const split = getOptVal('opt_split') || 'ppl';
  const dpw = parseInt(document.getElementById('f_days_per_week')?.value || 4);
  const splitData = SPLITS[split] || SPLITS.ppl;
  const closestKey = Object.keys(splitData).reduce((a,b) => Math.abs(parseInt(b)-dpw) < Math.abs(parseInt(a)-dpw) ? b : a);
  const plan = splitData[closestKey] || splitData[Object.keys(splitData)[0]];
  const wrap = document.getElementById('weekPlanPreview');
  if (!wrap) return;
  wrap.innerHTML = plan.map((d,i) => `
    <div class="wp-day ${d.t}">
      <div class="wd">${DAY_NAMES[i]}</div>
      <div class="wi">${d.i}</div>
      <div class="wt">${d.l}</div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════
//  STEP 5 — Calorie Calculator
// ══════════════════════════════════════════════
function calcCalories() {
  const w = parseFloat(document.getElementById('f_weight')?.value) || 75;
  const h = parseFloat(document.getElementById('f_height')?.value) || 175;
  const a = parseFloat(document.getElementById('f_age')?.value) || 25;
  const g = document.getElementById('f_gender')?.value || 'male';
  const act = parseFloat(getChipVal('chips_activity') || '1.55');
  const goal = getOptVal('opt_goal') || 'bulk';

  const bmr = g === 'male'
    ? 10*w + 6.25*h - 5*a + 5
    : 10*w + 6.25*h - 5*a - 161;
  const tdee = Math.round(bmr * act);
  const trainCal = goal === 'bulk' ? tdee+350 : goal === 'cut' ? tdee-500 : tdee;
  const restCal = goal === 'bulk' ? tdee+100 : goal === 'cut' ? tdee-600 : tdee-150;
  const protein = goal === 'cut' ? Math.round(w*2.5) : Math.round(w*2.2);

  return { bmr: Math.round(bmr), tdee, trainCal, restCal, protein };
}

function renderCalPreview(id) {
  const c = calcCalories();
  const goal = getOptVal('opt_goal') || 'bulk';
  const goalText = goal === 'bulk' ? 'Bulk — عضله‌سازی' : goal === 'cut' ? 'Cut — چربی‌سوزی' : 'Maintain — حفظ فرم';
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `
    <div class="cal-preview">
      <h4>📊 محاسبه خودکار — ${goalText}</h4>
      <div class="cal-row"><span class="cn">BMR (متابولیسم پایه)</span><span class="cv">${c.bmr} kcal</span></div>
      <div class="cal-row"><span class="cn">TDEE (کالری روزانه کل)</span><span class="cv">${c.tdee} kcal</span></div>
      <div class="cal-row"><span class="cn">هدف روزهای تمرین</span><span class="cv" style="color:var(--green)">${c.trainCal} kcal</span></div>
      <div class="cal-row"><span class="cn">هدف روزهای استراحت</span><span class="cv" style="color:var(--blue)">${c.restCal} kcal</span></div>
      <div class="cal-row"><span class="cn">پروتئین روزانه</span><span class="cv" style="color:var(--orange)">${c.protein}g+</span></div>
    </div>
  `;
}

// ══════════════════════════════════════════════
//  STEP 6 — Habits
// ══════════════════════════════════════════════
const DEFAULT_HABITS = [
  { icon:'🏋️', label:'ورزش / کاردیو' },
  { icon:'💻', label:'کدنویسی وب‌اپ (۲ ساعت)' },
  { icon:'💧', label:'۳ لیتر آب' },
  { icon:'🥗', label:'تغذیه مطابق برنامه' },
  { icon:'🌙', label:'خواب قبل از موعد مقرر' },
  { icon:'🚶', label:'پیاده‌روی بعد ناهار' },
  { icon:'📵', label:'بدون موبایل ۳۰ دق صبح' },
  { icon:'🫙', label:'وعده قبل خواب' },
];
let habits = [...DEFAULT_HABITS];
const ICONS = ['🏋️','💻','💧','🥗','🌙','🚶','📵','🫙','📚','🧘','🎯','❤️','⚡','🎨','🎵','🏃'];

function renderHabits() {
  const wrap = document.getElementById('habitBuilder');
  wrap.innerHTML = habits.map((h, i) => `
    <div class="habit-item">
      <span class="hi-icon" onclick="cycleIcon(${i})">${h.icon}</span>
      <input value="${h.label}" oninput="habits[${i}].label=this.value;debouncedSave()" placeholder="عادت..." />
      <span class="remove-h" onclick="removeHabit(${i})">✕</span>
    </div>
  `).join('');
}
function addHabit() {
  if (habits.length >= 10) return;
  habits.push({ icon:'🎯', label:'' });
  renderHabits();
  saveState();
}
function removeHabit(i) {
  habits.splice(i, 1);
  renderHabits();
  saveState();
}
function cycleIcon(i) {
  const idx = ICONS.indexOf(habits[i].icon);
  habits[i].icon = ICONS[(idx+1) % ICONS.length];
  renderHabits();
  saveState();
}

// ══════════════════════════════════════════════
//  STEP 7 — Summary
// ══════════════════════════════════════════════
function renderSummary() {
  const name = document.getElementById('f_name')?.value || '—';
  const height = document.getElementById('f_height')?.value || '—';
  const weight = document.getElementById('f_weight')?.value || '—';
  const age = document.getElementById('f_age')?.value || '—';
  const city = document.getElementById('f_city')?.value || '—';
  const wStart = document.getElementById('f_work_start')?.value || '08:00';
  const wEnd = document.getElementById('f_work_end')?.value || '16:00';
  const gymTime = document.getElementById('f_gym_time')?.value || '06:00';
  const gymDur = document.getElementById('f_gym_dur')?.value || '45';
  const dpw = document.getElementById('f_days_per_week')?.value || '4';
  const sideStart = document.getElementById('f_side_start')?.value || '16:30';
  const sideEnd = document.getElementById('f_side_end')?.value || '18:30';
  const sideName = document.getElementById('f_side_name')?.value || 'پروژه جانبی';
  const wake = document.getElementById('f_wake')?.value || '05:00';
  const sleep = document.getElementById('f_sleep')?.value || '22:00';
  const sleepH = document.getElementById('f_sleep_hours')?.value || '7.5';

  const goal = getOptVal('opt_goal') || 'bulk';
  const gym = getOptVal('opt_gym') || 'full';
  const split = getOptVal('opt_split') || 'ppl';
  const hasSide = getChipVal('chips_sideproject') === 'yes';

  const goalLabel = { bulk:'💪 Bulk — عضله‌سازی', cut:'🔥 Cut — چربی‌سوزی', maintain:'⚖️ Maintain' }[goal];
  const gymLabel = { full:'🏋️ باشگاه کامل', home:'🏠 خانه', bodyweight:'🤸 وزن بدن' }[gym];
  const splitLabel = { ppl:'PPL', upper_lower:'Upper/Lower', fullbody:'Full Body', bro:'Bro Split' }[split];

  document.getElementById('summaryGrid').innerHTML = `
    <div class="sum-card"><h4>👤 شخصی</h4><p>${name}<br>${age} ساله · ${height}cm · ${weight}kg<br>${city}</p></div>
    <div class="sum-card"><h4>💼 کاری</h4><p><strong>${wStart}</strong> تا <strong>${wEnd}</strong><br>${hasSide?sideName+' '+sideStart+'-'+sideEnd:''}</p></div>
    <div class="sum-card"><h4>🏋️ ورزش</h4><p>${goalLabel}<br>${gymLabel}<br><strong>${dpw}</strong> روز/هفته · ${gymTime} · ${gymDur}دق</p></div>
    <div class="sum-card"><h4>📋 اسپلیت</h4><p>${splitLabel}<br>${getChipVal('chips_diet')||'همه‌چیزخوار'}</p></div>
    <div class="sum-card"><h4>🌙 خواب</h4><p>بیدار: <strong>${wake}</strong><br>خواب: <strong>${sleep}</strong><br>هدف: ${sleepH} ساعت</p></div>
    <div class="sum-card"><h4>✅ عادات</h4><p>${habits.length} عادت تنظیم شده</p></div>
  `;
  renderCalPreview('finalCalPreview');
}

// ══════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════
function showStep(n) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('step-'+n);
  if (panel) panel.classList.add('active');
  renderProgress();

  if (n === 4) updateWeekPlan();
  if (n === 5) renderCalPreview('cal_preview_wrap');
  if (n === 6) renderHabits();
  if (n === 7) renderSummary();

  window.scrollTo(0, 0);
  document.getElementById('formWrap').scrollTop = 0;
}

function goNext() {
  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    showStep(currentStep);
    saveState();
  } else {
    generateHub();
  }
}

function goPrev() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
    saveState();
  }
}

// ══════════════════════════════════════════════
//  GENERATOR
// ══════════════════════════════════════════════
function generateHub() {
  const data = collectData();
  const html = buildHTML(data);

  // Iframe ba srcdoc — no blob URL, kaar mikone az file:// va https:// ham
  const iframe = document.createElement('iframe');
  iframe.id = 'hubFrame';
  iframe.srcdoc = html;
  iframe.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:none;z-index:9999;background:#080b12;';
  document.body.appendChild(iframe);

  // Vaghti ویرایش ro mizane, iframe ro bezar va wizard ro neshoon bede
  window.addEventListener('message', function onEdit(e) {
    if (e.data === 'SAMAN_EDIT') {
      document.getElementById('hubFrame')?.remove();
      window.removeEventListener('message', onEdit);
      showStep(currentStep);
    }
  });
}

function collectData() {
  const dpw = parseInt(document.getElementById('f_days_per_week')?.value || 4);
  const split = getOptVal('opt_split') || 'ppl';
  const splitData = SPLITS[split] || SPLITS.ppl;
  const closestKey = Object.keys(splitData).reduce((a,b) => Math.abs(parseInt(b)-dpw)<Math.abs(parseInt(a)-dpw)?b:a);
  const weekPlan = splitData[closestKey];
  const cal = calcCalories();

  return {
    name: document.getElementById('f_name')?.value || 'کاربر',
    gender: document.getElementById('f_gender')?.value || 'male',
    age: document.getElementById('f_age')?.value || '25',
    height: document.getElementById('f_height')?.value || '175',
    weight: document.getElementById('f_weight')?.value || '75',
    city: document.getElementById('f_city')?.value || '',
    lang: getChipVal('chips_lang') || 'fa',
    hasWork: getChipVal('chips_haswork') !== 'no',
    workStart: document.getElementById('f_work_start')?.value || '08:00',
    workEnd: document.getElementById('f_work_end')?.value || '16:00',
    workDays: getChipVals('chips_workdays'),
    heavyDays: getChipVals('chips_heavydays'),
    hasSide: getChipVal('chips_sideproject') === 'yes',
    sideStart: document.getElementById('f_side_start')?.value || '16:30',
    sideEnd: document.getElementById('f_side_end')?.value || '18:30',
    sideName: document.getElementById('f_side_name')?.value || 'پروژه جانبی',
    goal: getOptVal('opt_goal') || 'bulk',
    gymType: getOptVal('opt_gym') || 'full',
    gymTime: document.getElementById('f_gym_time')?.value || '06:00',
    gymDur: document.getElementById('f_gym_dur')?.value || '45',
    daysPerWeek: dpw,
    split,
    weekPlan,
    cardioType: getChipVal('chips_cardio') || 'hiit',
    diet: getChipVal('chips_diet') || 'omni',
    avoid: document.getElementById('f_avoid')?.value || '',
    mealCount: getChipVal('chips_meals') || '5',
    breakfastTime: document.getElementById('f_breakfast_time')?.value || '07:00',
    dinnerTime: document.getElementById('f_dinner_time')?.value || '18:30',
    wake: document.getElementById('f_wake')?.value || '05:00',
    sleep: document.getElementById('f_sleep')?.value || '22:00',
    sleepHours: document.getElementById('f_sleep_hours')?.value || '7.5',
    habits: habits.filter(h => h.label.trim()),
    cal,
  };
}

function buildHTML(d, baseUrl='') {
  const goalLabel = { bulk:'💪 Bulk — عضله‌سازی', cut:'🔥 Cut — چربی‌سوزی', maintain:'⚖️ Maintain' }[d.goal] || '💪 Bulk';
  const gymLabel = { full:'🏋️ باشگاه', home:'🏠 خانه', bodyweight:'🤸 وزن بدن' }[d.gymType] || '🏋️ باشگاه';
  const splitLabel = { ppl:'PPL', upper_lower:'Upper/Lower', fullbody:'Full Body', bro:'Bro Split' }[d.split] || 'PPL';

  // Build day names
  const DAY_FA = ['دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه','شنبه','یکشنبه'];
  const DAY_DE = ['Mo','Di','Mi','Do','Fr','Sa','So'];

  const daysJS = d.weekPlan.map((day, i) => {
    const label = day.l.replace(/\n/g,' ').replace(/'/g,"\\'").trim();
    const gym = `'${label}'`;
    return `{ de:'${DAY_DE[i]}', fa:'${DAY_FA[i]}', type:'${day.t}', gym:${gym}, icon:'${day.i}' }`;
  }).join(',\n  ');

  const habitsJS = d.habits.map(h => `{icon:'${h.icon}',label:'${h.label.replace(/'/g,"\\'").replace(/\n/g,' ')}'}`).join(',');

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>سامان — ${d.name}</title>
<style>
:root{--bg:#080b12;--bg1:#0d1117;--bg2:#111827;--bg3:#1a2235;--border:#1e293b;--border2:#263044;--text:#e2e8f0;--text2:#94a3b8;--text3:#475569;--blue:#60a5fa;--blue-d:#1e3a5f;--green:#34d399;--green-d:#1e3a2f;--orange:#f97316;--purple:#a78bfa;--yellow:#fbbf24;--red:#f87171}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden}
body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:var(--bg);color:var(--text);direction:rtl}
#app{display:flex;flex-direction:column;height:100vh}
.header{background:linear-gradient(135deg,#0f1f3d,var(--bg1));padding:14px 16px 10px;border-bottom:1px solid var(--border);flex-shrink:0}
.header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.header-title{font-size:1rem;font-weight:800;color:var(--text)}
.header-title span{color:var(--blue)}
.header-date{font-size:0.65rem;color:var(--text3);background:var(--bg3);padding:3px 10px;border-radius:20px;border:1px solid var(--border)}
.day-strip{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none}
.day-strip::-webkit-scrollbar{display:none}
.day-btn{padding:5px 13px;border-radius:14px;border:1px solid var(--border);background:transparent;color:var(--text3);cursor:pointer;font-size:0.68rem;white-space:nowrap;transition:all .2s;flex-shrink:0;font-family:inherit}
.day-btn.active{background:var(--blue-d);color:var(--blue);border-color:#2d5a8a;font-weight:700}
.content-area{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
.page{display:none;padding:12px 14px 80px}
.page.active{display:block}
.bottom-nav{position:fixed;bottom:0;left:0;right:0;background:var(--bg1);border-top:1px solid var(--border);display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom)}
.nav-btn{flex:1;display:flex;flex-direction:column;align-items:center;padding:10px 4px 8px;cursor:pointer;border:none;background:transparent;color:var(--text3);font-family:inherit;transition:all .2s;gap:3px}
.nav-btn .nav-icon{font-size:1.2rem}
.nav-btn .nav-label{font-size:0.58rem}
.nav-btn.active{color:var(--blue)}
.nav-btn.active .nav-icon{transform:translateY(-2px)}
.card{background:var(--bg1);border-radius:14px;border:1px solid var(--border);overflow:hidden;margin-bottom:10px}
.card-hdr{padding:10px 14px 0;display:flex;align-items:center;gap:8px}
.card-hdr h2{font-size:0.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em}
.card-body{padding:8px 14px 12px}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}
.stat-card{background:var(--bg1);border-radius:12px;border:1px solid var(--border);padding:10px 6px;text-align:center}
.stat-val{font-size:1.1rem;font-weight:800}
.stat-lbl{font-size:0.56rem;color:var(--text3);margin-top:2px}
.timeline{display:flex;flex-direction:column}
.tblock{display:flex;align-items:stretch}
.time-col{width:50px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;padding:5px 0}
.time-txt{font-size:0.58rem;color:var(--text3);white-space:nowrap}
.time-line{flex:1;width:1px;background:var(--border);margin:2px 0}
.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin:4px 0}
.tbc{flex:1;padding:5px 10px 5px 5px;border-right:2px solid transparent;margin:2px 0;border-radius:0 8px 8px 0}
.tbc-icon{font-size:.85rem;float:right;margin-left:5px}
.tbc-title{font-size:.78rem;font-weight:600;margin-bottom:1px}
.tbc-desc{font-size:.65rem;color:var(--text2);line-height:1.4}
.tbc-tag{display:inline-block;font-size:.56rem;padding:1px 7px;border-radius:8px;margin-top:3px;background:var(--bg);border:1px solid var(--border);color:var(--text2)}
.c-gym{border-color:var(--orange)}.c-gym .dot{background:var(--orange)}.c-gym .tbc-title{color:#fb923c}
.c-food{border-color:var(--yellow)}.c-food .dot{background:var(--yellow)}.c-food .tbc-title{color:#fde047}
.c-work{border-color:var(--blue)}.c-work .dot{background:var(--blue)}.c-work .tbc-title{color:#93c5fd}
.c-code{border-color:var(--green)}.c-code .dot{background:var(--green)}.c-code .tbc-title{color:#6ee7b7}
.c-buf{border-color:var(--purple)}.c-buf .dot{background:var(--purple)}.c-buf .tbc-title{color:#c4b5fd}
.c-free{border-color:var(--text3)}.c-free .dot{background:var(--text3)}.c-free .tbc-title{color:var(--text2)}
.c-sleep{border-color:var(--blue-d)}.c-sleep .dot{background:#2d4a8a}.c-sleep .tbc-title{color:var(--blue)}
.habit-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--bg)}
.habit-row:last-child{border-bottom:none}
.hchk{width:22px;height:22px;border-radius:6px;border:2px solid var(--border2);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.7rem;flex-shrink:0;transition:all .2s}
.hchk.done{background:var(--green);border-color:var(--green);color:var(--bg);font-weight:700}
.hlbl{flex:1;font-size:.76rem}
.week-cal{display:flex;gap:4px}
.wd-cal{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px}
.wdl{font-size:.56rem;color:var(--text3)}
.wdd{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700;border:1px solid var(--border);cursor:pointer;transition:all .2s}
.wdd.today{border-color:var(--blue)!important;color:var(--blue)!important}
.wdd.train{background:var(--green-d);color:var(--green);border-color:#2d5a3f}
.wdd.cardio{background:#2a1e1e;color:var(--red);border-color:#5a2d2d}
.wdd.rest{background:var(--bg3);color:var(--text3)}
.wdd.done-day{background:var(--green)!important;color:var(--bg)!important;border-color:var(--green)!important}
.wdt{font-size:.5rem;color:var(--text3);text-align:center}
.ex-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--bg)}
.ex-row:last-child{border-bottom:none}
.ex-num{font-size:.58rem;color:var(--text3);min-width:16px;text-align:center}
.ex-name{flex:1;font-size:.79rem;font-weight:500}
.ex-sets{font-size:.68rem;background:var(--bg);border:1px solid var(--border2);border-radius:6px;padding:2px 8px;color:var(--orange);white-space:nowrap;font-weight:600}
.info-box{background:var(--blue-d);border:1px solid #2d5a8a;border-radius:10px;padding:10px 12px;font-size:.74rem;color:#93c5fd;line-height:1.7;margin-bottom:8px}
.macro-row{display:flex;gap:5px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)}
.mp{flex:1;text-align:center;background:var(--bg);border-radius:7px;padding:5px 2px}
.mp .mv{font-size:.8rem;font-weight:700}
.mp .ml{font-size:.56rem;color:var(--text3);margin-top:1px}
.pc{color:var(--green)}.cc{color:var(--yellow)}.fc{color:var(--orange)}.kc{color:var(--purple)}
.meal-card{background:var(--bg1);border-radius:12px;border:1px solid var(--border);margin-bottom:10px;overflow:hidden}
.mhbar{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--border)}
.mtime{font-size:.62rem;color:var(--text3);min-width:42px}
.micon{font-size:1rem}
.mname{flex:1;font-size:.86rem;font-weight:600}
.mkcal{font-size:.65rem;background:var(--bg);border:1px solid var(--border2);border-radius:8px;padding:2px 8px;color:var(--green)}
.mbody{padding:8px 14px 10px}
.mi{display:flex;justify-content:space-between;font-size:.75rem;padding:4px 0;border-bottom:1px solid var(--bg)}
.mi:last-child{border-bottom:none}
.prog-bar-t{height:5px;background:var(--border);border-radius:3px;overflow:hidden;margin-top:4px}
.prog-fill{height:100%;border-radius:3px}
.tot-card{background:linear-gradient(135deg,#0f1f3d,var(--bg1));border:1px solid var(--blue-d);border-radius:14px;padding:14px;margin-bottom:10px}
.tot-card h3{font-size:.76rem;color:var(--blue);margin-bottom:10px;font-weight:700}
.tot-row{display:flex;gap:7px}
.tot-pill{flex:1;text-align:center;background:var(--bg);border-radius:10px;padding:9px 3px}
.tot-pill .big{font-size:1rem;font-weight:800}
.tot-pill .sm{font-size:.58rem;color:var(--text3);margin-top:2px}
</style>
</head>
<body>
<div id="app">
<div class="header">
  <div class="header-top">
    <div class="header-title">سامان — ${d.name}</div>
    <div style="display:flex;align-items:center;gap:8px">
      <button onclick="window.parent.postMessage('SAMAN_EDIT','*')" style="background:transparent;border:1px solid var(--border2);color:var(--text3);border-radius:8px;padding:4px 10px;font-size:0.65rem;font-family:inherit;cursor:pointer;white-space:nowrap">✏️ ویرایش</button>
      <div class="header-date" id="headerDate"></div>
    </div>
  </div>
  <div class="day-strip" id="dayStrip"></div>
</div>
<div class="content-area" id="contentArea">

  <div class="page active" id="page-dash">
    <div class="stats-row" id="statsRow"></div>
    <div class="card"><div class="card-hdr"><h2>⏱ برنامه ساعتی</h2></div><div class="card-body"><div class="timeline" id="timeline"></div></div></div>
    <div class="card"><div class="card-hdr"><h2>✅ چک‌لیست</h2></div><div class="card-body" id="habitsBody"></div></div>
    <div class="card"><div class="card-hdr"><h2>📅 هفته جاری</h2></div><div class="card-body" id="weekBody"></div></div>
  </div>

  <div class="page" id="page-workout">
    <div id="workoutContent"></div>
  </div>

  <div class="page" id="page-nutrition">
    <div class="tot-card">
      <h3>📊 اهداف کالری — ${goalLabel}</h3>
      <div class="tot-row">
        <div class="tot-pill"><div class="big pc">${d.cal.protein}g</div><div class="sm">پروتئین</div></div>
        <div class="tot-pill"><div class="big cc">${d.cal.trainCal}</div><div class="sm">kcal تمرین</div></div>
        <div class="tot-pill"><div class="big fc">${d.cal.restCal}</div><div class="sm">kcal استراحت</div></div>
        <div class="tot-pill"><div class="big kc">${d.cal.tdee}</div><div class="sm">TDEE</div></div>
      </div>
      <div style="margin-top:10px;font-size:.7rem;color:var(--text3)">
        وزن ${d.weight}kg · قد ${d.height}cm · ${d.age} ساله · BMR: ${d.cal.bmr} kcal
      </div>
    </div>
    <div id="nutritionContent"></div>
    ${d.avoid ? `<div class="info-box" style="margin-top:6px">⚠️ <strong>اجتناب از:</strong> ${d.avoid}</div>` : ''}
  </div>

</div>

<div class="bottom-nav">
  <button class="nav-btn active" onclick="showPage('dash',this)"><span class="nav-icon">📊</span><span class="nav-label">داشبورد</span></button>
  <button class="nav-btn" onclick="showPage('workout',this)"><span class="nav-icon">💪</span><span class="nav-label">ورزش</span></button>
  <button class="nav-btn" onclick="showPage('nutrition',this)"><span class="nav-icon">🍽</span><span class="nav-label">تغذیه</span></button>
</div>
</div>

<script>
const DAYS=[${daysJS}];
const HABITS=[${habitsJS}];
const DAY_NAMES=['Mo','Di','Mi','Do','Fr','Sa','So'];
const jsDay=new Date().getDay();
const todayIdx=jsDay===0?6:jsDay-1;
let currentDay=todayIdx;
const habitState={};
const dayDoneState={};

function renderHeader(){
  const now=new Date();
  document.getElementById('headerDate').textContent=now.toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'});
  const strip=document.getElementById('dayStrip');
  strip.innerHTML='';
  DAYS.forEach((d,i)=>{
    const btn=document.createElement('button');
    btn.className='day-btn'+(i===currentDay?' active':'');
    btn.innerHTML=(i===todayIdx?'<span style="display:inline-block;width:5px;height:5px;background:var(--yellow);border-radius:50%;margin-left:3px;vertical-align:middle"></span>':'')+d.de+' <span style="opacity:.55;font-size:.62rem">'+d.fa+'</span>';
    btn.onclick=()=>{currentDay=i;renderAll()};
    strip.appendChild(btn);
  });
}

function buildTimeline(day){
  const blocks=[];
  const gymTime='${d.gymTime}';
  const gymDur=${parseInt(d.gymDur)};
  const workStart='${d.workStart}';
  const workEnd='${d.workEnd}';
  const sideStart='${d.sideStart}';
  const sideEnd='${d.sideEnd}';
  const breakfastTime='${d.breakfastTime}';
  const dinnerTime='${d.dinnerTime}';
  const sleepTime='${d.sleep}';
  const isRest=day.type==='rest';
  const isCardio=day.type==='cardio';

  if(!isRest){
    blocks.push({time:gymTime,cls:'c-gym',icon:day.icon,title:day.gym,desc:gymDur+' دقیقه — گرم‌کردن ۸ دق اجباری',tag:'صبح بدن سرده!'});
    blocks.push({time:breakfastTime,cls:'c-food',icon:'🍳',title:'صبحانه Post-Workout',desc:'پروتئین + کربو + سالم',tag:null});
  }
  ${d.hasWork ? `if(!isRest){blocks.push({time:workStart,cls:'c-work',icon:'💼',title:'Deep Work — کار',desc:'سنگین‌ترین تسک‌ها اول صبح',tag:'Pomodoro 50+10'})}` : ''}
  blocks.push({time:'12:30',cls:'c-food',icon:'🥗',title:'ناهار',desc:'پروتئین + کربو + سبزیجات',tag:null});
  ${d.hasSide ? `if(!isRest){blocks.push({time:sideStart,cls:'c-code',icon:'💻',title:'${d.sideName} — '+sideStart+' تا '+sideEnd,desc:'یه تسک مشخص — Commit!',tag:'هر روز یه چیز کوچیک'})}` : ''}
  blocks.push({time:dinnerTime,cls:'c-food',icon:'🍽',title:'شام',desc:'وعده آخر روز',tag:null});
  blocks.push({time:'19:00',cls:'c-free',icon:'🧘',title:'زمان آزاد',desc:'پادکست، کتاب، خانواده',tag:null});
  blocks.push({time:sleepTime,cls:'c-sleep',icon:'😴',title:'خواب — ${d.sleepHours} ساعت',desc:'صفحه نمایش خاموش',tag:null});

  if(isRest){
    return [{time:'08:00',cls:'c-free',icon:'☀️',title:'بیدار شدن آزاد',desc:'بدون زنگ ساعت',tag:null},{time:'10:00',cls:'c-food',icon:'🥞',title:'صبحانه آرام',desc:'بدون عجله',tag:null},{time:'13:00',cls:'c-food',icon:'🍳',title:'ناهار',desc:'پروتئین + سبزیجات',tag:null},{time:'15:00',cls:'c-free',icon:'🚶',title:'پیاده‌روی',desc:'۳۰–۴۵ دقیقه',tag:null},{time:dinnerTime,cls:'c-food',icon:'🍽',title:'شام',desc:'وعده آخر',tag:null},{time:sleepTime,cls:'c-sleep',icon:'😴',title:'خواب',desc:'${d.sleepHours} ساعت',tag:null}];
  }
  return blocks;
}

function renderDash(){
  const day=DAYS[currentDay];
  const isRest=day.type==='rest';
  document.getElementById('statsRow').innerHTML=
    '<div class="stat-card"><div class="stat-val" style="color:var(--blue)">'+(isRest?0:${parseInt(d.workEnd.split(':')[0])-parseInt(d.workStart.split(':')[0])})+'h</div><div class="stat-lbl">کار</div></div>'+
    '<div class="stat-card"><div class="stat-val" style="color:var(--green)">'+(isRest?0:${d.hasSide?Math.round((parseInt(d.sideEnd.split(':')[0])*60+parseInt(d.sideEnd.split(':')[1]))-(parseInt(d.sideStart.split(':')[0])*60+parseInt(d.sideStart.split(':')[1])))/60:0})+'h</div><div class="stat-lbl">پروژه</div></div>'+
    '<div class="stat-card"><div class="stat-val" style="color:var(--orange)">'+(isRest?0:'${d.gymDur}')+'m</div><div class="stat-lbl">ورزش</div></div>'+
    '<div class="stat-card"><div class="stat-val" style="color:var(--purple)">${d.sleepHours}h</div><div class="stat-lbl">خواب</div></div>';

  const blocks=buildTimeline(day);
  document.getElementById('timeline').innerHTML=blocks.map(b=>'<div class="tblock"><div class="time-col"><div class="time-txt">'+b.time+'</div><div class="time-line"></div></div><div class="tbc '+b.cls+'"><span class="tbc-icon">'+b.icon+'</span><div class="tbc-title">'+b.title+'</div><div class="tbc-desc">'+b.desc+'</div>'+(b.tag?'<div class="tbc-tag">'+b.tag+'</div>':'')+'</div></div>').join('');

  const habitsEl=document.getElementById('habitsBody');
  const rows=HABITS.map((h,hi)=>{const key=currentDay+'-'+hi;const done=habitState[key];return '<div class="habit-row"><div class="hchk '+(done?'done':'')+'" onclick="toggleHabit('+currentDay+','+hi+')">'+(done?'✓':'')+'</div><span style="font-size:.85rem">'+h.icon+'</span><span class="hlbl" style="'+(done?'text-decoration:line-through;color:var(--text3)':'')+'">'+h.label+'</span></div>';}).join('');
  const doneC=HABITS.filter((_,hi)=>habitState[currentDay+'-'+hi]).length;
  const pct=Math.round(doneC/HABITS.length*100);
  habitsEl.innerHTML=rows+'<div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:.68rem;color:var(--text3);margin-bottom:4px"><span>پیشرفت</span><span style="color:var(--green)">'+doneC+'/'+HABITS.length+' — '+pct+'%</span></div><div class="prog-bar-t"><div class="prog-fill" style="width:'+pct+'%;background:var(--green)"></div></div></div>';

  const dow=DAYS.map((d2,i)=>{const isToday=i===todayIdx;const isDone=dayDoneState[i];let cls=d2.type==='train'?'train':d2.type==='cardio'?'cardio':'rest';if(isDone)cls='done-day';const todayCls=isToday&&!isDone?' today':'';return '<div class="wd-cal"><div class="wdl">'+d2.de+'</div><div class="wdd '+cls+todayCls+'" onclick="toggleDayDone('+i+')">'+(isDone?'✓':d2.icon)+'</div><div class="wdt">'+d2.gym.substring(0,6)+'</div></div>';}).join('');
  const doneDays=Object.values(dayDoneState).filter(Boolean).length;
  document.getElementById('weekBody').innerHTML='<div class="week-cal">'+dow+'</div><div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:.68rem;color:var(--text3);margin-bottom:4px"><span>روزهای انجام‌شده</span><span style="color:var(--green)">'+doneDays+'/7</span></div><div class="prog-bar-t"><div class="prog-fill" style="width:'+doneDays/7*100+'%;background:var(--green)"></div></div></div>';
}

const EX={
  push:[{n:'پرس سینه هالتر',s:'4×6–8',note:'Bench Press — مفصل آرنج ۹۰°'},{n:'پرس بالاسینه دمبل',s:'3×8–10',note:'Incline DB Press'},{n:'پرس سرشانه هالتر',s:'3×8–10',note:'Overhead Press — کمر صاف'},{n:'فلای کابل',s:'3×12–15',note:'Cable Fly — انقباض آخر'},{n:'پشت‌بازو سیمکش',s:'3×12–15',note:'Tricep Pushdown'},{n:'پشت‌بازو دیپ',s:'3×15',note:'Dips — وزن بدن یا وزنه‌دار'}],
  pull:[{n:'ددلیفت',s:'4×5–6',note:'Deadlift — کمر صاف، نگاه جلو'},{n:'بارفیکس',s:'4×6–8',note:'Pull-up / Weighted'},{n:'زیربغل هالتر',s:'3×8–10',note:'Barbell Row — تنه ۴۵°'},{n:'زیربغل سیمکش',s:'3×10–12',note:'Cable Row — کشیدن به ناف'},{n:'جلوبازو هالتر',s:'3×10–12',note:'Barbell Curl'},{n:'جلوبازو چکشی',s:'3×12–15',note:'Hammer Curl'},{n:'فیس‌پول',s:'3×15',note:'Face Pull — سلامت شانه'}],
  legs:[{n:'اسکوات هالتر',s:'4×6–8',note:'Back Squat — عمق زیر موازی'},{n:'ددلیفت رومانیایی',s:'3×8–10',note:'Romanian DL — کشش همسترینگ'},{n:'لانگز دمبل',s:'3×10هر پا',note:'DB Lunges — زانو رو جلو نره'},{n:'پرس پا',s:'3×10–12',note:'Leg Press — پای پهن'},{n:'جلوران',s:'3×12–15',note:'Leg Extension'},{n:'پشت‌ران',s:'3×12–15',note:'Leg Curl'},{n:'ساق پا ایستاده',s:'4×15–20',note:'Calf Raise'}],
  upper:[{n:'پرس سینه هالتر',s:'4×6–8',note:'Bench Press'},{n:'زیربغل هالتر',s:'4×6–8',note:'Barbell Row'},{n:'پرس سرشانه',s:'3×8–10',note:'Overhead Press'},{n:'بارفیکس',s:'3×8–10',note:'Pull-up'},{n:'جلوبازو هالتر',s:'3×10–12',note:'Barbell Curl'},{n:'پشت‌بازو سیمکش',s:'3×12',note:'Tricep Pushdown'},{n:'فیس‌پول',s:'3×15',note:'Face Pull'}],
  lower:[{n:'اسکوات هالتر',s:'4×6–8',note:'Back Squat'},{n:'ددلیفت رومانیایی',s:'3×8–10',note:'Romanian DL'},{n:'لانگز هالتر',s:'3×10هر پا',note:'Barbell Lunges'},{n:'پرس پا',s:'3×10–12',note:'Leg Press'},{n:'جلوران',s:'3×12–15',note:'Leg Extension'},{n:'پشت‌ران',s:'3×12–15',note:'Leg Curl'},{n:'ساق پا',s:'4×15–20',note:'Calf Raise'}],
  fullbody:[{n:'اسکوات هالتر',s:'4×6–8',note:'Squat'},{n:'ددلیفت یا RDL',s:'3×6–8',note:'Deadlift variant'},{n:'پرس سینه یا سرشانه',s:'3×8–10',note:'Push pattern'},{n:'بارفیکس یا زیربغل',s:'3×8–10',note:'Pull pattern'},{n:'لانگز',s:'3×10هر پا',note:'Lunges'},{n:'پلانک',s:'3×60ث',note:'Core stability'}],
  chest:[{n:'پرس سینه هالتر',s:'4×6–8',note:'Bench Press'},{n:'پرس بالاسینه دمبل',s:'3×8–10',note:'Incline DB'},{n:'فلای کابل',s:'3×10–12',note:'Cable Fly'},{n:'پرس پایین‌سینه',s:'3×10–12',note:'Decline Press'},{n:'پشت‌بازو سیمکش',s:'3×12–15',note:'Pushdown'},{n:'پشت‌بازو دیپ',s:'3×15',note:'Dips'}],
  back:[{n:'ددلیفت',s:'4×5–6',note:'Deadlift'},{n:'بارفیکس',s:'4×6–8',note:'Pull-up'},{n:'زیربغل هالتر',s:'3×8–10',note:'Barbell Row'},{n:'زیربغل دمبل',s:'3×10–12',note:'DB Row'},{n:'جلوبازو هالتر',s:'3×10–12',note:'Barbell Curl'},{n:'جلوبازو چکشی',s:'3×12–15',note:'Hammer Curl'},{n:'فیس‌پول',s:'3×15',note:'Face Pull'}],
  shoulders:[{n:'پرس سرشانه هالتر',s:'4×6–8',note:'OHP — ملکه تمرینات'},{n:'نشر از جانب',s:'3×12–15',note:'Lateral Raise'},{n:'نشر از جلو',s:'3×12–15',note:'Front Raise'},{n:'پشت‌دلتوئید',s:'3×12–15',note:'Rear Delt Fly'},{n:'فیس‌پول',s:'3×15',note:'Face Pull'},{n:'شراگ',s:'3×12',note:'Shrug'}],
  arms:[{n:'جلوبازو هالتر',s:'4×8–10',note:'Barbell Curl'},{n:'جلوبازو چکشی',s:'3×10–12',note:'Hammer Curl'},{n:'جلوبازو کابل',s:'3×12–15',note:'Cable Curl'},{n:'پشت‌بازو فرانسوی',s:'3×10–12',note:'Skull Crusher'},{n:'پشت‌بازو سیمکش',s:'3×12–15',note:'Pushdown'},{n:'پشت‌بازو دیپ',s:'3×12',note:'Dips'}],
  hiit:[{n:'باکس جامپ',s:'4×10',note:'Box Jump — فرود نرم'},{n:'بورپی',s:'3×15',note:'Burpee'},{n:'کوه‌نورد',s:'3×30ث',note:'Mountain Climber'},{n:'اسکوات جهشی',s:'3×15',note:'Jump Squat'},{n:'پلانک',s:'3×60ث',note:'Core'},{n:'دراز نشست',s:'3×20',note:'Sit-up'},{n:'ماوتین کلایمبر',s:'3×30ث',note:'Oblique Crunch'}],
  active:[{n:'پیاده‌روی',s:'۳۰–۴۵ دقیقه',note:'سرعت متوسط'},{n:'کشش کل بدن',s:'۱۰ دقیقه',note:'Stretching'},{n:'فوم رولینگ',s:'۵ دقیقه',note:'بازیابی عضله'},{n:'تنفس عمیق',s:'۵ دقیقه',note:'Breathing'}]
};
function getExList(day){
  const g=day.gym.toLowerCase();
  if(day.type==='rest')return null;
  if(day.type==='cardio'||g.includes('hiit')||g.includes('کاردیو'))return EX.hiit;
  if(g.includes('active')||g.includes('اکتیو'))return EX.active;
  // Compound days — combine two lists (top 3 from each)
  const hasPa=(g.includes('پا'));
  const hasShaneh=(g.includes('شانه')||g.includes('سرشانه')||g.includes('shoulder'));
  const hasSineh=(g.includes('سینه')||g.includes('chest'));
  const hasPosht=(g.includes('پشت')||g.includes('back'));
  const hasBazu=(g.includes('بازو')||g.includes('arm'));
  if(hasPa&&hasShaneh)return [...EX.legs.slice(0,4),...EX.shoulders.slice(0,3)];
  if(hasSineh&&hasBazu)return [...EX.chest.slice(0,4),...EX.arms.slice(0,3)];
  if(hasPosht&&hasBazu)return [...EX.back.slice(0,4),...EX.arms.slice(0,3)];
  // Single group
  if(g.includes('push')||g.includes('پوش'))return EX.push;
  if(g.includes('pull')||g.includes('پول'))return EX.pull;
  if(hasPa)return EX.legs;
  if(g.includes('upper')||g.includes('بالاتنه'))return EX.upper;
  if(g.includes('lower')||g.includes('پایین‌تنه'))return EX.lower;
  if(g.includes('full')||g.includes('کل بدن'))return EX.fullbody;
  if(hasSineh)return EX.chest;
  if(hasPosht)return EX.back;
  if(hasShaneh)return EX.shoulders;
  if(hasBazu)return EX.arms;
  return EX.fullbody;
}
function renderWorkout(){
  const day=DAYS[currentDay];
  const el=document.getElementById('workoutContent');
  if(day.type==='rest'){
    el.innerHTML='<div style="text-align:center;padding:32px 16px"><div style="font-size:2.5rem;margin-bottom:12px">😴</div><h3 style="color:var(--purple);margin-bottom:8px">روز استراحت</h3><p style="font-size:.78rem;color:var(--text3);line-height:1.7">عضله در زمان استراحت می‌سازه.<br>یه پیاده‌روی سبک + کشش کافیه.</p></div>';
    return;
  }
  const exList=getExList(day);
  const isCardio=day.type==='cardio';
  const warmup=isCardio?'🔥 <strong>گرم‌کردن ۵ دقیقه:</strong> تردمیل آرام → حرکات موبیلیتی':'🔥 <strong>گرم‌کردن ۸–۱۰ دقیقه:</strong> تردمیل → حرکات پویا → ستون موبیلیتی';
  el.innerHTML=
    '<div style="background:var(--blue-d);border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:.76rem;color:#93c5fd;line-height:1.7">'+warmup+'</div>'+
    '<div style="background:var(--bg1);border-radius:14px;border:1px solid var(--border);overflow:hidden;margin-bottom:10px">'+
      '<div style="padding:10px 14px 6px;display:flex;justify-content:space-between;align-items:center">'+
        '<span style="font-size:.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em">📋 '+day.gym+'</span>'+
        '<span style="font-size:.65rem;color:var(--text3)">${d.gymTime} · ${d.gymDur}دق</span>'+
      '</div>'+
      '<div style="padding:0 14px 12px">'+
        exList.map((e,i)=>
          '<div class="ex-row">'+
            '<span class="ex-num">'+(i+1)+'</span>'+
            '<div style="flex:1"><span class="ex-name">'+e.n+'</span>'+(e.note?'<div style="font-size:.62rem;color:var(--text3);margin-top:1px">'+e.note+'</div>':'')+'</div>'+
            '<span class="ex-sets">'+e.s+'</span>'+
          '</div>'
        ).join('')+
      '</div>'+
    '</div>'+
    '<div class="info-box">💡 Progressive Overload: هر هفته ۲.۵–۵kg بیشتر یا ۱–۲ تکرار افزایش بده</div>'+
    '<div class="info-box" style="background:#1c2a1c;border-color:#2d5a2d;color:#86efac;margin-top:6px">🧘 <strong>سرد کردن ۵ دقیقه:</strong> کشش ایستا گروه‌های عضلانی تمرین‌شده</div>';
}

function renderNutrition(){
  const day=DAYS[currentDay];
  const isRest=day.type==='rest';
  const trainCal=${d.cal.trainCal};
  const restCal=${d.cal.restCal};
  const protein=${d.cal.protein};
  const todayCal=isRest?restCal:trainCal;
  const meals=[
    {time:'${d.breakfastTime}',icon:'🍳',name:'صبحانه',items:['پروتئین بالا (تخم‌مرغ، ماست یونانی)','کربو پیچیده (جو دوسر، نان سبوس)','میوه تازه'],kcal:Math.round(todayCal*0.24)},
    {time:'10:30',icon:'🥜',name:'میان‌وعده',items:['پروتئین (پنیر، آجیل)','میوه فصل'],kcal:Math.round(todayCal*0.11)},
    {time:'12:30',icon:'🥗',name:'ناهار',items:['پروتئین اصلی (مرغ، ماهی، گوشت)','کربو (برنج قهوه‌ای، سیب‌زمینی)','سبزیجات بخارپز'],kcal:Math.round(todayCal*0.28)},
    {time:'15:30',icon:'🍎',name:'میان‌وعده ۲',items:['ماست + میوه + آجیل'],kcal:Math.round(todayCal*0.10)},
    {time:'${d.dinnerTime}',icon:'🍽',name:'شام',items:['ماهی یا مرغ','سبزیجات + سالاد','کربو کمتر (روز استراحت)'],kcal:Math.round(todayCal*0.20)},
    {time:'21:30',icon:'🌙',name:'وعده قبل خواب',items:['پروتئین آهسته‌هضم (Quark، ماست)','اختیاری: کمی عسل'],kcal:Math.round(todayCal*0.07)},
  ];
  document.getElementById('nutritionContent').innerHTML=meals.map(m=>'<div class="meal-card"><div class="mhbar"><span class="mtime">'+m.time+'</span><span class="micon">'+m.icon+'</span><span class="mname">'+m.name+'</span><span class="mkcal">~'+m.kcal+' kcal</span></div><div class="mbody">'+m.items.map(i=>'<div class="mi"><span>'+i+'</span></div>').join('')+'</div></div>').join('');
}

function showPage(name,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  btn.classList.add('active');
  document.getElementById('contentArea').scrollTop=0;
  if(name==='workout')renderWorkout();
  if(name==='nutrition')renderNutrition();
}

function toggleHabit(d,h){const k=d+'-'+h;habitState[k]=!habitState[k];renderDash()}
function toggleDayDone(i){dayDoneState[i]=!dayDoneState[i];renderDash()}
function renderAll(){renderHeader();renderDash()}
renderAll();
<\/script>
</body>
</html>`;
}

function restart() {
  currentStep = 1;
  try { localStorage.removeItem(LS_KEY); } catch(e) {}
  document.getElementById('successScreen').style.display = 'none';
  document.getElementById('formWrap').style.display = '';
  document.getElementById('btnRow').style.display = '';
  document.querySelector('.progress-wrap').style.display = '';
  habits = [...DEFAULT_HABITS];
  showStep(1);
}

// ══════════════════════════════════════════════
//  PUSH NOTIFICATIONS
// ══════════════════════════════════════════════
const NOTIF_KEY = 'saman_notif'; // { enabled, hour, minute }

function initNotifications() {
  const saved = _getNotifPref();
  if (saved.enabled) {
    const toggle = document.getElementById('notifToggle');
    const timeEl = document.getElementById('notifTime');
    const timeRow = document.getElementById('notifTimeRow');
    if (toggle) toggle.checked = true;
    if (timeEl) timeEl.value = _pad(saved.hour) + ':' + _pad(saved.minute);
    if (timeRow) timeRow.style.display = 'flex';
    _setNotifStatus('ok', '✅ یادآور فعاله — ' + _pad(saved.hour) + ':' + _pad(saved.minute));
  }
}

function onNotifToggle(checked) {
  const timeRow = document.getElementById('notifTimeRow');
  if (timeRow) timeRow.style.display = checked ? 'flex' : 'none';

  if (!checked) {
    _saveNotifPref({ enabled: false, hour: 7, minute: 0 });
    _setNotifStatus('', '');
    return;
  }

  // Darkhast ejaze
  if (!('Notification' in window)) {
    _setNotifStatus('err', '⚠️ مرورگرت از نوتیفیکیشن پشتیبانی نمیکنه');
    document.getElementById('notifToggle').checked = false;
    if (timeRow) timeRow.style.display = 'none';
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission !== 'granted') {
      _setNotifStatus('err', '❌ اجازه نوتیفیکیشن داده نشد — تو تنظیمات مرورگرت فعالش کن');
      document.getElementById('notifToggle').checked = false;
      if (timeRow) timeRow.style.display = 'none';
      return;
    }
    // Ejaze OK — schedule kun
    const timeEl = document.getElementById('notifTime');
    const [h, m] = timeEl ? timeEl.value.split(':').map(Number) : [7, 0];
    _scheduleViaSW(h, m);
    _saveNotifPref({ enabled: true, hour: h, minute: m });
    _setNotifStatus('ok', '✅ یادآور تنظیم شد — ' + _pad(h) + ':' + _pad(m));
  });
}

function onNotifTimeChange() {
  const saved = _getNotifPref();
  if (!saved.enabled) return;
  const timeEl = document.getElementById('notifTime');
  if (!timeEl) return;
  const [h, m] = timeEl.value.split(':').map(Number);
  _scheduleViaSW(h, m);
  _saveNotifPref({ enabled: true, hour: h, minute: m });
  _setNotifStatus('ok', '✅ یادآور آپدیت شد — ' + _pad(h) + ':' + _pad(m));
}

function _scheduleViaSW(hour, minute) {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage({
    type: 'SCHEDULE_NOTIFICATION',
    hour,
    minute,
    message: 'وقت روتین روزانه‌ته! 💪'
  });
}

function _saveNotifPref(pref) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(pref)); } catch(e) {}
}

function _getNotifPref() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : { enabled: false, hour: 7, minute: 0 };
  } catch(e) { return { enabled: false, hour: 7, minute: 0 }; }
}

function _setNotifStatus(type, msg) {
  const el = document.getElementById('notifStatus');
  if (!el) return;
  el.textContent = msg;
  el.className = 'notif-status' + (type ? ' ' + type : '');
}

function _pad(n) { return String(n).padStart(2, '0'); }

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
function init() {
  // Paywall — avalin chiz
  initPaywall();

  // Single-select chips
  ['chips_lang','chips_haswork','chips_sideproject','chips_activity','chips_cardio','chips_diet','chips_meals'].forEach(id => initChips(id, false));
  // Multi-select chips
  ['chips_workdays','chips_heavydays'].forEach(id => initChips(id, true));
  // Option cards
  ['opt_goal','opt_gym','opt_split'].forEach(id => initOptionCards(id));

  // Range
  document.getElementById('f_days_per_week')?.addEventListener('input', e => updateDPW(e.target.value));

  // Auto-save روی همه input/select fieldha
  ['f_name','f_gender','f_age','f_height','f_weight','f_city',
   'f_work_start','f_work_end','f_side_start','f_side_end','f_side_name',
   'f_gym_time','f_gym_dur','f_days_per_week','f_wake','f_sleep','f_sleep_hours',
   'f_breakfast_time','f_dinner_time','f_avoid'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', debouncedSave);
  });

  // Notifications — baad az restore state
  initNotifications();

  // ── Profile auto-load ──
  // Agar ?edit=true nabashad va profile kamel dare → dashbord ro direct show bede
  const params = new URLSearchParams(window.location.search);
  const isEditMode = params.get('edit') === 'true';

  const hasProfile = restoreState();

  // Edit mode → URL ro pak kon
  if (isEditMode) {
    window.history.replaceState({}, '', window.location.pathname);
  }

  showStep(currentStep);

  if (hasProfile && !isEditMode) {
    // Profile dare → dashbord (iframe) ro show bede
    generateHub();
  }
}

init();
