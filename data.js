/* ============================================================
   Gathrika Skin Clinic — data.js
   Single source of truth for clinic facts, service & product
   catalogs (brief sections 5–6) and shared page chrome.
   ------------------------------------------------------------
   CONFIG RULE: the clinic's phone / WhatsApp number was
   confirmed by the clinic via Pavan on Nov 8, 2026:
   +91 9392631157 (the same number for calls and WhatsApp).
   Display format on the site: +91 93926 31157.
   If the number ever needs to change, change it here only —
   every call / chat action on the site reads from CONFIG.
   ============================================================ */

const CONFIG = {
  PHONE: "+919392631157",   // clinic phone (confirmed Nov 8, 2026, via Pavan)
  WHATSAPP: "919392631157",  // clinic WhatsApp — same number (confirmed Nov 8, 2026, via Pavan)
  PHONE_DISPLAY: "+91 93926 31157",
  EMAIL: "",      // [CONFIRM] clinic email
  MAPS_QUERY: "Gathrika Skin Clinic, 7-4 Main Road, Above Union Bank, Beside Sampoorna Hotel, Medipally, Peerzadiguda, Hyderabad 500098",
  /* Live backend (Supabase) — wired Nov 2026. The publishable key is
     safe to expose in the browser: row-level security limits anon
     visitors to inserting appointments/enquiries and calling the
     availability RPCs. Staff data is only reachable after login. */
  SUPABASE_URL: "https://ypmxiooqoxewmxzfjwiq.supabase.co",
  SUPABASE_KEY: "sb_publishable_WhhAgQleiwZxnjQ5scGQnA_kcGSeNjy"
};

const CLINIC = {
  name: "Gathrika Skin Clinic",
  tagline: "Healthy skin, honestly treated.",
  doctor: "Dr. G. Kiranmayee",
  qualifications: "MBBS, DDVL",
  registration: "Telangana State Medical Council Reg. No. 81259",
  addressLines: [
    "7-4, Main Road, Above Union Bank,",
    "Beside Sampoorna Hotel, Medipally,",
    "Peerzadiguda, Hyderabad, Telangana 500098"
  ],
  addressShort: "Medipally Main Road, Peerzadiguda, Hyderabad 500098",
  hours: [
    { days: "Monday – Saturday (Morning)", time: "11:00 AM – 1:00 PM" },
    { days: "Monday – Saturday (Evening)", time: "5:00 PM – 8:00 PM" },
    { days: "Sunday", time: "Closed" }
  ],
  consultFee: 300,
  established: "June 2021",
  payments: "Cash, UPI, Paytm, PhonePe, Amazon Pay, MobiKwik, JioMoney, Visa / MasterCard / RuPay, Amex",
  ratingJustdial: { score: "4.8", count: 232 },
  ratingDoctor: { score: "4.7", count: 4 }
};

function mapsSearchUrl() {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.MAPS_QUERY);
}
function mapsDirUrl() {
  return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(CONFIG.MAPS_QUERY);
}
function mapsEmbedUrl() {
  return "https://www.google.com/maps?q=" + encodeURIComponent(CONFIG.MAPS_QUERY) + "&output=embed";
}
/* Returns a tel: link, or contact.html when no number is confirmed. */
function callHref() {
  return CONFIG.PHONE ? "tel:" + CONFIG.PHONE.replace(/\s/g, "") : "contact.html";
}
/* Returns a wa.me link with a prefilled message, or contact.html. */
function waHref(message) {
  if (!CONFIG.WHATSAPP) return "contact.html";
  return "https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent(message || "Hi, I would like to enquire about an appointment at Gathrika Skin Clinic.");
}
function hasPhone() { return !!CONFIG.PHONE; }
function hasWhatsApp() { return !!CONFIG.WHATSAPP; }
/* Human-readable number for display on the site, e.g. +91 93926 31157 */
function phoneDisplay() { return CONFIG.PHONE_DISPLAY || CONFIG.PHONE; }

/* ============================================================
   SERVICES — brief section 5.
   status: "listed"  = confirmed online, bookable.
           "confirm" = [CONFIRM] in brief — shown in catalog
           marked "On consultation", NOT directly bookable.
   ============================================================ */
const SERVICES = [
  {
    slug: "dermatology-consultation", icon: "plus-circle", short: "A complete skin, hair & nail check-up with the doctor.", name: "Dermatology Consultation", category: "Consultation",
    alsoCategories: ["Pediatric"], status: "listed", bookable: true,
    priceDisplay: "Rs 300", durationMin: 20, sessions: "Single visit (15–20 min)",
    summary: "A complete skin, hair or nail check-up with Dr. G. Kiranmayee — diagnosis, a clear treatment plan, and honest advice on what you actually need.",
    whoFor: "Anyone with a new or ongoing skin, hair or nail concern — adults and children. Also the right first step before any procedure.",
    howItWorks: "The doctor examines the affected area, asks about your history, medicines and routine, and may use a dermatoscope for a closer look. You leave with a diagnosis in plain language, a prescription if needed, and a follow-up plan.",
    downtime: "None", resultsTimeline: "Diagnosis and plan on the same visit; improvement depends on the condition and treatment started.",
    aftercare: "Follow the prescribed routine exactly, avoid starting or stopping products on your own, and keep the follow-up date.",
    sideEffects: "None from the consultation itself. Any medicine prescribed will be explained with its possible effects.",
    contraindications: "None. Please carry previous reports and prescriptions, if any.",
    faqs: [
      { q: "What is the consultation fee?", a: "The consultation fee is Rs 300, payable at the clinic. We accept cash, UPI and cards." },
      { q: "Do I need an appointment, or can I walk in?", a: "Walk-ins are seen subject to availability, but a booked appointment keeps your wait short. You can request an appointment on this website." },
      { q: "Does the doctor see children?", a: "Yes. The clinic treats pediatric skin concerns such as eczema, rashes and infections in children." },
      { q: "What should I carry for my first visit?", a: "Any previous prescriptions, reports, and a list of products or medicines you currently use." }
    ],
    relatedProducts: ["gentle-foaming-cleanser", "broad-spectrum-sunscreen"]
  },
  {
    slug: "acne-treatment", icon: "sparkle", short: "Doctor-led care for pimples, marks and scars.", name: "Acne & Pimples Treatment", category: "Skin",
    status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 20, sessions: "Course of 3–6 months",
    summary: "Doctor-led acne care that combines medicines, skin-care correction and procedures where needed — planned around your skin type and acne stage.",
    whoFor: "Teenagers and adults with active pimples, blackheads, whiteheads, painful cystic acne, or marks left behind by earlier acne.",
    howItWorks: "After grading your acne, the doctor builds a step-by-step plan: topical and/or oral medication, a simple routine, and procedures such as peels or extractions only where they help. Progress is reviewed at follow-ups and the plan is adjusted.",
    downtime: "None for medication-based care; procedures may have 1–3 days of mild redness.",
    resultsTimeline: "Most patients see visible settling in 6–8 weeks; a full course usually runs 3–6 months.",
    aftercare: "Use only the prescribed products, do not pick or squeeze pimples, apply sunscreen daily, and keep follow-up visits.",
    sideEffects: "Dryness, mild peeling or temporary increase in breakouts can occur early with some medicines; the doctor will explain what to expect.",
    contraindications: "Some oral acne medicines are not used in pregnancy — always tell the doctor if you are pregnant or planning a pregnancy.",
    faqs: [
      { q: "How long does acne treatment take?", a: "Acne is controlled gradually. Expect 6–8 weeks for visible change and 3–6 months for a full course, depending on severity." },
      { q: "Will my acne come back after treatment?", a: "Acne can recur, especially with hormonal triggers. A maintenance routine and timely follow-up reduce repeat flare-ups." },
      { q: "Can diet and home remedies replace treatment?", a: "They can support, but not replace, medical treatment for moderate or severe acne. Home remedies sometimes irritate the skin further." }
    ],
    relatedProducts: ["anti-acne-gel", "oil-free-gel-moisturiser", "niacinamide-serum"]
  },
  {
    slug: "chronic-skin-disorders", icon: "shield", short: "Long-term care for psoriasis, eczema & recurring skin problems.", name: "Psoriasis, Eczema & Chronic Skin Disorders", category: "Skin",
    alsoCategories: ["Pediatric"], status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 20, sessions: "Long-term care plan",
    summary: "Ongoing, doctor-supervised care for psoriasis, eczema and other long-standing skin conditions — focused on control, comfort and flare prevention.",
    whoFor: "Adults and children living with recurring patches, scaling, itching or rashes that keep coming back, including psoriasis and eczema.",
    howItWorks: "The doctor confirms the diagnosis, identifies triggers, and sets a long-term plan combining creams, medicines when required, and lifestyle and skin-care changes. Flare-ups are managed with planned reviews rather than repeated emergency fixes.",
    downtime: "None", resultsTimeline: "Flare control usually improves over 4–8 weeks; chronic conditions need continued maintenance.",
    aftercare: "Moisturise as advised, avoid known triggers, do not stop steroid creams suddenly unless told, and report new flares early.",
    sideEffects: "Depends on the medicines used; long-term topical steroid use without supervision can thin the skin — this is why reviews matter.",
    contraindications: "Tell the doctor about other illnesses and medicines, as some treatments are adjusted in liver, kidney or immune conditions.",
    faqs: [
      { q: "Can psoriasis or eczema be cured permanently?", a: "These are chronic conditions that can be controlled well, but no honest treatment can promise a permanent cure. Our goal is long, comfortable remission." },
      { q: "How often do I need follow-ups?", a: "Usually every 4–8 weeks while the condition is active, and less often once stable." },
      { q: "Is it safe to use steroid creams long-term?", a: "Only in the strength and duration the doctor prescribes. Self-extending steroid creams is a common cause of skin damage." }
    ],
    relatedProducts: ["hydrating-cream-moisturiser", "gentle-foaming-cleanser"]
  },
  {
    slug: "skin-rash-allergy-fungal", icon: "waves", short: "The right diagnosis for itching, rashes & fungal infections.", name: "Skin Rash, Allergy & Fungal Infections", category: "Skin",
    alsoCategories: ["Pediatric"], status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 20, sessions: "Usually 1–3 visits",
    summary: "Quick, correct diagnosis for itching, rashes, allergies and fungal infections — so you stop guessing and stop using the wrong cream.",
    whoFor: "Anyone with sudden or recurring itching, red patches, ring-shaped lesions, or rashes that spread or do not settle with home treatment.",
    howItWorks: "The doctor examines the rash and its pattern, asks about soaps, cosmetics, medicines and contacts, and prescribes antifungal, anti-allergy or soothing treatment as appropriate. Most cases need 1–3 visits.",
    downtime: "None", resultsTimeline: "Itching often eases within days; fungal infections typically need 2–4 weeks of full treatment to clear.",
    aftercare: "Complete the full course even if it looks better, keep the area dry, avoid sharing towels, and stop any cream that was worsening the rash.",
    sideEffects: "Mild burning or dryness can occur with some antifungal creams and settles quickly.",
    contraindications: "Combination 'fairness + steroid' creams should never be used on fungal infections — they mask and worsen them.",
    faqs: [
      { q: "Why did my fungal infection come back?", a: "Usually because the course was stopped early, the cream contained steroids, or reinfection happened from clothes or close contacts. A full, correct course fixes most cases." },
      { q: "Can I use a cream my family member used?", a: "Not safely. Rashes that look similar can have different causes, and the wrong cream can worsen the problem." },
      { q: "When should I come urgently?", a: "If the rash spreads fast, blisters, involves eyes or mouth, or comes with fever or swelling, seek care the same day." }
    ],
    relatedProducts: ["gentle-foaming-cleanser", "anti-dandruff-shampoo"]
  },
  {
    slug: "vitiligo-warts-moles", icon: "circles", short: "Assessment of white patches, warts, moles & skin tags.", name: "Vitiligo, Warts, Moles & Skin Tags", category: "Skin",
    status: "confirm", bookable: false,
    priceDisplay: "On consultation", durationMin: 20, sessions: "Procedure-based",
    summary: "Assessment and procedure-based care for white patches, warts, moles and skin tags — confirmed with the doctor after examination.",
    whoFor: "People with new or spreading white patches, warts, changing moles, or skin tags they want assessed or removed.",
    howItWorks: "The doctor first examines and diagnoses the lesion — not every spot needs removal. Where a procedure is right, options and expected healing are explained before anything is done.",
    downtime: "Varies by procedure; small removals usually heal in 5–10 days.",
    resultsTimeline: "Removal results are immediate; vitiligo care is gradual and reviewed over months.",
    aftercare: "Keep the treated area clean and dry, apply the prescribed ointment, and avoid picking at healing skin.",
    sideEffects: "Temporary marks, mild pain or small scars are possible with removal procedures and will be discussed beforehand.",
    contraindications: "Any rapidly changing, bleeding or unusual mole is examined on priority and referred further if needed.",
    faqs: [
      { q: "Should every mole be removed?", a: "No. Most moles are harmless. Removal is advised if a mole changes, bothers you, or for cosmetic reasons after examination." },
      { q: "Can vitiligo be treated?", a: "Vitiligo can often be stabilised and repigmentation achieved in many areas with consistent treatment, though response varies by site and duration." },
      { q: "Why is this service 'On consultation'?", a: "These concerns are procedure-based. The right option depends on examination, so booking starts with a consultation." }
    ],
    relatedProducts: ["broad-spectrum-sunscreen"]
  },
  {
    slug: "pigmentation-treatment", icon: "sun", short: "Stepwise care for melasma, sun spots & tanning.", name: "Melasma, Sun Spots & Pigmentation", category: "Skin",
    status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 20, sessions: "Peels / laser / topical plan",
    summary: "A careful, stepwise plan for melasma, sun spots, age spots and tanning — combining medicines, sun protection and procedures that suit Indian skin.",
    whoFor: "Adults with dark patches on the cheeks or forehead, sun spots, age spots, or uneven tanning that does not fade on its own.",
    howItWorks: "The doctor identifies the type and depth of pigmentation, then combines prescription creams, strict sun protection, and peels or laser sessions where suitable. Melasma care also looks at triggers like sun, heat and hormones.",
    downtime: "None for creams; peels may cause 2–4 days of flaking.",
    resultsTimeline: "Lightening is gradual — usually 8–12 weeks for clear change, with maintenance to hold the result.",
    aftercare: "Sunscreen every morning is non-negotiable, avoid harsh scrubs and fairness creams, and review progress at planned intervals.",
    sideEffects: "Mild irritation from active creams is possible early; strong unsupervised lightening creams can cause damage and rebound pigmentation.",
    contraindications: "Some depigmenting medicines are avoided in pregnancy. Procedures are planned around recent sun exposure and events.",
    faqs: [
      { q: "Can melasma be removed permanently?", a: "Melasma can be lightened and controlled, but it tends to return with sun and hormonal triggers. Maintenance is part of honest treatment." },
      { q: "Why did fairness creams make my patches worse?", a: "Many contain steroids or harsh agents that thin the skin and deepen pigmentation over time. Stop them and get the skin assessed." },
      { q: "Is sunscreen really necessary indoors?", a: "Yes for melasma-prone skin — visible light through windows also darkens patches." }
    ],
    relatedProducts: ["broad-spectrum-sunscreen", "vitamin-c-serum", "depigmenting-cream"]
  },
  {
    slug: "chemical-peels", icon: "layers", short: "Doctor-chosen peels for glow, marks & uneven tone.", name: "Chemical Peels", category: "Aesthetic",
    status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 30, sessions: "4–6 sessions, 2–3 weeks apart",
    summary: "Doctor-chosen peels — glycolic, salicylic and more — to refresh dull skin, even out tone and help acne, marks and early fine lines.",
    whoFor: "People with dull or uneven skin, acne and acne marks, mild pigmentation, or early signs of ageing who want gradual, natural-looking improvement.",
    howItWorks: "After skin assessment, the doctor selects the peel type and strength for your concern. The solution is applied for a few minutes, neutralised, and followed by soothing care and sunscreen. Peels are repeated every 2–3 weeks.",
    downtime: "Mild flaking or dryness for 2–4 days; deeper peels may need up to a week.",
    resultsTimeline: "Glow improves from the first sessions; marks and tone improve over a course of 4–6 sessions.",
    aftercare: "Moisturise well, use sunscreen daily, do not scrub or peel off flaking skin, and avoid other actives until advised.",
    sideEffects: "Temporary redness, tingling, dryness or darkening if sun protection is skipped.",
    contraindications: "Peels are postponed over active infection, open wounds, recent strong sun exposure, or before major events without enough healing gap.",
    faqs: [
      { q: "Do peels thin the skin?", a: "Done at the right strength and interval, peels remove dull surface cells and support renewal; they do not thin healthy skin." },
      { q: "How many sessions will I need?", a: "Most concerns need 4–6 sessions spaced 2–3 weeks apart, combined with home care." },
      { q: "Can I go to work after a peel?", a: "Yes for superficial peels — expect mild flaking for a few days. Plan deeper peels away from events." }
    ],
    relatedProducts: ["broad-spectrum-sunscreen", "hydrating-cream-moisturiser", "vitamin-c-serum"]
  },
  {
    slug: "anti-aging-solutions", icon: "leaf", short: "Peels, laser & skin-quality care for a fresher look.", name: "Anti-Aging Solutions", category: "Aesthetic",
    status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 30, sessions: "Planned per concern",
    summary: "Practical anti-aging care — peels, laser and skin-quality treatments chosen by the doctor to soften lines and restore a fresher look.",
    whoFor: "Adults noticing fine lines, loss of glow, uneven tone or early sagging who want doctor-guided, natural-looking improvement.",
    howItWorks: "The doctor assesses skin quality, photo-ageing and your goals, then builds a plan — which may combine peels, laser sessions, medical skin care, and injectable options where suitable and confirmed.",
    downtime: "Depends on the treatment chosen; most options have little to no downtime.",
    resultsTimeline: "Skin quality improves over 6–12 weeks of consistent care; plans are reviewed and refined.",
    aftercare: "Daily sunscreen, the prescribed night routine, and avoiding smoking and harsh products help results last.",
    sideEffects: "Vary by procedure and are discussed in full before any treatment is started.",
    contraindications: "Expectations are discussed honestly — treatments improve skin quality; they cannot reverse ageing itself.",
    faqs: [
      { q: "At what age should anti-aging care start?", a: "Sunscreen and basic care in the 20s; active treatments are based on your skin's condition, not just your age." },
      { q: "Are the results permanent?", a: "No treatment stops ageing. Results are maintained with home care and periodic sessions." },
      { q: "Do you offer injectables?", a: "Injectable options, if offered for your case, are confirmed by the doctor during consultation after assessing suitability." }
    ],
    relatedProducts: ["vitamin-c-serum", "broad-spectrum-sunscreen", "hydrating-cream-moisturiser"]
  },
  {
    slug: "acne-scar-treatment", icon: "activity", short: "Laser, microneedling & subcision, matched to your scar type.", name: "Acne Scar Treatment", category: "Aesthetic",
    status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 45, sessions: "3–6 sessions",
    summary: "Combined scar care — laser, microneedling and subcision selected by scar type — to steadily improve pitted and uneven acne scars.",
    whoFor: "Adults whose acne has settled but left pits, rolling or boxcar scars, or rough texture on the cheeks, forehead or chin.",
    howItWorks: "Scars are not all the same, so the doctor maps your scar types first. Treatment may combine fractional laser, microneedling and subcision across sessions, with active acne controlled before or alongside scar work.",
    downtime: "2–5 days of redness and mild swelling depending on the procedure.",
    resultsTimeline: "Skin remodels slowly — improvement builds over 3–6 sessions across several months.",
    aftercare: "Strict sunscreen, gentle cleansing, no picking, and the prescribed soothing routine while skin heals.",
    sideEffects: "Redness, temporary darkening (especially without sun protection), and mild swelling are the common ones.",
    contraindications: "Scar procedures are planned when active acne is controlled; keloid tendency and certain medicines are assessed first.",
    faqs: [
      { q: "Can acne scars be removed 100%?", a: "Scars can be improved significantly, but complete removal is not a promise any honest clinic should make. We plan for visible, gradual improvement." },
      { q: "Which is better — laser or microneedling?", a: "It depends on scar type and depth. Many patients are treated with a combination planned by the doctor." },
      { q: "How many sessions will I need?", a: "Most scar plans run 3–6 sessions, spaced about a month apart." }
    ],
    relatedProducts: ["broad-spectrum-sunscreen", "niacinamide-serum"]
  },
  {
    slug: "hydrafacial-medi-facial", icon: "droplets", short: "Deep-cleanse, hydrate & glow — supervised by the doctor.", name: "HydraFacial / Medi-Facial & Glow Treatments", category: "Aesthetic",
    status: "confirm", bookable: false,
    priceDisplay: "On consultation", durationMin: 45, sessions: "Monthly, or before an event",
    summary: "Doctor-supervised medi-facials for deep cleansing, hydration and glow — confirmed with the doctor for your skin type.",
    whoFor: "Anyone with dull, tired or congested skin wanting a refreshed look for an event, or monthly maintenance alongside treatment.",
    howItWorks: "Unlike salon facials, a medi-facial uses medical-grade products and steps chosen for your skin — cleanse, gentle exfoliation, hydration and protection — under the doctor's protocol.",
    downtime: "None; a mild flush settles within hours.",
    resultsTimeline: "Glow is immediate and lasts several days; regular sessions support ongoing skin health.",
    aftercare: "Avoid heavy makeup for a few hours, moisturise, and use sunscreen the next morning.",
    sideEffects: "Rare mild redness or breakouts in congested skin; products are chosen to minimise this.",
    contraindications: "Postponed over active rashes, infections or very sensitive, broken skin.",
    faqs: [
      { q: "How is a medi-facial different from a salon facial?", a: "It uses medical-grade formulations and is matched to your skin condition by the clinic — no bleaching or harsh massages." },
      { q: "When should I do it before an event?", a: "2–3 days before is ideal, so any mild flush settles and the glow shows." },
      { q: "Why is it 'On consultation'?", a: "Availability and the right variant for your skin are confirmed with the doctor first." }
    ],
    relatedProducts: ["hydrating-cream-moisturiser", "gentle-foaming-cleanser"]
  },
  {
    slug: "botox-fillers-threads", icon: "syringe", short: "Doctor-only injectables, assessed in consultation first.", name: "Botox, Fillers & Thread Lift", category: "Aesthetic",
    status: "confirm", bookable: false,
    priceDisplay: "On consultation", durationMin: 45, sessions: "Doctor-only procedures",
    summary: "Injectable and thread procedures performed only by the doctor, and only where genuinely suitable — assessed in consultation first.",
    whoFor: "Adults considering wrinkle-relaxing injections, volume restoration or thread lift after a proper facial assessment.",
    howItWorks: "These are doctor-only medical procedures. Suitability, product choice, expected result and longevity are discussed in a consultation before any appointment is planned.",
    downtime: "Mild swelling or bruising for a few days, depending on the procedure.",
    resultsTimeline: "Botox effect builds over 3–14 days; fillers are immediate; both are temporary and reviewed at follow-up.",
    aftercare: "Follow the doctor's post-procedure instructions exactly; avoid facials, heat and pressure on the area as advised.",
    sideEffects: "Bruising, swelling, asymmetry or lumps are possible and are managed at review; rare serious effects are discussed in consent.",
    contraindications: "Not done in pregnancy, over active skin infection, or where assessment shows the procedure will not help.",
    faqs: [
      { q: "Who performs the procedure?", a: "Only the doctor. These are never delegated." },
      { q: "Will I look unnatural?", a: "The aim is a rested, natural look. Doses and placement are planned conservatively and reviewed." },
      { q: "Why can't I book this directly?", a: "Injectables need assessment first. Booking starts with a consultation so the plan is right for your face." }
    ],
    relatedProducts: []
  },
  {
    slug: "laser-therapy", icon: "zap", short: "Hair reduction, pigmentation & scar laser care.", name: "Laser Therapy (Hair Reduction, Pigmentation, Scars)", category: "Laser",
    status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 45, sessions: "6–8 sessions (hair reduction)",
    summary: "Laser treatment for unwanted hair, pigmentation and scars — settings and suitability decided by the doctor for your skin type.",
    whoFor: "People seeking long-term hair reduction, laser help for pigmentation or scars, after a skin-type and hair-type assessment.",
    howItWorks: "The doctor checks your skin and hair type, medical history and recent sun exposure, then selects laser type and settings. Sessions are spaced weeks apart; hair reduction typically needs 6–8 sessions.",
    downtime: "Mild redness for a few hours to 2 days, depending on the treatment.",
    resultsTimeline: "Hair reduction is progressive across sessions; pigmentation and scar results build over the course.",
    aftercare: "Avoid sun and waxing/threading between sessions as advised; use sunscreen and soothing care.",
    sideEffects: "Temporary redness, mild swelling, or darkening/lightening in the treated area — risk is lower with doctor-set parameters and sun care.",
    contraindications: "Recent tanning, active infection in the area, pregnancy, and some medicines need assessment before laser.",
    faqs: [
      { q: "Is laser hair reduction permanent?", a: "It gives long-term reduction, not a lifetime guarantee. Occasional maintenance sessions may be needed, especially with hormonal influence." },
      { q: "Does laser work on all skin types?", a: "Suitability depends on skin and hair type. The doctor assesses this first and will say honestly if laser is not right for you." },
      { q: "How should I prepare?", a: "Avoid waxing and bleaching for a few weeks before, avoid heavy sun, and shave the area as instructed before your session." }
    ],
    relatedProducts: ["broad-spectrum-sunscreen", "hydrating-cream-moisturiser"]
  },
  {
    slug: "hair-fall-treatment", icon: "strands", short: "Find the cause first — medicines & PRP / GFC where advised.", name: "Hair Fall & Alopecia Treatment (incl. PRP / GFC)", category: "Hair",
    status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 30, sessions: "4–6 sessions for PRP / GFC",
    summary: "Trichology care for hair fall and thinning — find the cause first, then treat with medicines and PRP / GFC where the doctor advises.",
    whoFor: "Men and women with increased hair fall, visible thinning, a widening parting, or patchy hair loss.",
    howItWorks: "The doctor examines the scalp, reviews causes — hormones, nutrition, thyroid, stress, post-illness shedding — and may advise blood tests. Treatment combines medicines, scalp care, and PRP or GFC sessions where suitable.",
    downtime: "None for medicines; PRP/GFC may cause a day of scalp tenderness.",
    resultsTimeline: "Shedding usually reduces in 6–8 weeks; visible density change takes 3–6 months of consistent treatment.",
    aftercare: "Take supplements and medicines as prescribed, avoid harsh chemical treatments during the course, and keep session dates.",
    sideEffects: "Mild scalp soreness after PRP/GFC; some medicines can cause initial shedding that settles.",
    contraindications: "PRP/GFC suitability is confirmed by the doctor (blood disorders, scalp infection and some illnesses need assessment).",
    faqs: [
      { q: "Why are blood tests sometimes advised?", a: "Iron, vitamin D, B12 and thyroid issues are common hidden causes of hair fall. Treating the cause makes treatment work." },
      { q: "Does PRP regrow hair on bald areas?", a: "PRP helps where follicles are still alive and thinning. Long-standing shiny bald areas respond poorly — the doctor will assess honestly." },
      { q: "How many PRP sessions are needed?", a: "Usually 4–6 sessions spaced about a month apart, with medicines alongside." }
    ],
    relatedProducts: ["anti-hair-fall-serum", "hair-skin-supplement"]
  },
  {
    slug: "dandruff-scalp-disorders", icon: "snow", short: "Care for flakes, itching & scalp problems that keep returning.", name: "Dandruff & Scalp Disorders", category: "Hair",
    status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 20, sessions: "Usually 2–4 weeks of care",
    summary: "Treatment for dandruff, itchy or flaky scalp, and scalp psoriasis or dermatitis — matched to the actual cause, not guesswork.",
    whoFor: "Anyone with persistent flakes, itching, redness or scaling of the scalp that regular shampoos do not control.",
    howItWorks: "The doctor distinguishes dandruff from seborrheic dermatitis, scalp psoriasis or fungal infection — they look similar but treat differently — and prescribes medicated shampoos, lotions and a routine.",
    downtime: "None", resultsTimeline: "Itching and flakes usually improve within 2–4 weeks; maintenance prevents recurrence.",
    aftercare: "Use the medicated shampoo as directed (including contact time), avoid oiling an inflamed scalp unless advised, and do not scratch.",
    sideEffects: "Mild dryness of hair with medicated shampoos; a conditioner on the lengths helps.",
    contraindications: "Bleeding, crusting or patchy hair loss with the flakes needs prompt in-person review.",
    faqs: [
      { q: "Why does dandruff keep coming back?", a: "Dandruff is a recurring tendency of the scalp. Control improves with the right shampoo used in a maintenance rhythm, not a one-time cure." },
      { q: "Should I oil my hair for dandruff?", a: "Oil can worsen dandruff and dermatitis for many people. Follow the doctor's advice for your scalp type." },
      { q: "Is dandruff contagious?", a: "No. It is related to scalp yeast that normally lives on skin and individual sensitivity to it." }
    ],
    relatedProducts: ["anti-dandruff-shampoo", "anti-hair-fall-serum"]
  },
  {
    slug: "nail-disorders", icon: "nail", short: "Diagnosis & treatment for infected, brittle or changed nails.", name: "Nail Infections & Disorders", category: "Nails",
    status: "listed", bookable: true,
    priceDisplay: "On consultation", durationMin: 20, sessions: "Course-based",
    summary: "Diagnosis and treatment for fungal nail infections, brittle or discoloured nails, and nail changes linked to skin disease.",
    whoFor: "People with thickened, yellow or crumbling nails, nails separating from the bed, or painful nail folds.",
    howItWorks: "The doctor examines the nails and, where needed, confirms fungal infection before starting treatment — because not every discoloured nail is fungal. Treatment may be topical or oral, over months.",
    downtime: "None", resultsTimeline: "Nails grow slowly; healthy new nail appears over 3–6 months (longer for toenails).",
    aftercare: "Keep nails short and dry, complete the full course, and avoid sharing nail tools.",
    sideEffects: "Oral antifungals occasionally need liver monitoring; the doctor will advise if applicable.",
    contraindications: "Tell the doctor about liver disease and other medicines before oral antifungal treatment.",
    faqs: [
      { q: "Why does nail treatment take so long?", a: "Medicine protects the new nail as it grows; the damaged part must grow out, which takes months." },
      { q: "Can I apply nail polish during treatment?", a: "It is better avoided — polish hides progress and can trap moisture. Ask the doctor for your case." },
      { q: "Are dark nail lines serious?", a: "A new or changing dark band on a single nail should always be examined in person." }
    ],
    relatedProducts: []
  },
  {
    slug: "bridal-skin-package", icon: "flower", short: "A doctor-planned skin programme for your big day.", name: "Bridal / Pre-Wedding Skin Package", category: "Aesthetic",
    status: "confirm", bookable: false,
    priceDisplay: "On consultation", durationMin: 30, sessions: "Planned over 4–8 weeks",
    summary: "A doctor-planned pre-wedding skin programme over 4–8 weeks — treatments and home care sequenced safely around your date.",
    whoFor: "Brides, grooms and family members preparing for a wedding or major event who want healthy, camera-ready skin without last-minute risks.",
    howItWorks: "The doctor assesses your skin and timeline, then sequences suitable treatments — peels, medi-facials, pigmentation or acne care — finishing well before the event, with a simple home routine.",
    downtime: "Planned so that no treatment is healing on the event days.",
    resultsTimeline: "Programmes run 4–8 weeks; starting earlier gives more options and better results.",
    aftercare: "Follow the plan, avoid trying new products close to the event, and keep sunscreen daily.",
    sideEffects: "Only treatments with a safe recovery window before your date are scheduled.",
    contraindications: "Never start strong new treatments in the final 1–2 weeks before the wedding.",
    faqs: [
      { q: "When should I start?", a: "Ideally 6–8 weeks before the wedding. Even 4 weeks allows a useful, safe plan." },
      { q: "Can my mother / groom join the plan?", a: "Yes — plans are individual, and family members are commonly treated alongside." },
      { q: "Why is it 'On consultation'?", a: "The package is built around your skin and your date, so it starts with a consultation." }
    ],
    relatedProducts: ["broad-spectrum-sunscreen", "vitamin-c-serum"]
  }
];

function serviceBySlug(slug) { return SERVICES.find(s => s.slug === slug); }
function bookableServices() { return SERVICES.filter(s => s.bookable); }

/* ============================================================
   PRODUCTS — brief section 6. Showroom only, no online sale.
   Actual brands stocked are [CONFIRM]; these are the standard
   dermatologist-dispensed categories from the brief.
   rxOnly items show "Available after consultation".
   ============================================================ */
const PRODUCTS = [
  { slug: "gentle-foaming-cleanser", name: "Gentle Foaming Cleanser", category: "Cleansers", size: "150 ml",
    concerns: ["acne", "dryness"], skinTypes: ["All skin types", "Sensitive"],
    use: "Mild daily face wash that cleans without stripping — the base of most treatment routines.",
    ingredients: "Gentle surfactants, glycerin", usage: "Use morning and evening on wet skin; massage 30 seconds and rinse.",
    cautions: "Avoid very hot water; if skin feels tight after washing, tell the doctor at review.", rxOnly: false },
  { slug: "oil-free-gel-moisturiser", name: "Oil-Free Gel Moisturiser", category: "Moisturisers", size: "50 g",
    concerns: ["acne"], skinTypes: ["Oily", "Combination"],
    use: "Light hydration for oily, acne-prone skin without clogging pores.",
    ingredients: "Hyaluronic acid, niacinamide", usage: "Apply a pea-sized amount after cleansing, morning and night.",
    cautions: "Moisturiser is still needed on acne treatment — skipping it increases irritation.", rxOnly: false },
  { slug: "hydrating-cream-moisturiser", name: "Hydrating Cream Moisturiser", category: "Moisturisers", size: "100 g",
    concerns: ["dryness"], skinTypes: ["Dry", "Sensitive"],
    use: "Barrier-support cream for dry, sensitive or eczema-prone skin.",
    ingredients: "Ceramides, colloidal oatmeal", usage: "Apply liberally after bathing and whenever skin feels dry.",
    cautions: "For eczema, apply prescribed medicines first, then moisturiser, unless told otherwise.", rxOnly: false },
  { slug: "broad-spectrum-sunscreen", name: "Broad-Spectrum Sunscreen Gel SPF 50 PA+++", category: "Sunscreens", size: "50 g",
    concerns: ["pigmentation", "tanning"], skinTypes: ["All skin types"],
    use: "Daily sun protection — essential during pigmentation, peel and laser treatment.",
    ingredients: "UVA + UVB filters, antioxidants", usage: "Two finger-lengths for face and neck, 20 minutes before stepping out; reapply every 3 hours outdoors.",
    cautions: "No sunscreen replaces shade and a cap at peak hours.", rxOnly: false },
  { slug: "vitamin-c-serum", name: "Vitamin C Serum 15%", category: "Serums", size: "30 ml",
    concerns: ["pigmentation", "dullness"], skinTypes: ["Normal", "Dry", "Combination"],
    use: "Antioxidant serum for glow and to support pigmentation treatment.",
    ingredients: "L-ascorbic acid 15%, vitamin E, ferulic acid", usage: "3–4 drops in the morning before sunscreen.",
    cautions: "Mild tingling is common at first; store away from sunlight. Ask before combining with other actives.", rxOnly: false },
  { slug: "niacinamide-serum", name: "Niacinamide Serum 10%", category: "Serums", size: "30 ml",
    concerns: ["acne", "pigmentation"], skinTypes: ["Oily", "Combination", "Sensitive"],
    use: "Helps acne marks, uneven tone and oil balance; suits sensitive skin.",
    ingredients: "Niacinamide 10%, zinc PCA", usage: "Apply morning or night after cleansing, before moisturiser.",
    cautions: "Introduce one active at a time so irritation, if any, is easy to trace.", rxOnly: false },
  { slug: "anti-acne-gel", name: "Anti-Acne Treatment Gel", category: "Acne Care", size: "15 g",
    concerns: ["acne"], skinTypes: ["Oily", "Combination"],
    use: "Prescription-strength gel for active acne, dispensed after the doctor assesses your skin.",
    ingredients: "As prescribed by the doctor", usage: "Exactly as directed on your prescription — usually a pea-sized amount at night.",
    cautions: "Prescription item. Do not self-start, share, or use in pregnancy without asking the doctor.", rxOnly: true },
  { slug: "depigmenting-cream", name: "Depigmenting Treatment Cream", category: "Pigmentation Care", size: "20 g",
    concerns: ["pigmentation"], skinTypes: ["As advised"],
    use: "Targeted cream for melasma and dark patches, used in planned cycles under supervision.",
    ingredients: "As prescribed by the doctor", usage: "Apply only on the patches, exactly for the duration prescribed.",
    cautions: "Prescription item. Long unsupervised use of lightening creams can damage skin — always review on schedule.", rxOnly: true },
  { slug: "anti-hair-fall-serum", name: "Anti-Hair-Fall Scalp Serum", category: "Hair Care", size: "60 ml",
    concerns: ["hair"], skinTypes: ["All scalp types"],
    use: "Daily scalp serum that supports the hair-fall treatment plan.",
    ingredients: "Peptide and botanical actives (as per stocked brand)", usage: "Apply to the scalp once daily and massage gently; do not rinse.",
    cautions: "Results need 8–12 weeks of regular use alongside the main treatment.", rxOnly: false },
  { slug: "anti-dandruff-shampoo", name: "Anti-Dandruff Medicated Shampoo", category: "Hair Care", size: "100 ml",
    concerns: ["dandruff", "hair"], skinTypes: ["All scalp types"],
    use: "Medicated shampoo for dandruff and flaky, itchy scalp.",
    ingredients: "Ketoconazole / zinc pyrithione (as per stocked brand)", usage: "Use 2–3 times a week; leave lather on the scalp for 3–5 minutes before rinsing.",
    cautions: "Use a conditioner on hair lengths to prevent dryness.", rxOnly: false },
  { slug: "hair-skin-supplement", name: "Hair & Skin Nutritional Supplement", category: "Supplements", size: "30 tablets",
    concerns: ["hair", "dryness"], skinTypes: ["Adults"],
    use: "Biotin and micronutrient support where diet or deficiency contributes to hair fall.",
    ingredients: "Biotin, iron, zinc, amino acids (as per stocked brand)", usage: "One tablet daily after food, or as advised.",
    cautions: "Supplements support treatment; they do not replace diagnosis of the cause of hair fall.", rxOnly: false }
];

function productBySlug(slug) { return PRODUCTS.find(p => p.slug === slug); }

/* ============================================================
   TESTIMONIALS — brief section 1/8. ONLY the two published
   Practo patient stories, quoted and attributed. Do not add,
   edit or invent reviews.
   ============================================================ */
const TESTIMONIALS = [
  {
    name: "Hari Kishore", treatment: "Acne treatment", source: "Practo — verified patient story",
    quote: "I was dealing with severe acne problems and acne related scars on my face. Dr Kiranmayee was so great, within 4 months I have zero acne on my face and its been 3 months since I've stopped medication still there are no acne on my face..."
  },
  {
    name: "Chandra", treatment: "Sun spots / pigmentation", source: "Practo — verified patient story",
    quote: "Excellent, well explained with a lot of patience and knowledge and we are very satisfied with approach and treatment."
  }
];

const REVIEW_THEMES = ["Doctor friendliness", "Clear explanation", "Treatment satisfaction", "Value for money", "Short wait time"];

/* ============================================================
   ICONS — simple stroke SVGs (24×24) used by the visual card
   system. iconSvg(name, size) returns a full inline SVG.
   ============================================================ */
const ICON_PATHS = {
  "plus-circle": '<circle cx="12" cy="12" r="8.6"/><path d="M12 8.4v7.2M8.4 12h7.2"/>',
  "sparkle": '<path d="M11 4.2l1.6 4.4 4.4 1.6-4.4 1.6L11 16.2l-1.6-4.4L5 10.2l4.4-1.6z"/><path d="M18.6 15.2l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/><circle cx="5.6" cy="17.6" r="1.1"/>',
  "shield": '<path d="M12 3.4l6.6 2.6v5.3c0 4.3-2.8 7.4-6.6 9.3-3.8-1.9-6.6-5-6.6-9.3V6z"/><path d="M9 11.9l2.2 2.2 4-4.3"/>',
  "waves": '<path d="M2.5 7.5c2-2.2 4-2.2 6 0s4 2.2 6 0 4-2.2 6 0"/><path d="M2.5 12.5c2-2.2 4-2.2 6 0s4 2.2 6 0 4-2.2 6 0"/><path d="M2.5 17.5c2-2.2 4-2.2 6 0s4 2.2 6 0 4-2.2 6 0"/>',
  "activity": '<path d="M2.5 12h4l2.4-6.5 4 13L15.3 12h6.2"/>',
  "circles": '<circle cx="9.2" cy="9.8" r="5.4"/><circle cx="16.2" cy="15.4" r="4.4"/>',
  "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.3M12 18.9v2.3M2.8 12h2.3M18.9 12h2.3M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>',
  "layers": '<path d="M12 3.4l9.2 4.8-9.2 4.8L2.8 8.2z"/><path d="M3.8 13.4l8.2 4.3 8.2-4.3"/>',
  "leaf": '<path d="M5 19.2C5 10.6 11.4 4.6 20 4c.5 8.6-5.4 15.2-14 15.2z"/><path d="M5 19.2c2.4-5.6 6-9.7 10.6-12.2"/>',
  "droplet": '<path d="M12 3.4c2.8 3.8 5.6 7 5.6 10.1a5.6 5.6 0 1 1-11.2 0C6.4 10.4 9.2 7.2 12 3.4z"/>',
  "droplets": '<path d="M10.2 3.6c2.5 3.4 5 6.2 5 9a5 5 0 1 1-10 0c0-2.8 2.5-5.6 5-9z"/><path d="M17.8 13.6c1.3 1.8 2.6 3.3 2.6 4.8a2.6 2.6 0 1 1-5.2 0c0-1.5 1.3-3 2.6-4.8z"/>',
  "syringe": '<path d="M4.2 19.8l.9-3.6L14.4 6.9l2.6 2.6-9.3 9.3z"/><path d="M13.2 4.6l6.6 6.6"/><path d="M17.4 2.8l3.8 3.8"/><path d="M15.3 7.6l2.4-2.4"/>',
  "zap": '<path d="M13 2.6L4.6 13.4h6.2l-1 8L18.2 10.6h-6.2z"/>',
  "strands": '<path d="M7 3.2q-2.1 4.4 0 8.8t0 8.8"/><path d="M12 3.2q-2.1 4.4 0 8.8t0 8.8"/><path d="M17 3.2q-2.1 4.4 0 8.8t0 8.8"/>',
  "snow": '<path d="M12 3v18M4.4 7.6l15.2 8.8M19.6 7.6L4.4 16.4"/><path d="M12 3l-2 2.2M12 3l2 2.2M12 21l-2-2.2M12 21l2-2.2"/>',
  "nail": '<rect x="7.2" y="3.2" width="9.6" height="17.6" rx="4.8"/><path d="M7.4 11.5h9.2"/>',
  "flower": '<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="5.9" r="2.8"/><circle cx="17.3" cy="9.8" r="2.8"/><circle cx="15.6" cy="15.9" r="2.8"/><circle cx="8.4" cy="15.9" r="2.8"/><circle cx="6.7" cy="9.8" r="2.8"/>',
  "clock": '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.1 2"/>',
  "calendar": '<rect x="3.4" y="5" width="17.2" height="16" rx="2.6"/><path d="M3.4 10h17.2M8 2.8V6.4M16 2.8v3.6"/>',
  "check": '<path d="M4.5 12.6l5 5L19.5 6.8"/>',
  "arrow": '<path d="M4 12h14.5M13.5 6l6 6-6 6"/>',
  "pin": '<path d="M20 10.2c0 5.8-8 11.8-8 11.8s-8-6-8-11.8a8 8 0 0 1 16 0z"/><circle cx="12" cy="10.2" r="3"/>',
  "phone": '<path d="M21.5 16.9v2.9a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3.1 19.3 19.3 0 0 1-5.9-5.9A19.6 19.6 0 0 1 1.8 4.3 2 2 0 0 1 3.8 2.3h2.9a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.7 10a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 1.9z"/>',
  "cap": '<path d="M12 4.4L2.4 9 12 13.6 21.6 9z"/><path d="M6.4 11.4v4.4c0 1.5 2.5 2.9 5.6 2.9s5.6-1.4 5.6-2.9v-4.4"/><path d="M21.6 9v5.2"/>',
  "bottle": '<path d="M10 3.4h4V7l1.1 2.1c.3.6.5 1.3.5 2V19a2.2 2.2 0 0 1-2.2 2.2h-2.8A2.2 2.2 0 0 1 8.4 19v-7.9c0-.7.2-1.4.5-2L10 7z"/><path d="M8.5 14.6h7"/>',
  "jar": '<rect x="5.4" y="3.8" width="13.2" height="4" rx="1.4"/><path d="M5 7.8v10A3.4 3.4 0 0 0 8.4 21.2h7.2A3.4 3.4 0 0 0 19 17.8v-10"/>',
  "capsule": '<rect x="3.2" y="8.6" width="17.6" height="8" rx="4" transform="rotate(-28 12 12.6)"/><path d="M9.8 6.4l5.4 10.6"/>',
  "target": '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
  "star": '<path fill="currentColor" stroke="none" d="M12 2.5l2.9 6.1 6.7.9-4.9 4.7 1.2 6.6L12 17.6l-5.9 3.2 1.2-6.6L2.4 9.5l6.7-.9z"/>'
};
function iconSvg(name, size) {
  const inner = ICON_PATHS[name] || ICON_PATHS["sparkle"];
  const s = size || 24;
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
/* Five gold stars (rating displays) */
function starsHtml(n) {
  let out = "";
  for (let i = 0; i < (n || 5); i++) out += iconSvg("star", 16);
  return out;
}
/* Gradient art band tint per treatment category */
function categoryClass(category) {
  return "art-" + String(category || "skin").toLowerCase().replace(/[^a-z]/g, "");
}
function productIcon(p) {
  const byCat = { "Cleansers": "bottle", "Moisturisers": "jar", "Sunscreens": "sun", "Serums": "droplet", "Acne Care": "target", "Pigmentation Care": "sparkle", "Hair Care": "strands", "Supplements": "capsule" };
  return byCat[p.category] || "sparkle";
}

/* ============================================================
   Shared chrome: header, footer, floating WhatsApp button,
   mobile bottom bar — injected into every page.
   ============================================================ */
const WA_ICON = '<svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.3.8-1.7 1.6-2.4 1.6-.6.1-1.4.1-2.3-.2-2.6-.9-5.3-3.1-6.5-5.9-.7-1.7-.6-3.2.1-4.2.4-.6 1-.9 1.3-.9h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5-.3.6-.6.8-.4 1.2.7 1.3 1.6 2.2 3 2.9.3.2.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2 .9c.3.2.5.3.6.4 0 .1 0 .6-.2 1.2z"/></svg>';
const PHONE_ICON = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2z"/></svg>';
const PIN_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>';

function renderChrome(activePage) {
  const call = callHref();
  const wa = waHref();
  const nav = [
    ["index.html", "Home"], ["about.html", "About the Doctor"], ["treatments.html", "Treatments"],
    ["products.html", "Products"], ["reviews.html", "Reviews"], ["contact.html", "Contact"]
  ];
  const navLinks = nav.map(([href, label]) =>
    `<a href="${href}"${href === activePage ? ' aria-current="page"' : ""}>${label}</a>`).join("");

  const header = `
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="index.html" aria-label="Gathrika Skin Clinic — home">
        <span class="logo-mark" aria-hidden="true">G</span>
        <span class="logo-text"><strong>Gathrika</strong><span>Skin Clinic · Medipally</span></span>
      </a>
      <nav class="main-nav" aria-label="Main">${navLinks}</nav>
      <div class="header-actions">
        <button class="lang-toggle" id="langToggle" type="button" aria-label="Switch language to Telugu">తెలుగు</button>
        <a class="icon-btn header-call" href="${call}" aria-label="${hasPhone() ? "Call the clinic" : "Call the clinic — see contact page"}">${PHONE_ICON}</a>
        <a class="btn btn-primary header-book" href="book.html">Book Now</a>
        <button class="icon-btn nav-toggle" id="navToggle" type="button" aria-label="Open menu" aria-expanded="false">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobileNav" aria-label="Mobile">${navLinks}</nav>
  </header>`;

  const footer = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h3>Gathrika Skin Clinic</h3>
          <p>${CLINIC.addressLines.join("<br>")}</p>
          ${hasPhone() ? `<p>Call / WhatsApp: <a href="${callHref()}">${phoneDisplay()}</a></p>` : ""}
          <p><a href="${mapsDirUrl()}" target="_blank" rel="noopener">Get directions</a></p>
          <p class="small">${CLINIC.doctor} (${CLINIC.qualifications})<br>${CLINIC.registration}</p>
        </div>
        <div>
          <h4>Clinic hours</h4>
          <ul>
            <li>Mon – Sat: 11 AM – 1 PM</li>
            <li>Mon – Sat: 5 PM – 8 PM</li>
            <li>Sunday: Closed</li>
          </ul>
          <p class="small">Consultation: Rs ${CLINIC.consultFee} · Est. ${CLINIC.established}</p>
        </div>
        <div>
          <h4>Quick links</h4>
          <ul>
            <li><a href="book.html">Book an appointment</a></li>
            <li><a href="treatments.html">Treatments</a></li>
            <li><a href="products.html">Products</a></li>
            <li><a href="reviews.html">Reviews</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-legal">
        <p>© 2026 Gathrika Skin Clinic. Website information is for general awareness — not a substitute for an in-person consultation. · <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a> · <a href="disclaimer.html">Disclaimer</a></p>
        <p class="small"><img class="studio-mark" src="studio-logo.png" alt="Sharma Digital Studio logo">Website by Sharma Digital Studio · <a href="admin.html">Clinic login</a></p>
      </div>
    </div>
  </footer>
  <a class="float-wa" href="${wa}" ${hasWhatsApp() ? 'target="_blank" rel="noopener"' : ""} aria-label="${hasWhatsApp() ? "Chat with the clinic on WhatsApp" : "Chat with the clinic — see contact page"}">${WA_ICON}</a>
  <nav class="mobile-bar" aria-label="Quick actions">
    <a href="${call}">${PHONE_ICON}<span>Call</span></a>
    <a href="${wa}" ${hasWhatsApp() ? 'target="_blank" rel="noopener"' : ""}>${WA_ICON.replace('width="26" height="26"', 'width="20" height="20"').replace('fill="#fff"', 'fill="currentColor"')}<span>WhatsApp</span></a>
    <a class="book-link" href="book.html"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.4" y="5" width="17.2" height="16" rx="2.6"/><path d="M3.4 10h17.2M8 2.8V6.4M16 2.8v3.6"/></svg><span>Book</span></a>
    <a href="${mapsDirUrl()}" target="_blank" rel="noopener">${PIN_ICON}<span>Directions</span></a>
  </nav>`;

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);

  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  navToggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* EN / తెలుగు toggle for key strings marked with data-te */
  const langToggle = document.getElementById("langToggle");
  let telugu = false;
  langToggle.addEventListener("click", () => {
    telugu = !telugu;
    document.querySelectorAll("[data-te]").forEach(el => {
      if (!el.dataset.en) el.dataset.en = el.textContent;
      el.textContent = telugu ? el.dataset.te : el.dataset.en;
      if (telugu) el.setAttribute("lang", "te"); else el.removeAttribute("lang");
    });
    langToggle.textContent = telugu ? "English" : "తెలుగు";
  });

  /* Subtle reveal on scroll, respecting reduced motion.
     A timeout fallback guarantees content is never left hidden.
     Pages inject cards after the chrome renders, so a
     MutationObserver picks up .reveal elements added later. */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    const watchReveal = el => { if (el && !el.classList.contains("in")) io.observe(el); };
    document.querySelectorAll(".reveal").forEach(watchReveal);
    new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.classList && n.classList.contains("reveal")) watchReveal(n);
        if (n.querySelectorAll) n.querySelectorAll(".reveal").forEach(watchReveal);
      }));
    }).observe(document.body, { childList: true, subtree: true });
    setTimeout(() => document.querySelectorAll(".reveal").forEach(el => el.classList.add("in")), 3000);
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
  }
}

/* Small helper used across pages for status chips */
function statusChip(service) {
  return service.status === "listed"
    ? '<span class="chip">Available</span>'
    : '<span class="chip chip-consult">On consultation</span>';
}
