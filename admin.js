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
        <th>Time</th><th>Patient</th><th>Phone</th><th>Service</th><th>Visit</th><th>Ref</th><th>Status</th>
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
  window.sb.auth.onAuthStateChange((_event, session) => {
    if (!session && !$("dashView").hidden) showView("login");
  });
  refreshSession();
});
