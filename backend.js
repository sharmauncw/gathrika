/* ============================================================
   Gathrika Skin Clinic — backend.js
   ONE shared Supabase client for the whole site.
   Include AFTER the supabase-js CDN script and data.js:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="data.js"></script>
     <script src="backend.js"></script>
   Exposes window.sb (the client) and window.sbReady (bool).
   If the CDN or network is unavailable, sbReady is false and
   pages must degrade honestly — never fake a saved booking.
   ============================================================ */
(function () {
  window.sb = null;
  window.sbReady = false;
  try {
    if (window.supabase && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY) {
      window.sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
      window.sbReady = true;
    }
  } catch (e) {
    window.sb = null;
    window.sbReady = false;
  }
})();
