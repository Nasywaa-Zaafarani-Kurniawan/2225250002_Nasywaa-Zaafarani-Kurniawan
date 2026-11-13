/* =========================================================
   PHYNthagoras — pasang sebagai aplikasi (PWA)
   1. Daftarkan service worker (supaya bisa dibuka offline)
   2. Tombol [data-pasang] "Download App":
      - Chrome/Edge/Android: munculkan dialog pasang bawaan browser
      - iPhone/iPad & browser lain: tampilkan panduan langkah demi langkah
   3. Sembunyikan tombol kalau aplikasi sudah terpasang
   4. "Web sedang diupdate": saat versi baru di-push, tampilkan
      pemberitahuan lalu muat versi terbaru secara otomatis
   ========================================================= */
(function () {
    // 1. Service worker + pemeriksa versi baru
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
        // apakah halaman ini sudah dikendalikan versi lama? (bukan kunjungan pertama)
        const adaVersiLama = Boolean(navigator.serviceWorker.controller);

        window.addEventListener("load", async () => {
            let reg;
            try { reg = await navigator.serviceWorker.register("sw.js"); } catch (e) { return; }

            // periksa versi baru setiap 60 detik dan setiap tab dibuka lagi
            const periksa = () => reg.update().catch(() => { /* offline: abaikan */ });
            setInterval(periksa, 60 * 1000);
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "visible") periksa();
            });
            window.PhynCekUpdate = periksa;
        });

        // versi baru sudah aktif → tampilkan pemberitahuan lalu muat ulang
        let sudahDitangani = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (!adaVersiLama || sudahDitangani) return;
            sudahDitangani = true;
            pemberitahuanUpdate();
        });
    }

    // setelah dimuat ulang karena update, beri tahu bahwa web sudah terbaru
    window.addEventListener("load", () => {
        try {
            if (sessionStorage.getItem("phyn-baru-diupdate")) {
                sessionStorage.removeItem("phyn-baru-diupdate");
                notif("✅ Web sudah diperbarui ke versi terbaru!");
            }
        } catch (e) { /* abaikan */ }
    });

    const html = document.documentElement;
    const sudahTerpasang = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (sudahTerpasang) html.classList.add("sudah-terpasang");

    // gaya tombol tersembunyi + jendela panduan
    const gaya = document.createElement("style");
    gaya.textContent = `
        html.sudah-terpasang [data-pasang] { display: none !important; }
        .panduan-pasang {
            position: fixed; inset: 0; z-index: 90;
            display: grid; place-items: center; padding: 16px;
            background: #2b1d1e99; backdrop-filter: blur(4px);
            font-family: "Plus Jakarta Sans", Arial, sans-serif;
            animation: pasang-muncul .25s ease;
        }
        .panduan-pasang[hidden] { display: none; }
        .panduan-kotak {
            width: min(440px, 100%); max-height: 90vh; overflow-y: auto;
            padding: 26px; border: 2.5px solid #2b1d1e; border-radius: 26px;
            background: #fcf9f3; color: #2b1d1e; box-shadow: 6px 6px 0 #2b1d1e;
        }
        .panduan-kepala { display: flex; align-items: center; gap: 14px; }
        .panduan-kepala img { width: 60px; height: 60px; border-radius: 16px; }
        .panduan-kepala h2 { margin: 0; font-size: 21px; }
        .panduan-kepala p { margin: 2px 0 0; font-size: 14px; color: #7a6a66; }
        .panduan-kotak ol { margin: 18px 0 0; padding: 0; list-style: none; counter-reset: l; }
        .panduan-kotak li {
            counter-increment: l; position: relative; margin-bottom: 10px;
            padding: 12px 14px 12px 50px; border-radius: 14px; background: #f7f2e8; line-height: 1.5;
        }
        .panduan-kotak li::before {
            content: counter(l); position: absolute; left: 12px; top: 11px;
            display: grid; place-items: center; width: 26px; height: 26px;
            border-radius: 8px; background: #7d2027; color: #fcf9f3; font-weight: 800; font-size: 13px;
        }
        .panduan-kotak .lambang {
            display: inline-grid; place-items: center; min-width: 26px; height: 26px; padding: 0 6px;
            border: 1.5px solid #2b1d1e; border-radius: 8px; background: #fff; font-weight: 800;
        }
        .panduan-untung { margin: 14px 0 0; font-size: 14px; color: #7a6a66; }
        .panduan-tutup {
            width: 100%; margin-top: 16px; padding: 13px; border: 2.5px solid #2b1d1e; border-radius: 14px;
            background: #7d2027; color: #fcf9f3; font: 800 16px "Plus Jakarta Sans", Arial, sans-serif;
            box-shadow: 3px 3px 0 #2b1d1e; cursor: pointer;
        }
        .pasang-notif {
            position: fixed; left: 50%; bottom: 24px; z-index: 95; transform: translateX(-50%);
            padding: 12px 18px; border: 2px solid #2b1d1e; border-radius: 14px;
            background: #b9dcae; color: #2b1d1e; font: 700 15px "Plus Jakarta Sans", Arial, sans-serif;
            box-shadow: 3px 3px 0 #2b1d1e; animation: pasang-muncul .3s ease;
        }
        .pita-update {
            position: fixed; left: 50%; top: 14px; z-index: 96; transform: translateX(-50%);
            display: flex; align-items: center; gap: 10px; max-width: calc(100% - 24px);
            padding: 11px 18px; border: 2px solid #2b1d1e; border-radius: 999px;
            background: #f4d58d; color: #2b1d1e; box-shadow: 3px 3px 0 #2b1d1e;
            font: 800 15px "Plus Jakarta Sans", Arial, sans-serif;
        }
        .pita-update button {
            padding: 5px 12px; border: 2px solid #2b1d1e; border-radius: 999px;
            background: #7d2027; color: #fcf9f3; font: 800 13px "Plus Jakarta Sans", Arial, sans-serif; cursor: pointer;
        }
        .pita-update .putar { display: inline-block; animation: pita-putar 1s linear infinite; }
        @keyframes pita-putar { to { transform: rotate(360deg); } }
        @keyframes pasang-muncul { from { opacity: 0; transform: translateY(8px); } }
        .pasang-notif { animation-name: none; }`;
    document.head.appendChild(gaya);

    // 2. Tangkap dialog pasang bawaan browser (Chrome, Edge, Android)
    let dialogPasang = null;
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        dialogPasang = e;
    });

    window.addEventListener("appinstalled", () => {
        html.classList.add("sudah-terpasang");
        dialogPasang = null;
        notif("🎉 PHYNthagoras berhasil dipasang! Cek ikonnya di layar utama.");
    });

    // Pemberitahuan "Web sedang diupdate"
    function sedangSibuk() {
        // jangan muat ulang paksa saat siswa sedang mengerjakan soal atau mencoret
        const coretan = document.getElementById("coretan");
        return document.body.classList.contains("arena-terbuka") || (coretan && !coretan.hidden);
    }

    function muatUlang() {
        try { sessionStorage.setItem("phyn-baru-diupdate", "1"); } catch (e) { /* abaikan */ }
        location.reload();
    }

    function pemberitahuanUpdate() {
        const pita = document.createElement("div");
        pita.className = "pita-update";
        pita.setAttribute("role", "status");
        if (sedangSibuk()) {
            pita.innerHTML = `<span class="putar">🔄</span> Web sedang diupdate. Selesaikan dulu, lalu
                <button type="button">Muat ulang</button>`;
            pita.querySelector("button").addEventListener("click", muatUlang);
        } else {
            pita.innerHTML = `<span class="putar">🔄</span> Web sedang diupdate… sebentar, ya`;
            setTimeout(muatUlang, 1800);
        }
        document.body.appendChild(pita);
    }

    function notif(teks) {
        const n = document.createElement("div");
        n.className = "pasang-notif";
        n.textContent = teks;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 4000);
    }

    const ua = navigator.userAgent;
    const iOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const android = /android/i.test(ua);

    function langkahPanduan() {
        if (iOS) {
            return `
                <li>Buka web ini di <b>Safari</b>.</li>
                <li>Ketuk tombol <b>Bagikan</b> <span class="lambang">⬆︎</span> di bagian bawah layar.</li>
                <li>Geser ke bawah, lalu pilih <b>Tambahkan ke Layar Utama</b> <span class="lambang">＋</span>.</li>
                <li>Ketuk <b>Tambah</b>. Ikon PHYNthagoras muncul di layar utama 🎉</li>`;
        }
        if (android) {
            return `
                <li>Buka web ini di <b>Chrome</b>.</li>
                <li>Ketuk menu <span class="lambang">⋮</span> di pojok kanan atas.</li>
                <li>Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.</li>
                <li>Ketuk <b>Instal</b>. Ikon PHYNthagoras muncul di layar utama 🎉</li>`;
        }
        return `
            <li>Buka web ini di <b>Google Chrome</b> atau <b>Microsoft Edge</b>.</li>
            <li>Klik ikon pasang <span class="lambang">⊕</span> di ujung kanan kolom alamat,
                atau buka menu <span class="lambang">⋮</span> lalu pilih <b>Instal PHYNthagoras</b>.</li>
            <li>Klik <b>Instal</b>. Aplikasi terbuka di jendela sendiri dan muncul di menu Start/Desktop 🎉</li>`;
    }

    function tampilkanPanduan() {
        let panel = document.getElementById("panduan-pasang");
        if (!panel) {
            panel = document.createElement("div");
            panel.id = "panduan-pasang";
            panel.className = "panduan-pasang";
            panel.setAttribute("role", "dialog");
            panel.setAttribute("aria-modal", "true");
            panel.addEventListener("click", (e) => { if (e.target === panel) panel.hidden = true; });
            document.body.appendChild(panel);
        }
        panel.innerHTML = `
            <div class="panduan-kotak">
                <div class="panduan-kepala">
                    <img src="static/ikon/ikon-192.png" alt="">
                    <div>
                        <h2>Pasang PHYNthagoras</h2>
                        <p>Gratis · tanpa Play Store · ringan</p>
                    </div>
                </div>
                <ol>${langkahPanduan()}</ol>
                <p class="panduan-untung">✨ Setelah dipasang, PHYNthagoras bisa dibuka seperti aplikasi biasa, bahkan saat tidak ada internet.</p>
                <button type="button" class="panduan-tutup">Oke, mengerti!</button>
            </div>`;
        panel.hidden = false;
        panel.querySelector(".panduan-tutup").addEventListener("click", () => (panel.hidden = true));
        panel.querySelector(".panduan-tutup").focus();
    }

    document.addEventListener("keydown", (e) => {
        const panel = document.getElementById("panduan-pasang");
        if (e.key === "Escape" && panel && !panel.hidden) panel.hidden = true;
    });

    document.addEventListener("click", async (e) => {
        const tombol = e.target.closest("[data-pasang]");
        if (!tombol) return;
        e.preventDefault();
        if (dialogPasang) {
            dialogPasang.prompt();
            const pilihan = await dialogPasang.userChoice;
            dialogPasang = null;
            if (pilihan.outcome !== "accepted") notif("Oke! Kamu bisa memasangnya kapan saja lewat tombol ini.");
        } else {
            tampilkanPanduan();
        }
    });
})();
