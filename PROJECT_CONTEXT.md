# 🏋️ Routine Hub — Project Context
> این فایل برای شروع سریع یک Cowork session جدید طراحی شده.
> آن را اول از همه به Claude نشان بده.

---

## 👤 درباره من (Amin)

- **سن/اطلاعات بدنی:** ایرانی، مقیم آلمان، ۱۹۰cm / ۸۳kg
- **برنامه روزانه:** کار ۰۸:۰۰–۱۶:۰۰ | باشگاه ۰۶:۰۰ | پروژه ۱۶:۳۰–۱۸:۳۰
- **هدف:** ساختن یک اپ fitness فارسی برای جامعه diaspora ایرانی در اروپا و آمریکا
- **زبان اصلی پروژه:** فارسی (برای کاربران diaspora) | انگلیسی (برای سرمایه‌گذاران)
- **ایمیل:** aminghabel@gmail.com

---

## 🗂️ فایل‌های این پروژه

| فایل | توضیح | اهمیت |
|------|-------|--------|
| `routine_builder.html` | **اپ اصلی** — ویزارد ۷ مرحله‌ای ساخت روتین شخصی | ⭐⭐⭐ بحرانی |
| `routine_hub.html` | نمونه خروجی routine_builder برای کاربر فرضی | ⭐⭐ مرجع |
| `virtual_advisors.html` | ابزار مشاور مجازی — ۵ mentor با prompt حرفه‌ای | ⭐⭐⭐ مهم |
| `roadmap_90day.html` | نقشه راه ۹۰ روزه interactive با checklist | ⭐⭐⭐ مهم |
| `daily_dashboard.html` | داشبورد روزانه شخصی Amin | ⭐⭐ مرجع |
| `meal_plan_190_83kg.html` | برنامه تغذیه برای ۱۹۰cm/۸۳kg | ⭐⭐ مرجع |
| `workout_plan.html` | برنامه تمرین پایه | ⭐ مرجع |
| `مشورت با بزرگان.docx` | پاسخ ۵ مشاور مجازی به سوالات استراتژیک | ⭐⭐⭐ مهم |

---

## 🏗️ معماری فنی routine_builder.html

### ساختار کلی
- **Single-file HTML** — بدون dependency خارجی
- **Dark theme** — رنگ اصلی `#080b12`
- **RTL Persian** — `dir="rtl"` در سطح html
- **localStorage** — برای ذخیره روتین‌های ساخته‌شده (باید اضافه شود)

### اشیاء اصلی JavaScript

```javascript
// اطلاعات پایه ورزش‌ها
const EX = {
  push: [{fa:'پرس سینه', sets:4, reps:'8-10', note:'Bench Press'}, ...],
  pull: [...],
  legs: [...],
  shoulders: [...],
  // + chest, back, arms, upper, lower, fullbody, hiit, active
}

// برنامه splits هفتگی
const SPLITS = {
  'PPL': { 3: [...7 روز...], 4: [...], 5: [...], 6: [...] },
  'Upper/Lower': { ... },
  'Full Body': { ... },
  'Bro Split': { ... },
  'Push/Pull': { ... }
}

// تابع lookup تمرین
function getExList(label) {
  // handle compound days like 'پا+شانه' → legs[:4] + shoulders[:3]
}
```

### فرمت روز در SPLITS
```javascript
{ t: 'train'|'rest'|'cardio', i: '💪', l: 'Push\nسینه+سه‌سر' }
```

### باگ‌های Fix شده (مهم برای نگهداری)
1. **Newline در JS string:** برچسب روزها `\n` دارند — در تولید کد JS باید `.replace(/\n/g,' ')` شود
2. **Compound day:** اگر label شامل `+` بود (مثل `پا+شانه`) باید هر دو عضله را ترکیب کند
3. **Rest day در SPLITS PPL 4-day:** روز شنبه باید `t:'train'` باشد نه `t:'rest'`

---

## 🎯 استراتژی کسب‌وکار

### بازار هدف
- **Persian diaspora:** ۴-۸ میلیون فارسی‌زبان در اروپا و آمریکا
- **درآمد اروپایی/آمریکایی** → پرداخت با Stripe ممکن (برخلاف ایران داخلی)
- **هیچ اپ باکیفیت فارسی** در این حوزه وجود ندارد

### مدل درآمدی
- **قیمت:** €5/ماه یا €40/سال (A/B test بین €5 و €8)
- **هدف ماه ۱:** ۱۰ کاربر پولی = €50 MRR
- **هدف ماه ۳:** ۱۰۰ کاربر پولی = €500 MRR

### اولویت‌بندی زبان
1. **فارسی** — محصول و مارکتینگ برای diaspora
2. **انگلیسی** — پیچ به سرمایه‌گذار، Product Hunt، Reddit
3. **آلمانی** — آخرین اولویت (فقط اگر localization آلمان هدف شد)

### برای پیچ به سرمایه‌گذار آلمانی
> "4-8 million Persian-speaking professionals in Europe and North America. European salaries, European payment cards, zero quality wellness apps in their language. I'm one of them — I built this for myself, in Germany."

---

## 🧠 هیئت مشاوران مجازی

تمام پرامپت‌ها در `virtual_advisors.html` موجودند. خلاصه فریم‌ورک هر کدام:

| مشاور | فریم‌ورک | توصیه کلیدی |
|-------|---------|------------|
| **Pieter Levels** | Ship → Tweet → Charge → Iterate | ماه ۱: فقط ship کن و پول بگیر |
| **Will Ahmed** | Strain→Recovery→Performance | اول retention را fix کن |
| **Ali Parsa** | Mission→Partnerships→Scale | سال ۲: با کلینیک‌ها و بیمه‌ها مذاکره کن |
| **Andy Puddicombe** | Cue→Routine→Reward | habit loop را در UX بساز |
| **Omid Kordestani** | Distribution Map → Warm Intro | با اعداد واقعی پیش investor برو |

### پاسخ‌های کامل مشاوران
فایل `مشورت با بزرگان.docx` شامل پاسخ کامل همه ۵ مشاور به سوالات استراتژیک است.

---

## 🗺️ نقشه راه ۹۰ روزه

| ماه | فاز | North Star |
|-----|-----|-----------|
| ماه ۱ | **Ship Fast** — Pieter Levels | ۱۰ کاربر پولی / €50 MRR |
| ماه ۲ | **Retain & Grow** — Lenny Rachitsky | ۵۰ کاربر / %40 Day-7 Retention |
| ماه ۳ | **Scale & Pitch** — Omid Kordestani | ۱۰۰ کاربر / €500 MRR / ۳ investor call |

جزئیات کامل در `roadmap_90day.html` با interactive checklist.

---

## 📋 کارهای باقی‌مانده (Next Steps)

### فوری (قبل از launch):
- [ ] اضافه کردن **localStorage** به routine_builder — روتین‌ها پس از reload باقی بمانند
- [ ] **PWA manifest + service worker** — installable روی موبایل
- [ ] تست کامل روی iOS Safari و Android Chrome

### ماه اول:
- [ ] **Stripe paywall** — بعد از ۷ روز trial
- [ ] **لندینگ پیج** ساده یک صفحه‌ای
- [ ] **Push notification** روزانه (PWA)

### زیرساخت:
- [ ] Analytics ساده (Plausible یا Fathom — privacy-first)
- [ ] Error logging (Sentry رایگان)
- [ ] Email collection (Resend یا ConvertKit)

---

## 🔧 نکات فنی مهم برای Claude جدید

1. **هیچ‌وقت** `\n` مستقیم داخل string تک‌کوت JavaScript نگذار
2. فایل‌های HTML همه **single-file** هستند — بدون CSS/JS جداگانه
3. رنگ اصلی: `#080b12` (پس‌زمینه) | `#0f1420` (کارت) | `#3b82f6` (accent)
4. فونت: `'Segoe UI', Tahoma, sans-serif` — بدون Google Fonts
5. همه متون فارسی با `dir="rtl"` و `text-align: right`
6. تمام اعداد با locale فارسی: `toLocaleString('fa-IR')`

---

## 💬 نحوه شروع Cowork جدید

بگو به Claude:
> "این فایل PROJECT_CONTEXT.md را بخوان. می‌خواهم روی Routine Hub کار کنیم. [توضیح کار امروز]"

---

*آخرین به‌روزرسانی: ۲۲ مه ۲۰۲۶ · Cowork Session ۲*
