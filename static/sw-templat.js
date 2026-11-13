/* =========================================================
   Service worker PHYNthagoras
   Menyimpan semua halaman supaya aplikasi bisa dibuka tanpa internet.
   File ini adalah templat: app.py mengisi nomor versi dan daftar berkas.
   ========================================================= */
const VERSI = "__VERSI__";
const CACHE = "phyn-" + VERSI;
const BERKAS = __BERKAS__;

// Pasang: simpan semua berkas ke cache
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(BERKAS))
            .then(() => self.skipWaiting())
    );
});

// Aktif: hapus cache versi lama
self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys()
            .then((kunci) => Promise.all(
                kunci.filter((k) => k.startsWith("phyn-") && k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

function simpanKeCache(permintaan, respons) {
    if (respons && respons.ok) {
        const salinan = respons.clone();
        caches.open(CACHE).then((cache) => cache.put(permintaan, salinan));
    }
    return respons;
}

self.addEventListener("fetch", (e) => {
    const permintaan = e.request;
    if (permintaan.method !== "GET") return;
    const url = new URL(permintaan.url);

    // Halaman: coba internet dulu (supaya selalu terbaru), kalau offline pakai cache
    if (permintaan.mode === "navigate") {
        e.respondWith(
            fetch(permintaan)
                .then((r) => simpanKeCache(permintaan, r))
                .catch(() => caches.match(permintaan).then((r) => r || caches.match("./")))
        );
        return;
    }

    // File di web ini (CSS, JS, gambar): pakai cache dulu, kalau belum ada ambil dari internet
    if (url.origin === self.location.origin) {
        e.respondWith(
            caches.match(permintaan).then((r) => r || fetch(permintaan).then((x) => simpanKeCache(permintaan, x)))
        );
        return;
    }

    // Font Google & SDK Firebase: pakai cache, sambil memperbarui di belakang layar
    // (login & penyimpanan Firebase TIDAK boleh di-cache, jadi domainnya dibatasi)
    if (["fonts.googleapis.com", "fonts.gstatic.com", "www.gstatic.com"].includes(url.hostname)) {
        e.respondWith(
            caches.match(permintaan).then((tersimpan) => {
                const dariInternet = fetch(permintaan).then((x) => {
                    const salinan = x.clone();
                    caches.open(CACHE).then((cache) => cache.put(permintaan, salinan));
                    return x;
                }).catch(() => tersimpan);
                return tersimpan || dariInternet;
            })
        );
    }
});
