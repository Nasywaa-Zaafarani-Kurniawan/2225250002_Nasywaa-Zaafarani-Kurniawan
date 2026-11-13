/* =========================================================
   Service worker PHYNthagoras
   Menyimpan semua halaman supaya aplikasi bisa dibuka tanpa internet.
   File ini adalah templat: app.py mengisi nomor versi dan daftar berkas.
   ========================================================= */
const VERSI = "c6c2ce10f2";
const CACHE = "phyn-" + VERSI;
const BERKAS = [
    "./",
    "beranda.html",
    "materi.html",
    "contoh.html",
    "latihan.html",
    "manifest.webmanifest",
    "materi-prasyarat.html",
    "materi-segitiga-siku.html",
    "materi-menemukan-teorema.html",
    "materi-menghitung-sisi.html",
    "materi-jenis-segitiga.html",
    "materi-tripel.html",
    "materi-segitiga-istimewa.html",
    "materi-bangun-gabungan.html",
    "materi-penerapan.html",
    "contoh-kuadrat-akar.html",
    "contoh-mencari-sisi.html",
    "contoh-jenis-tripel.html",
    "contoh-istimewa.html",
    "contoh-bangun.html",
    "contoh-cerita.html",
    "contoh-koordinat.html",
    "gambar/segitiga.svg",
    "gambar/persegi.svg",
    "gambar/tangga.svg",
    "static/beranda.css",
    "static/beranda.js",
    "static/contoh.css",
    "static/hujan.js",
    "static/ikon/ikon-180.png",
    "static/ikon/ikon-192.png",
    "static/ikon/ikon-512.png",
    "static/ikon/ikon-maskable-512.png",
    "static/ikon/ikon-maskable.svg",
    "static/ikon/ikon.svg",
    "static/jejak.js",
    "static/landing.css",
    "static/latihan.css",
    "static/latihan.js",
    "static/manifest.webmanifest",
    "static/materi.css",
    "static/materi.js",
    "static/pasang.js",
    "static/style.css",
    "static/sw-templat.js"
];

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

    // Font Google: pakai cache, sambil memperbarui di belakang layar
    if (url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com")) {
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
