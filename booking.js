/* ============================================================
   Gathrika Skin Clinic — booking.js
   Multi-step appointment REQUEST widget (brief section 7).
   There is no backend yet: submissions are stored in the
   browser's localStorage as booking REQUESTS, and the clinic
   confirms each appointment personally on WhatsApp.
   Steps: Service → Date → Time slot → Details + consent →
   Confirmation. Includes reschedule / cancel by reference code.
   ============================================================ */

const BOOKING_CONFIG = {
  slotCapacity: 2,       // max requests held per slot (brief: capacity 1–2)
  windowDays: 30,        // book up to 30 days ahead
  minNoticeMinutes: 60,  // same-day slots at least 1 hour ahead
  sessions: [            // Mon–Sat only; Sunday closed
    { label: "Morning session", start: "11:00", end: "13:00" },
    { label: "Evening session", start: "17:00", end: "20:00" }
  ],
  slotMinutes: 15,
  storageKey: "gathrika_bookings"
};

/* ---------- storage ---------- */
function loadBookings() {
  try { return JSON.parse(localStorage.getItem(BOOKING_CONFIG.storageKey)) || []; }
  catch (e) { return []; }
}
function saveBookings(list) {
  localStorage.setItem(BOOKING_CONFIG.storageKey, JSON.stringify(list));
}
function slotTakenCount(dateISO, timeVal) {
  return loadBookings().filter(b =>
    b.date === dateISO && b.timeVal === timeVal &&
    (b.status === "Requested" || b.status === "Confirmed")).length;
}

/* ---------- date helpers (local time) ---------- */
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function toISO(d) {
  const p = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}
function fromISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function prettyDate(iso) {
  const d = fromISO(iso);
  return DAY_NAMES[d.getDay()] + ", " + d.getDate() + " " + MONTH_NAMES[d.getMonth()] + " " + d.getFullYear();
}
function bookableDates() {
  const out = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < BOOKING_CONFIG.windowDays && out.length < BOOKING_CONFIG.windowDays; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    if (d.getDay() === 0) continue; // Sunday closed
    out.push(toISO(d));
  }
  return out;
}
function to12h(hhmm) {
  let [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 === 0 ? 12 : h % 12;
  return h + ":" + String(m).padStart(2, "0") + " " + ap;
}
function slotsForDate(iso) {
  const slots = [];
  const isToday = iso === toISO(new Date());
  const now = new Date();
  const earliest = new Date(now.getTime() + BOOKING_CONFIG.minNoticeMinutes * 60000);
  BOOKING_CONFIG.sessions.forEach(sess => {
    const [sh, sm] = sess.start.split(":").map(Number);
    const [eh, em] = sess.end.split(":").map(Number);
    const cursor = new Date(fromISO(iso)); cursor.setHours(sh, sm, 0, 0);
    const end = new Date(fromISO(iso)); end.setHours(eh, em, 0, 0);
    const list = [];
    while (cursor < end) {
      const val = String(cursor.getHours()).padStart(2, "0") + ":" + String(cursor.getMinutes()).padStart(2, "0");
      const full = slotTakenCount(iso, val) >= BOOKING_CONFIG.slotCapacity;
      const tooSoon = isToday && cursor < earliest;
      list.push({ val, label: to12h(val), disabled: full || tooSoon, full });
      cursor.setMinutes(cursor.getMinutes() + BOOKING_CONFIG.slotMinutes);
    }
    slots.push({ label: sess.label, list });
  });
  return slots;
}

/* ---------- wizard state ---------- */
const wiz = {
  step: 1,
  service: null,     // slug
  date: null,        // ISO
  timeVal: null,     // "11:00"
  timeLabel: null,   // "11:00 AM"
  editingRef: null   // set when rescheduling an existing booking
};

const STEP_LABELS = ["Service", "Date", "Time", "Details", "Done"];

function refCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return "GATH-" + code;
}

function renderWizard() {
  const app = document.getElementById("bkApp");
  const indicator = STEP_LABELS.map((label, i) => {
    const n = i + 1;
    const cls = wiz.step === n ? "active" : (wiz.step > n ? "done" : "");
    return `<div class="step-dot ${cls}">${n}. ${label}</div>`;
  }).join("");
  app.innerHTML = `<div class="steps-indicator" role="list" aria-label="Booking progress">${indicator}</div>
    <div class="bk-panel" id="bkPanel"></div>`;
  const panel = document.getElementById("bkPanel");
  if (wiz.step === 1) renderStepService(panel);
  if (wiz.step === 2) renderStepDate(panel);
  if (wiz.step === 3) renderStepSlots(panel);
  if (wiz.step === 4) renderStepDetails(panel);
  if (wiz.step === 5) renderStepConfirm(panel);
  /* Scroll the panel into view on step changes only — not on first load */
  if (wiz._navigated) window.scrollTo({ top: app.offsetTop - 80, behavior: "smooth" });
}

function navRow(panel, opts) {
  const back = opts.back ? `<button class="btn btn-outline" type="button" id="bkBack">Back</button>` : "";
  const nextLabel = opts.nextLabel || "Continue";
  panel.insertAdjacentHTML("beforeend",
    `<div class="bk-nav">${back}<span class="spacer"></span>
     <button class="btn btn-primary" type="button" id="bkNext" ${opts.nextDisabled ? "disabled" : ""}>${nextLabel}</button></div>`);
  if (opts.back) document.getElementById("bkBack").addEventListener("click", () => { wiz._navigated = true; opts.back(); });
  if (opts.onNext) document.getElementById("bkNext").addEventListener("click", () => { wiz._navigated = true; opts.onNext(); });
}

/* ----- Step 1: service ----- */
function renderStepService(panel) {
  const services = bookableServices();
  panel.innerHTML = `<h2>What would you like to book?</h2>
    <p class="muted">Choose a service. Every first visit includes time with ${CLINIC.doctor} — procedures are planned after assessment.</p>
    <div class="option-list" role="listbox" aria-label="Services">
      ${services.map(s => `
        <button type="button" class="option-btn ${wiz.service === s.slug ? "selected" : ""}" data-slug="${s.slug}" role="option" aria-selected="${wiz.service === s.slug}">
          ${s.name}<small>${s.sessions} · ${s.priceDisplay === "Rs 300" ? "Rs 300 consultation" : "Fee confirmed at clinic"} · ${s.durationMin} min</small>
        </button>`).join("")}
    </div>
    <p class="small muted" style="margin-top:14px">Looking for a service marked “On consultation”? Start with a
    <a href="treatments.html">Dermatology Consultation</a> — the doctor will plan it with you.</p>`;
  panel.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      wiz.service = btn.dataset.slug;
      panel.querySelectorAll(".option-btn").forEach(b => b.classList.toggle("selected", b === btn));
      const next = document.getElementById("bkNext");
      if (next) next.disabled = false;
    });
  });
  navRow(panel, {
    nextDisabled: !wiz.service,
    onNext: () => { wiz.step = 2; renderWizard(); }
  });
}

/* ----- Step 2: date ----- */
function renderStepDate(panel) {
  const dates = bookableDates();
  panel.innerHTML = `<h2>Pick a date</h2>
    <p class="muted">The clinic is open Monday to Saturday (Sunday closed). You can book up to 30 days ahead.</p>
    <div class="date-grid" role="listbox" aria-label="Available dates">
      ${dates.map(iso => {
        const d = fromISO(iso);
        const tag = iso === toISO(new Date()) ? "Today" : DAY_NAMES[d.getDay()].slice(0, 3);
        return `<button type="button" class="slot-btn ${wiz.date === iso ? "selected" : ""}" data-date="${iso}" role="option" aria-selected="${wiz.date === iso}">
          <span style="display:block;font-size:.72rem;font-weight:600">${tag}</span>${d.getDate()} ${MONTH_NAMES[d.getMonth()]}</button>`;
      }).join("")}
    </div>`;
  panel.querySelectorAll("[data-date]").forEach(btn => {
    btn.addEventListener("click", () => {
      wiz.date = btn.dataset.date;
      wiz.timeVal = null; wiz.timeLabel = null;
      panel.querySelectorAll("[data-date]").forEach(b => b.classList.toggle("selected", b === btn));
      document.getElementById("bkNext").disabled = false;
    });
  });
  navRow(panel, {
    back: () => { wiz.step = 1; renderWizard(); },
    nextDisabled: !wiz.date,
    onNext: () => { wiz.step = 3; renderWizard(); }
  });
}

/* ----- Step 3: time slot ----- */
function renderStepSlots(panel) {
  const groups = slotsForDate(wiz.date);
  panel.innerHTML = `<h2>Pick a time — ${prettyDate(wiz.date)}</h2>
    <p class="muted">Slots are 15 minutes apart. Same-day slots open at least 1 hour from now. Fully requested slots are greyed out.</p>
    ${groups.map(g => `
      <div class="slot-session">${g.label}</div>
      <div class="slot-grid">
        ${g.list.map(s => `<button type="button" class="slot-btn ${wiz.timeVal === s.val ? "selected" : ""}" data-val="${s.val}" data-label="${s.label}" ${s.disabled ? "disabled title='Slot full or unavailable'" : ""}>${s.label}</button>`).join("")}
      </div>`).join("")}
    <p class="small muted" style="margin-top:12px">Morning 11:00 AM – 1:00 PM · Evening 5:00 PM – 8:00 PM</p>`;
  panel.querySelectorAll("[data-val]").forEach(btn => {
    btn.addEventListener("click", () => {
      wiz.timeVal = btn.dataset.val;
      wiz.timeLabel = btn.dataset.label;
      panel.querySelectorAll("[data-val]").forEach(b => b.classList.toggle("selected", b === btn));
      document.getElementById("bkNext").disabled = false;
    });
  });
  navRow(panel, {
    back: () => { wiz.step = 2; renderWizard(); },
    nextDisabled: !wiz.timeVal,
    onNext: () => { wiz.step = 4; renderWizard(); }
  });
}

/* ----- Step 4: details + consent ----- */
function renderStepDetails(panel) {
  const s = serviceBySlug(wiz.service);
  panel.innerHTML = `<h2>Your details</h2>
    <p class="muted">${s.name} · ${prettyDate(wiz.date)} · ${wiz.timeLabel}</p>
    <form id="bkForm" novalidate>
      <div class="field" id="f-name">
        <label for="bkName">Full name *</label>
        <input id="bkName" name="name" type="text" autocomplete="name" placeholder="e.g. Priya Sharma">
        <div class="error">Please enter your full name.</div>
      </div>
      <div class="field" id="f-mobile">
        <label for="bkMobile">Mobile number (WhatsApp) *</label>
        <input id="bkMobile" name="mobile" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91 ">
        <div class="hint">The clinic confirms your appointment on this number.</div>
        <div class="error">Please enter a valid 10-digit Indian mobile number.</div>
      </div>
      <div class="field" id="f-age">
        <label for="bkAge">Age *</label>
        <input id="bkAge" name="age" type="number" min="1" max="100" inputmode="numeric" placeholder="e.g. 28">
        <div class="error">Please enter the patient's age (1–100).</div>
      </div>
      <div class="field" id="f-gender">
        <label>Gender *</label>
        <div class="radio-row" role="radiogroup" aria-label="Gender">
          ${["Female", "Male", "Other", "Prefer not to say"].map(g =>
            `<label class="radio-pill"><input type="radio" name="gender" value="${g}">${g}</label>`).join("")}
        </div>
        <div class="error">Please choose an option.</div>
      </div>
      <div class="field">
        <label>Is this your first visit to our clinic?</label>
        <div class="radio-row" role="radiogroup" aria-label="New or returning patient">
          <label class="radio-pill"><input type="radio" name="visitType" value="New patient" checked>New patient</label>
          <label class="radio-pill"><input type="radio" name="visitType" value="Returning patient">Returning patient</label>
        </div>
      </div>
      <div class="field">
        <label for="bkConcern">What is the concern? <span class="muted">(optional, brief)</span></label>
        <textarea id="bkConcern" name="concern" placeholder="e.g. Acne on cheeks for 3 months"></textarea>
        <div class="hint">Please do not attach reports or photos here — bring them to your visit.</div>
      </div>
      <div class="check-field" id="f-consentPrivacy">
        <input type="checkbox" id="bkConsentPrivacy">
        <label for="bkConsentPrivacy">I agree to the <a href="privacy.html" target="_blank" rel="noopener">privacy policy</a> and to the clinic storing these details to arrange my appointment. *</label>
      </div>
      <div class="check-field" id="f-consentComm">
        <input type="checkbox" id="bkConsentComm">
        <label for="bkConsentComm">I agree to receive appointment confirmation and reminders from the clinic on WhatsApp / SMS. *</label>
      </div>
      <div class="error" id="consentError" style="display:none;color:var(--danger);font-size:.9rem">Please tick both consent boxes to continue.</div>
    </form>`;
  navRow(panel, {
    back: () => { wiz.step = 3; renderWizard(); },
    nextLabel: wiz.editingRef ? "Save new time" : "Request appointment",
    onNext: () => {
      if (validateDetails()) submitBooking();
    }
  });
}

function markInvalid(id, bad) {
  const f = document.getElementById(id);
  if (f) f.classList.toggle("invalid", bad);
  return !bad;
}
function normaliseMobile(raw) {
  let d = (raw || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}
function validateDetails() {
  const name = document.getElementById("bkName").value.trim();
  const mobile = normaliseMobile(document.getElementById("bkMobile").value);
  const age = parseInt(document.getElementById("bkAge").value, 10);
  const genderEl = document.querySelector('input[name="gender"]:checked');
  let ok = true;
  ok = markInvalid("f-name", name.length < 3) && ok;
  ok = markInvalid("f-mobile", !/^[6-9]\d{9}$/.test(mobile)) && ok;
  ok = markInvalid("f-age", !(age >= 1 && age <= 100)) && ok;
  ok = markInvalid("f-gender", !genderEl) && ok;
  const c1 = document.getElementById("bkConsentPrivacy").checked;
  const c2 = document.getElementById("bkConsentComm").checked;
  document.getElementById("consentError").style.display = (c1 && c2) ? "none" : "block";
  if (!(c1 && c2)) ok = false;
  if (!ok) return false;
  wiz.details = {
    name, mobile: "+91 " + mobile, age,
    gender: genderEl.value,
    visitType: document.querySelector('input[name="visitType"]:checked').value,
    concern: document.getElementById("bkConcern").value.trim()
  };
  return true;
}

function submitBooking() {
  const list = loadBookings();
  const s = serviceBySlug(wiz.service);
  if (wiz.editingRef) {
    const b = list.find(x => x.ref === wiz.editingRef);
    if (b) {
      b.serviceSlug = wiz.service; b.serviceName = s.name;
      b.date = wiz.date; b.timeVal = wiz.timeVal; b.timeLabel = wiz.timeLabel;
      b.name = wiz.details.name; b.mobile = wiz.details.mobile; b.age = wiz.details.age;
      b.gender = wiz.details.gender; b.visitType = wiz.details.visitType; b.concern = wiz.details.concern;
      b.status = "Requested"; b.updatedAt = new Date().toISOString();
      wiz.confirmRef = b.ref; wiz.rescheduled = true;
    }
  } else {
    const booking = {
      ref: refCode(),
      serviceSlug: wiz.service, serviceName: s.name,
      date: wiz.date, timeVal: wiz.timeVal, timeLabel: wiz.timeLabel,
      ...wiz.details,
      status: "Requested",
      createdAt: new Date().toISOString()
    };
    list.push(booking);
    wiz.confirmRef = booking.ref; wiz.rescheduled = false;
  }
  saveBookings(list);
  wiz.step = 5;
  renderWizard();
}

/* ----- Step 5: confirmation ----- */
function renderStepConfirm(panel) {
  const b = loadBookings().find(x => x.ref === wiz.confirmRef);
  if (!b) { panel.innerHTML = "<p>Booking not found.</p>"; return; }
  panel.innerHTML = `
    <div class="confirm-hero">
      <div class="tick" aria-hidden="true">✓</div>
      <h2>${wiz.rescheduled ? "Appointment rescheduled" : "Request received"}</h2>
      <p class="muted">Your booking reference code is</p>
      <div class="ref-code">${b.ref}</div>
      <p class="small muted">Keep this code — you can use it below to reschedule or cancel.</p>
    </div>
    <table class="summary-table">
      <tr><th>Service</th><td>${b.serviceName}</td></tr>
      <tr><th>Date</th><td>${prettyDate(b.date)}</td></tr>
      <tr><th>Time</th><td>${b.timeLabel}</td></tr>
      <tr><th>Patient</th><td>${b.name} (${b.age} yrs)</td></tr>
      <tr><th>Mobile</th><td>${b.mobile}</td></tr>
      <tr><th>Status</th><td>Requested — awaiting clinic confirmation</td></tr>
    </table>
    <div class="notice notice-info">
      <strong>Pay at clinic — consultation Rs ${CLINIC.consultFee}.</strong>
      No payment is taken online. The clinic will confirm your appointment on WhatsApp at ${b.mobile} before your visit. If you do not hear from us, please visit the <a href="contact.html">contact page</a>.
    </div>
    <div class="bk-nav">
      <button class="btn btn-outline" type="button" id="bkIcs">Add to calendar</button>
      <a class="btn btn-outline" href="${mapsDirUrl()}" target="_blank" rel="noopener">Get directions</a>
      ${hasWhatsApp() ? `<a class="btn btn-whatsapp" href="${waHref("Hi, I just requested an appointment at Gathrika Skin Clinic. My reference code is " + b.ref + " — " + b.serviceName + ", " + prettyDate(b.date) + ", " + b.timeLabel + ". Please confirm.")}" target="_blank" rel="noopener">Confirm on WhatsApp</a>` : ""}
      <span class="spacer"></span>
      <a class="btn btn-primary" href="index.html">Done</a>
    </div>`;
  document.getElementById("bkIcs").addEventListener("click", () => downloadICS(b));
}

function downloadICS(b) {
  const s = serviceBySlug(b.serviceSlug);
  const dur = s ? s.durationMin : 20;
  const start = new Date(fromISO(b.date));
  const [h, m] = b.timeVal.split(":").map(Number);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + dur * 60000);
  const fmt = d => {
    const p = n => String(n).padStart(2, "0");
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "T" + p(d.getHours()) + p(d.getMinutes()) + "00";
  };
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Gathrika Skin Clinic//Booking//EN",
    "BEGIN:VEVENT", "UID:" + b.ref + "@gathrikaskinclinic",
    "DTSTART:" + fmt(start), "DTEND:" + fmt(end),
    "SUMMARY:Gathrika Skin Clinic — " + b.serviceName.replace(/,/g, "\\,"),
    "LOCATION:" + CLINIC.addressLines.join(" ").replace(/,/g, "\\,"),
    "DESCRIPTION:Booking ref " + b.ref + ". Pay at clinic — consultation Rs " + CLINIC.consultFee + ".",
    "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url; a.download = "gathrika-appointment-" + b.ref + ".ics";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- manage: reschedule / cancel ---------- */
function initManage() {
  const btn = document.getElementById("mgFind");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const ref = document.getElementById("mgRef").value.trim().toUpperCase();
    const mobile = normaliseMobile(document.getElementById("mgMobile").value);
    const out = document.getElementById("mgResult");
    const list = loadBookings();
    const b = list.find(x => x.ref === ref && normaliseMobile(x.mobile) === mobile);
    if (!b) {
      out.innerHTML = `<div class="notice notice-warn">No booking found with that reference code and mobile number. Please check and try again.</div>`;
      return;
    }
    const cancelled = b.status === "Cancelled";
    out.innerHTML = `
      <table class="summary-table">
        <tr><th>Reference</th><td>${b.ref}</td></tr>
        <tr><th>Service</th><td>${b.serviceName}</td></tr>
        <tr><th>When</th><td>${prettyDate(b.date)} · ${b.timeLabel}</td></tr>
        <tr><th>Patient</th><td>${b.name}</td></tr>
        <tr><th>Status</th><td>${b.status}</td></tr>
      </table>
      ${cancelled ? '<p class="muted">This booking is cancelled.</p>' : `
      <div class="bk-nav">
        <button class="btn btn-outline" type="button" id="mgReschedule">Reschedule</button>
        <button class="btn btn-outline" type="button" id="mgCancel" style="border-color:var(--danger);color:var(--danger)">Cancel booking</button>
      </div>`}`;
    if (!cancelled) {
      document.getElementById("mgCancel").addEventListener("click", () => {
        b.status = "Cancelled"; b.updatedAt = new Date().toISOString();
        saveBookings(list);
        out.innerHTML = `<div class="notice notice-info">Booking <strong>${b.ref}</strong> has been cancelled. We hope to see you another time.</div>`;
      });
      document.getElementById("mgReschedule").addEventListener("click", () => {
        wiz.editingRef = b.ref;
        wiz.service = b.serviceSlug; wiz.date = b.date;
        wiz.timeVal = null; wiz.timeLabel = null;
        wiz.step = 2; wiz._navigated = true;
        renderWizard();
      });
    }
  });
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const pre = params.get("service");
  if (pre && serviceBySlug(pre) && serviceBySlug(pre).bookable) wiz.service = pre;
  if (document.getElementById("bkApp")) renderWizard();
  initManage();
});
