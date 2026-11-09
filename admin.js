/* ============================================================
   Gathrika Skin Clinic — admin.js
   Staff dashboard (admin.html). Supabase Auth email/password.
   All data below is fetched as the signed-in staff user —
   row-level security is what keeps patient data away from
   logged-out visitors; this page simply shows the login form
   until a session exists.
   ============================================================ */

const APPT_STATUSES = ["booked", "confirmed", "arrived", "completed", "no_show", "cancelled"];

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function isoToday() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}
function prettyAdminDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function time12(timeVal) {
  let [h, m] = String(timeVal || "").slice(0, 5).split(":").map(Number);
  if (isNaN(h)) return timeVal || "";
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 === 0 ? 12 : h % 12;
  return h + ":" + String(m).padStart(2, "0") + " " + ap;
}

let viewDate = isoToday();
let viewRows = [];   // appointments currently shown (drives CSV export)

/* ---------- views ---------- */
function showView(which) {
  $("adminLoading").hidden = which !== "loading";
  $("loginView").hidden = which !== "login";
  $("dashView").hidden = which !== "dash";
}

/* ---------- appointments ---------- */
async function loadAppointments() {
  const area = $("apptArea");
  area.innerHTML = '<p class="muted">Loading appointments…</p>';
  $("apptDate").value = viewDate;
  const { data, error } = await window.sb
    .from("appointments")
    .select("id, ref_code, service_slug, service_name, appt_date, appt_time, patient_name, phone, age, gender, is_new, notes, status, source, created_at")
    .eq("appt_date", viewDate)
    .order("appt_time", { ascending: true });
  if (error) {
    viewRows = [];
    area.innerHTML = `<div class="notice notice-warn">Could not load appointments: ${esc(error.message)}</div>`;
    $("apptSummary").textContent = "";
    return;
  }
  viewRows = data || [];
  const active = viewRows.filter(r => r.status !== "cancelled" && r.status !== "no_show").length;
  $("apptSummary").textContent = viewRows.length
    ? `${prettyAdminDate(viewDate)} — ${viewRows.length} appointment(s), ${active} active.`
    : `No appointments on ${prettyAdminDate(viewDate)}.`;
  if (!viewRows.length) { area.innerHTML = '<p class="muted">Nothing booked for this date yet.</p>'; return; }
  area.innerHTML = `
    <div class="admin-table-wrap">
    <table class="admin-table">
      <thead><tr>
        <th>Time</th><th>Patient</th><th>Phone</th><th>Service</th><th>Visit</th><th>Source</th><th>Ref</th><th>Status</th>
      </tr></thead>
      <tbody>
      ${viewRows.map(r => `
        <tr data-id="${r.id}">
          <td data-label="Time"><strong>${esc(time12(r.appt_time))}</strong></td>
          <td data-label="Patient">${esc(r.patient_name)}${r.age ? ` <span class="muted">(${esc(r.age)} yrs${r.gender ? ", " + esc(r.gender) : ""})</span>` : ""}
            ${r.notes ? `<div class="small muted">${esc(r.notes)}</div>` : ""}</td>
          <td data-label="Phone"><a href="tel:${esc(String(r.phone || "").replace(/\s/g, ""))}">${esc(r.phone)}</a></td>
          <td data-label="Service">${esc(r.service_name)}</td>
          <td data-label="Visit">${r.is_new ? "New" : "Returning"}</td>
          <td data-label="Source"><span class="src-badge ${r.source === "desk" ? "src-desk" : "src-web"}">${r.source === "desk" ? "Desk" : "Web"}</span></td>
          <td data-label="Ref"><span class="small">${esc(r.ref_code)}</span></td>
          <td data-label="Status">
            <select class="status-select" data-id="${r.id}" aria-label="Status for ${esc(r.ref_code)}">
              ${APPT_STATUSES.map(s => `<option value="${s}" ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </td>
        </tr>`).join("")}
      </tbody>
    </table>
    </div>`;
  area.querySelectorAll(".status-select").forEach(sel => {
    sel.addEventListener("change", () => updateStatus(sel));
  });
}

async function updateStatus(sel) {
  const id = sel.dataset.id;
  const status = sel.value;
  sel.disabled = true;
  const { error } = await window.sb.from("appointments").update({ status }).eq("id", id);
  sel.disabled = false;
  if (error) {
    alert("Could not update the status: " + error.message);
    loadAppointments(); // resync the dropdown with the server
    return;
  }
  const row = viewRows.find(r => String(r.id) === String(id));
  if (row) row.status = status;
  const active = viewRows.filter(r => r.status !== "cancelled" && r.status !== "no_show").length;
  $("apptSummary").textContent = `${prettyAdminDate(viewDate)} — ${viewRows.length} appointment(s), ${active} active.`;
}

/* ---------- CSV export ---------- */
function exportCSV() {
  const head = ["Date", "Time", "Reference", "Patient", "Phone", "Age", "Gender", "Service", "New/Returning", "Status", "Source", "Notes"];
  const q = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const lines = [head.join(",")].concat(viewRows.map(r => [
    r.appt_date, time12(r.appt_time), r.ref_code, r.patient_name, r.phone,
    r.age == null ? "" : r.age, r.gender || "", r.service_name,
    r.is_new ? "New" : "Returning", r.status, r.source || "", r.notes || ""
  ].map(q).join(",")));
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "gathrika-appointments-" + viewDate + ".csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- blocked dates ---------- */
async function loadBlocks() {
  const list = $("blockList");
  const { data, error } = await window.sb
    .from("slot_blocks")
    .select("id, block_date, reason, created_at")
    .order("block_date", { ascending: true });
  if (error) { list.innerHTML = `<div class="notice notice-warn">Could not load blocked dates: ${esc(error.message)}</div>`; return; }
  if (!data || !data.length) { list.innerHTML = '<p class="muted">No dates are blocked.</p>'; return; }
  list.innerHTML = `
    <div class="admin-table-wrap">
    <table class="admin-table">
      <thead><tr><th>Date</th><th>Reason</th><th></th></tr></thead>
      <tbody>
      ${data.map(b => `
        <tr>
          <td data-label="Date"><strong>${esc(prettyAdminDate(b.block_date))}</strong> <span class="muted small">(${esc(b.block_date)})</span></td>
          <td data-label="Reason">${esc(b.reason || "—")}</td>
          <td><button class="btn btn-outline btn-small" type="button" data-remove="${b.id}">Remove</button></td>
        </tr>`).join("")}
      </tbody>
    </table>
    </div>`;
  list.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      const { error } = await window.sb.from("slot_blocks").delete().eq("id", btn.dataset.remove);
      if (error) { alert("Could not remove the block: " + error.message); btn.disabled = false; return; }
      loadBlocks();
    });
  });
}

async function addBlock(e) {
  e.preventDefault();
  const date = $("blockDate").value;
  const reason = $("blockReason").value.trim();
  const errBox = $("blockError");
  errBox.innerHTML = "";
  if (!date) { errBox.innerHTML = '<div class="notice notice-warn">Please choose a date to block.</div>'; return; }
  const { error } = await window.sb.from("slot_blocks").insert({ block_date: date, reason });
  if (error) {
    errBox.innerHTML = `<div class="notice notice-warn">Could not block that date: ${esc(error.message)}${/duplicate|unique/i.test(error.message) ? " — that date is already blocked." : ""}</div>`;
    return;
  }
  $("blockDate").value = "";
  $("blockReason").value = "";
  loadBlocks();
}

/* ---------- enquiries ---------- */
async function loadEnquiries() {
  const list = $("enquiryList");
  const { data, error } = await window.sb
    .from("enquiries")
    .select("id, name, phone, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) { list.innerHTML = `<div class="notice notice-warn">Could not load enquiries: ${esc(error.message)}</div>`; return; }
  if (!data || !data.length) { list.innerHTML = '<p class="muted">No enquiries yet.</p>'; return; }
  list.innerHTML = data.map(en => `
    <div class="enquiry-item">
      <div class="admin-row" style="gap:8px">
        <strong>${esc(en.name)}</strong>
        <a href="tel:${esc(String(en.phone || "").replace(/\s/g, ""))}">${esc(en.phone)}</a>
        <span class="spacer"></span>
        <span class="small muted">${esc(new Date(en.created_at).toLocaleString("en-IN"))}</span>
      </div>
      <p style="margin:4px 0 0">${esc(en.message)}</p>
    </div>`).join("");
}

/* ---------- desk booking (phone / walk-in) ----------
   Staff enter phone and walk-in bookings into the same
   appointment book as online bookings, with the same slot
   rules as booking.js (Mon–Sat, 11:00–13:00 & 17:00–20:00,
   15-minute slots, capacity 2 counting bookings whose status
   is not cancelled / no_show). Rows are inserted with
   source 'desk' and no consent timestamp — the patient spoke
   to the clinic directly. */
const DESK_SESSIONS = [
  { start: "11:00", end: "13:00" },
  { start: "17:00", end: "20:00" }
];
const DESK_SLOT_MINUTES = 15;
const DESK_CAPACITY = 2;
const DESK_WINDOW_DAYS = 30;

function deskNormaliseMobile(raw) {
  let d = (raw || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}
function deskRefCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return "GATH-" + code;
}
function deskSlotValues() {
  const out = [];
  DESK_SESSIONS.forEach(sess => {
    let [h, m] = sess.start.split(":").map(Number);
    const [eh, em] = sess.end.split(":").map(Number);
    while (h < eh || (h === eh && m < em)) {
      out.push(String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"));
      m += DESK_SLOT_MINUTES;
      if (m >= 60) { m -= 60; h += 1; }
    }
  });
  return out;
}
function deskIsSunday(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() === 0;
}
function deskInWindow(iso) {
  const today = isoToday();
  const max = new Date(); max.setDate(max.getDate() + DESK_WINDOW_DAYS - 1);
  const p = n => String(n).padStart(2, "0");
  const maxISO = max.getFullYear() + "-" + p(max.getMonth() + 1) + "-" + p(max.getDate());
  return iso >= today && iso <= maxISO;
}
/* The service a desk booking is actually recorded under:
   [CONFIRM] services are not directly bookable — like the
   website, they start as a Dermatology Consultation. */
function deskEffectiveService() {
  const sel = $("deskService");
  const s = serviceBySlug(sel.value);
  if (!s) return null;
  return s.bookable ? s : serviceBySlug("dermatology-consultation");
}
async function deskFetchAvailability(iso) {
  const [blk, av] = await Promise.all([
    window.sb.rpc("is_blocked", { p_date: iso }),
    window.sb.rpc("availability", { p_date: iso })
  ]);
  const counts = {};
  if (!av.error && Array.isArray(av.data)) {
    av.data.forEach(r => {
      const t = String(r.appt_time || "").slice(0, 5);
      if (t) counts[t] = Number(r.booked) || 0;
    });
  }
  return { blocked: !blk.error && !!blk.data, counts };
}

let deskInitDone = false;
function initDeskForm() {
  const dateInput = $("deskDate");
  const today = isoToday();
  const max = new Date(); max.setDate(max.getDate() + DESK_WINDOW_DAYS - 1);
  const p = n => String(n).padStart(2, "0");
  dateInput.min = today;
  dateInput.max = max.getFullYear() + "-" + p(max.getMonth() + 1) + "-" + p(max.getDate());
  if (!deskInitDone) {
    $("deskService").innerHTML = SERVICES.map(s =>
      `<option value="${esc(s.slug)}">${esc(s.name)}${s.bookable ? "" : " (on consultation)"}</option>`).join("");
    /* Default the date to the first bookable day (today, or tomorrow if Sunday) */
    let first = today;
    if (deskIsSunday(first)) {
      const t = new Date(); t.setDate(t.getDate() + 1);
      first = t.getFullYear() + "-" + p(t.getMonth() + 1) + "-" + p(t.getDate());
    }
    dateInput.value = first;
    deskInitDone = true;
  }
  onDeskServiceChange();
  loadDeskSlots();
}
function onDeskServiceChange() {
  const s = serviceBySlug($("deskService").value);
  $("deskServiceHint").hidden = !s || s.bookable;
}
function deskMsg(html) { $("deskMsg").innerHTML = html || ""; }

async function loadDeskSlots() {
  const timeSel = $("deskTime");
  const iso = $("deskDate").value;
  deskMsg("");
  if (!iso) { timeSel.innerHTML = '<option value="">Choose a date first</option>'; timeSel.disabled = true; return; }
  if (!deskInWindow(iso)) {
    timeSel.innerHTML = '<option value="">Outside the booking window</option>'; timeSel.disabled = true;
    deskMsg('<div class="notice notice-warn">Desk bookings can be made from today up to 30 days ahead.</div>');
    return;
  }
  if (deskIsSunday(iso)) {
    timeSel.innerHTML = '<option value="">Clinic closed on Sundays</option>'; timeSel.disabled = true;
    deskMsg('<div class="notice notice-warn"><strong>The clinic is closed on Sundays.</strong> Please pick a Monday to Saturday date.</div>');
    return;
  }
  if (!window.sbReady) {
    timeSel.innerHTML = '<option value="">Clinic system unreachable</option>'; timeSel.disabled = true;
    return;
  }
  timeSel.innerHTML = '<option value="">Loading slots…</option>'; timeSel.disabled = true;
  let avail;
  try { avail = await deskFetchAvailability(iso); }
  catch (e) {
    timeSel.innerHTML = '<option value="">Could not load slots</option>';
    deskMsg('<div class="notice notice-warn">Could not load slot availability. Check the connection and change the date to try again.</div>');
    return;
  }
  if (avail.blocked) {
    timeSel.innerHTML = '<option value="">Clinic closed on this date</option>'; timeSel.disabled = true;
    deskMsg(`<div class="notice notice-warn"><strong>Clinic closed on this date.</strong> ${esc(prettyAdminDate(iso))} is a blocked date — no bookings can be taken. Remove the block below if that is wrong.</div>`);
    return;
  }
  const prev = timeSel.value;
  timeSel.innerHTML = deskSlotValues().map(val => {
    const taken = avail.counts[val] || 0;
    const left = DESK_CAPACITY - taken;
    if (left <= 0) return `<option value="${val}" disabled>${time12(val)} · Full</option>`;
    return `<option value="${val}">${time12(val)} · ${left} left</option>`;
  }).join("");
  timeSel.disabled = false;
  if (prev && timeSel.querySelector(`option[value="${prev}"]:not([disabled])`)) timeSel.value = prev;
}

function deskMarkInvalid(id, bad) {
  const f = $(id);
  if (f) f.classList.toggle("invalid", bad);
  return !bad;
}

async function submitDeskBooking(e) {
  e.preventDefault();
  deskMsg("");
  $("deskSuccess").hidden = true;
  const service = deskEffectiveService();
  const iso = $("deskDate").value;
  const timeVal = $("deskTime").value;
  const name = $("deskName").value.trim();
  const mobile = deskNormaliseMobile($("deskMobile").value);
  const isNew = document.querySelector('input[name="deskVisit"]:checked').value === "new";
  const note = $("deskNote").value.trim();

  let ok = true;
  ok = deskMarkInvalid("df-service", !service) && ok;
  ok = deskMarkInvalid("df-date", !iso || !deskInWindow(iso) || deskIsSunday(iso)) && ok;
  ok = deskMarkInvalid("df-time", !timeVal) && ok;
  ok = deskMarkInvalid("df-name", name.length < 3) && ok;
  ok = deskMarkInvalid("df-mobile", !/^[6-9]\d{9}$/.test(mobile)) && ok;
  if (!ok) return;
  if (!window.sbReady) {
    deskMsg('<div class="notice notice-warn">The clinic system could not be reached, so nothing was booked. Check the connection and try again.</div>');
    return;
  }

  const btn = $("deskSubmit");
  btn.disabled = true; btn.textContent = "Adding…";

  /* Re-check the day and the slot against the live book — a slot
     may have filled (or the day been blocked) since the form opened. */
  let avail;
  try { avail = await deskFetchAvailability(iso); }
  catch (err) {
    btn.disabled = false; btn.textContent = "Add booking";
    deskMsg('<div class="notice notice-warn">Could not re-check availability just now. Nothing was booked — please try again.</div>');
    return;
  }
  if (avail.blocked) {
    btn.disabled = false; btn.textContent = "Add booking";
    await loadDeskSlots(); // refresh first — it clears the message area, so set the refusal after
    deskMsg(`<div class="notice notice-warn"><strong>Booking refused.</strong> ${esc(prettyAdminDate(iso))} has been blocked (clinic closed) — no booking was added.</div>`);
    return;
  }
  if ((avail.counts[timeVal] || 0) >= DESK_CAPACITY) {
    btn.disabled = false; btn.textContent = "Add booking";
    await loadDeskSlots(); // refresh first — it clears the message area, so set the refusal after
    deskMsg(`<div class="notice notice-warn"><strong>Booking refused.</strong> The ${esc(time12(timeVal))} slot on ${esc(prettyAdminDate(iso))} has just filled up — please pick another time. No booking was added.</div>`);
    return;
  }

  const payload = ref => ({
    ref_code: ref,
    service_slug: service.slug,
    service_name: service.name,
    appt_date: iso,
    appt_time: timeVal + ":00",
    patient_name: name,
    phone: "+91 " + mobile,
    age: null,
    gender: null,
    is_new: isNew,
    notes: note,
    status: "booked",
    source: "desk",
    consent_at: null
  });
  let ref = deskRefCode();
  let { error } = await window.sb.from("appointments").insert(payload(ref));
  if (error && /duplicate|unique/i.test(error.message || "")) {
    ref = deskRefCode(); // reference-code collision — one retry with a fresh code
    ({ error } = await window.sb.from("appointments").insert(payload(ref)));
  }
  btn.disabled = false; btn.textContent = "Add booking";
  if (error) {
    deskMsg(`<div class="notice notice-warn"><strong>Could not add the booking:</strong> ${esc(error.message)} Nothing was saved — please try again.</div>`);
    return;
  }

  const waText = "Hello " + name + ", your appointment at Gathrika Skin Clinic is booked: " +
    service.name + " on " + prettyAdminDate(iso) + " at " + time12(timeVal) +
    ". Your reference code is " + ref + ". Consultation fee Rs 300, payable at the clinic. " +
    "Clinic phone: +91 93926 31157.";
  const success = $("deskSuccess");
  success.innerHTML = `
    <div class="notice notice-info" style="margin-bottom:0">
      <strong>Booking added.</strong> ${esc(service.name)} · ${esc(prettyAdminDate(iso))} · ${esc(time12(timeVal))}<br>
      Reference code: <strong>${esc(ref)}</strong>
      <div style="margin-top:10px">
        <a class="btn btn-whatsapp" href="https://wa.me/91${mobile}?text=${encodeURIComponent(waText)}" target="_blank" rel="noopener">Send confirmation on WhatsApp</a>
      </div>
    </div>`;
  success.hidden = false;

  /* Reset the patient fields for the next call, keep date/service */
  $("deskName").value = "";
  $("deskMobile").value = "";
  $("deskNote").value = "";
  ["df-name", "df-mobile", "df-time"].forEach(id => $(id).classList.remove("invalid"));
  loadDeskSlots();
  if (viewDate === iso) loadAppointments();
}

/* ---------- auth ---------- */
async function onLogin(e) {
  e.preventDefault();
  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;
  const errBox = $("loginError");
  errBox.hidden = true;
  if (!window.sbReady) {
    errBox.textContent = "The clinic system could not be reached. Please check your connection and try again.";
    errBox.hidden = false;
    return;
  }
  const btn = $("loginBtn");
  btn.disabled = true; btn.textContent = "Signing in…";
  const { error } = await window.sb.auth.signInWithPassword({ email, password });
  btn.disabled = false; btn.textContent = "Sign in";
  if (error) {
    errBox.textContent = "Sign-in failed: " + error.message;
    errBox.hidden = false;
    return;
  }
  await refreshSession();
}

async function refreshSession() {
  if (!window.sbReady) { showView("login"); return; }
  const { data } = await window.sb.auth.getSession();
  const session = data && data.session;
  if (!session) { showView("login"); return; }
  $("userEmail").textContent = session.user.email || "";
  showView("dash");
  initDeskForm();
  loadAppointments();
  loadBlocks();
  loadEnquiries();
}

document.addEventListener("DOMContentLoaded", () => {
  showView("loading");
  if (!window.sbReady) {
    showView("login");
    const errBox = $("loginError");
    errBox.textContent = "The clinic system could not be reached from this browser. Please check your connection and reload.";
    errBox.hidden = false;
    return;
  }
  $("loginForm").addEventListener("submit", onLogin);
  $("signOutBtn").addEventListener("click", async () => {
    await window.sb.auth.signOut();
    showView("login");
  });
  $("apptDate").addEventListener("change", e => {
    if (e.target.value) { viewDate = e.target.value; loadAppointments(); }
  });
  $("todayBtn").addEventListener("click", () => { viewDate = isoToday(); loadAppointments(); });
  $("csvBtn").addEventListener("click", exportCSV);
  $("blockForm").addEventListener("submit", addBlock);
  $("deskForm").addEventListener("submit", submitDeskBooking);
  $("deskDate").addEventListener("change", loadDeskSlots);
  $("deskService").addEventListener("change", onDeskServiceChange);
  window.sb.auth.onAuthStateChange((_event, session) => {
    if (!session && !$("dashView").hidden) showView("login");
  });
  refreshSession();
});
