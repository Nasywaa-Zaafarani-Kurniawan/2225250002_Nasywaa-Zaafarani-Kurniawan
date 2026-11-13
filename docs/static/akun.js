/* =========================================================
   PHYNthagoras — akun siswa (progres tersimpan online)

   - Setiap siswa masuk dengan akunnya sendiri (Google / email).
   - Progres disimpan di Firestore: progres/{uid}. Aturan Firestore
     membuat setiap siswa HANYA bisa membaca & mengubah miliknya sendiri.
   - Saat keluar, progres di perangkat ini dihapus agar siswa berikutnya
     yang memakai perangkat yang sama tidak tercampur.
   - Tanpa konfigurasi (firebase-config.js kosong), fitur ini mati dan
     web tetap berjalan dengan progres di browser saja.
   ========================================================= */

const VERSI_SDK = "10.12.2";
const cfg = window.PHYN_FIREBASE || {};
const AKTIF = Boolean(cfg.apiKey && cfg.projectId);
const G = window.PhynGabung;
const KUNCI_PEMILIK = "phyn-pemilik";

let auth = null, db = null, fb = {};
let pengguna = null;
let menulisSendiri = false;
let waktuSimpan = null;

/* ---------- Gaya ---------- */
const gaya = document.createElement("style");
gaya.textContent = `
    .slot-akun { position: relative; }
    .chip-akun {
        display: inline-flex; align-items: center; gap: 6px; max-width: 190px;
        padding: 7px 14px; border: 1.5px solid var(--merah, #7d2027); border-radius: 999px;
        background: var(--krem-terang, #fcf9f3); color: var(--merah, #7d2027);
        font: 700 14px "Plus Jakarta Sans", Arial, sans-serif; cursor: pointer;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .chip-akun.masuk { background: var(--merah, #7d2027); color: #fcf9f3; }
    .menu-akun {
        position: absolute; right: 0; top: calc(100% + 8px); z-index: 60; width: 250px;
        padding: 14px; border: 2px solid #2b1d1e; border-radius: 16px; background: #fcf9f3;
        box-shadow: 4px 4px 0 #2b1d1e; font: 500 14px "Plus Jakarta Sans", Arial, sans-serif; color: #2b1d1e;
    }
    .menu-akun[hidden] { display: none; }
    .menu-akun strong { display: block; font-size: 15px; }
    .menu-akun small { display: block; color: #7a6a66; word-break: break-all; }
    .menu-akun .status-awan { margin: 10px 0; padding: 8px 10px; border-radius: 10px; background: #e3efdf; font-size: 13px; }
    .menu-akun button {
        width: 100%; padding: 9px; border: 1.5px solid #2b1d1e; border-radius: 10px;
        background: #fff; font: 700 14px "Plus Jakarta Sans", Arial, sans-serif; cursor: pointer;
    }
    .modal-akun {
        position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 16px;
        background: #2b1d1e99; backdrop-filter: blur(4px); font-family: "Plus Jakarta Sans", Arial, sans-serif;
    }
    .modal-akun[hidden] { display: none; }
    .kotak-akun {
        width: min(420px, 100%); max-height: 92vh; overflow-y: auto; padding: 26px;
        border: 2.5px solid #2b1d1e; border-radius: 24px; background: #fcf9f3; color: #2b1d1e;
        box-shadow: 6px 6px 0 #2b1d1e;
    }
    .kotak-akun h2 { margin: 0 0 6px; font-size: 22px; }
    .kotak-akun p { margin: 0 0 14px; font-size: 14px; color: #7a6a66; line-height: 1.55; }
    .kotak-akun .tombol-google, .kotak-akun .tombol-kirim, .kotak-akun .tombol-tutup {
        width: 100%; padding: 12px; border: 2px solid #2b1d1e; border-radius: 12px;
        font: 800 15px "Plus Jakarta Sans", Arial, sans-serif; cursor: pointer;
    }
    .kotak-akun .tombol-google { background: #fff; color: #2b1d1e; }
    .kotak-akun .tombol-kirim { background: #7d2027; color: #fcf9f3; box-shadow: 3px 3px 0 #2b1d1e; }
    .kotak-akun .tombol-tutup { margin-top: 10px; background: transparent; border-color: transparent; color: #7a6a66; }
    .kotak-akun .pemisah { display: flex; align-items: center; gap: 10px; margin: 16px 0; color: #7a6a66; font-size: 13px; }
    .kotak-akun .pemisah::before, .kotak-akun .pemisah::after { content: ""; flex: 1; border-top: 1px solid #e8dfd0; }
    .kotak-akun .tab-akun { display: flex; gap: 6px; margin-bottom: 12px; padding: 4px; border-radius: 12px; background: #f7f2e8; }
    .kotak-akun .tab-akun button {
        flex: 1; padding: 8px; border: none; border-radius: 9px; background: transparent;
        font: 700 14px "Plus Jakarta Sans", Arial, sans-serif; cursor: pointer; color: #2b1d1e;
    }
    .kotak-akun .tab-akun button.aktif { background: #2b1d1e; color: #f4d58d; }
    .kotak-akun label { display: block; margin-bottom: 10px; font-size: 13px; font-weight: 700; color: #7a6a66; }
    .kotak-akun input {
        width: 100%; margin-top: 4px; padding: 11px 12px; border: 1.5px solid #e8dfd0; border-radius: 10px;
        background: #fff; font: 600 15px "Plus Jakarta Sans", Arial, sans-serif; color: #2b1d1e; box-sizing: border-box;
    }
    .kotak-akun input:focus { outline: 2px solid #7d2027; }
    .kotak-akun .pesan-akun { min-height: 20px; margin: 4px 0 10px; font-size: 13px; font-weight: 600; color: #b0232b; }
    .kotak-akun .catatan-privasi { margin: 14px 0 0; font-size: 12px; }
`;
document.head.appendChild(gaya);

/* ---------- Tampilan tombol akun ---------- */
function namaTampil() {
    if (!pengguna) return "";
    let nama = "";
    try { nama = JSON.parse(localStorage.getItem("phyn-nama") || '""'); } catch (e) { nama = ""; }
    return nama || (pengguna.displayName || "").split(" ")[0] || (pengguna.email || "").split("@")[0] || "Akun";
}

function gambarChip() {
    const slot = document.getElementById("akun-slot");
    if (slot) {
        if (pengguna) {
            const jam = waktuSimpan ? waktuSimpan.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";
            slot.innerHTML = `
                <button type="button" class="chip-akun" id="chip-akun" aria-haspopup="true">☁️ ${namaTampil()}</button>
                <div class="menu-akun" id="menu-akun" hidden>
                    <strong>${pengguna.displayName || namaTampil()}</strong>
                    <small>${pengguna.email || ""}</small>
                    <div class="status-awan">✅ Progres tersimpan di akunmu${jam ? ` · terakhir ${jam}` : ""}</div>
                    <button type="button" id="tombol-keluar">Keluar</button>
                </div>`;
            document.getElementById("chip-akun").addEventListener("click", (e) => {
                e.stopPropagation();
                const m = document.getElementById("menu-akun");
                m.hidden = !m.hidden;
            });
            document.getElementById("tombol-keluar").addEventListener("click", keluar);
        } else {
            slot.innerHTML = `<button type="button" class="chip-akun masuk" data-akun-buka>👤 Masuk</button>`;
        }
    }

    // teks ajakan di halaman (Beranda, Latihan)
    document.querySelectorAll("[data-akun-status]").forEach((el) => {
        el.textContent = pengguna
            ? `☁️ Progres tersimpan di akun ${namaTampil()}`
            : "☁️ Masuk supaya progresmu tidak hilang";
    });
}

document.addEventListener("click", (e) => {
    const m = document.getElementById("menu-akun");
    if (m && !m.hidden && !e.target.closest(".slot-akun")) m.hidden = true;

    const pemicu = e.target.closest("[data-akun-buka]");
    if (!pemicu) return;
    e.preventDefault();
    if (pengguna) {
        const menu = document.getElementById("menu-akun");
        if (menu) { menu.hidden = false; e.stopPropagation(); menu.scrollIntoView({ block: "nearest" }); }
        return;
    }
    bukaModal();
});

/* ---------- Jendela masuk / daftar ---------- */
let mode = "masuk";

function bukaModal() {
    let modal = document.getElementById("modal-akun");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-akun";
        modal.className = "modal-akun";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
        document.body.appendChild(modal);
    }

    if (!AKTIF) {
        modal.innerHTML = `
            <div class="kotak-akun">
                <h2>☁️ Akun belum aktif</h2>
                <p>Fitur menyimpan progres ke akun belum diaktifkan oleh pengelola web.
                   Untuk sementara, progresmu tersimpan di browser ini.</p>
                <button type="button" class="tombol-kirim" data-tutup>Oke</button>
            </div>`;
    } else {
        modal.innerHTML = `
            <div class="kotak-akun">
                <h2>☁️ Simpan progresmu</h2>
                <p>Masuk supaya bintang, skor, level, dan materi yang sudah kamu buka
                   <b>tidak hilang</b> dan bisa dilanjutkan di HP atau laptop lain.</p>
                <button type="button" class="tombol-google" id="masuk-google">
                    <span style="color:#4285f4">G</span> Masuk dengan Google
                </button>
                <div class="pemisah">atau pakai email</div>
                <div class="tab-akun">
                    <button type="button" data-mode="masuk" class="${mode === "masuk" ? "aktif" : ""}">Masuk</button>
                    <button type="button" data-mode="daftar" class="${mode === "daftar" ? "aktif" : ""}">Daftar baru</button>
                </div>
                <form id="form-akun">
                    ${mode === "daftar" ? `<label>Nama panggilan<input type="text" id="akun-nama" maxlength="20" autocomplete="nickname" required></label>` : ""}
                    <label>Email<input type="email" id="akun-email" autocomplete="email" required></label>
                    <label>Kata sandi (minimal 6 karakter)<input type="password" id="akun-sandi" minlength="6" autocomplete="${mode === "daftar" ? "new-password" : "current-password"}" required></label>
                    <p class="pesan-akun" id="pesan-akun" aria-live="polite"></p>
                    <button type="submit" class="tombol-kirim">${mode === "daftar" ? "Buat akun" : "Masuk"}</button>
                </form>
                <p class="catatan-privasi">Yang disimpan hanya progres belajarmu. Setiap siswa hanya bisa melihat progresnya sendiri.</p>
                <button type="button" class="tombol-tutup" data-tutup>Nanti saja</button>
            </div>`;

        modal.querySelector("#masuk-google").addEventListener("click", masukGoogle);
        modal.querySelectorAll(".tab-akun button").forEach((t) =>
            t.addEventListener("click", () => { mode = t.dataset.mode; bukaModal(); }));
        modal.querySelector("#form-akun").addEventListener("submit", kirimEmail);
    }

    modal.querySelectorAll("[data-tutup]").forEach((t) => t.addEventListener("click", () => (modal.hidden = true)));
    modal.hidden = false;
}

function tutupModal() {
    const modal = document.getElementById("modal-akun");
    if (modal) modal.hidden = true;
}

function pesanGalat(err) {
    const kode = (err && err.code) || "";
    const daftar = {
        "auth/invalid-credential": "Email atau kata sandi salah.",
        "auth/wrong-password": "Kata sandi salah.",
        "auth/user-not-found": "Akun dengan email ini belum terdaftar. Pilih “Daftar baru”.",
        "auth/email-already-in-use": "Email ini sudah terdaftar. Pilih “Masuk”.",
        "auth/weak-password": "Kata sandi minimal 6 karakter.",
        "auth/invalid-email": "Format email belum benar.",
        "auth/too-many-requests": "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.",
        "auth/network-request-failed": "Tidak ada koneksi internet.",
        "auth/popup-closed-by-user": "Jendela login ditutup sebelum selesai.",
        "auth/unauthorized-domain": "Domain web ini belum diizinkan di pengaturan Firebase.",
    };
    return daftar[kode] || "Terjadi kesalahan. Coba lagi, ya.";
}

function tampilPesan(teks) {
    const el = document.getElementById("pesan-akun");
    if (el) el.textContent = teks;
}

async function masukGoogle() {
    const penyedia = new fb.GoogleAuthProvider();
    try {
        await fb.signInWithPopup(auth, penyedia);
        tutupModal();
    } catch (err) {
        if (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-this-environment") {
            await fb.signInWithRedirect(auth, penyedia);   // misalnya di aplikasi yang terpasang
            return;
        }
        tampilPesan(pesanGalat(err));
    }
}

async function kirimEmail(e) {
    e.preventDefault();
    const email = document.getElementById("akun-email").value.trim();
    const sandi = document.getElementById("akun-sandi").value;
    tampilPesan("");
    try {
        if (mode === "daftar") {
            const nama = document.getElementById("akun-nama").value.trim().slice(0, 20);
            const hasil = await fb.createUserWithEmailAndPassword(auth, email, sandi);
            if (nama) {
                await fb.updateProfile(hasil.user, { displayName: nama });
                menulisSendiri = true;
                localStorage.setItem("phyn-nama", JSON.stringify(nama));
                menulisSendiri = false;
            }
        } else {
            await fb.signInWithEmailAndPassword(auth, email, sandi);
        }
        tutupModal();
    } catch (err) {
        tampilPesan(pesanGalat(err));
    }
}

/* ---------- Sinkronisasi progres ---------- */
function refDoc() {
    return fb.doc(db, "progres", pengguna.uid);
}

async function unggah() {
    if (!pengguna || localStorage.getItem(KUNCI_PEMILIK) !== pengguna.uid) return;
    const data = G.bacaLokal();
    const jejak = JSON.stringify(data);
    if (sessionStorage.getItem("phyn-terunggah") === jejak) return;   // tidak ada perubahan
    try {
        await fb.setDoc(refDoc(), { data, diperbarui: fb.serverTimestamp() });
        sessionStorage.setItem("phyn-terunggah", jejak);
        waktuSimpan = new Date();
        gambarChip();
    } catch (err) {
        console.warn("Progres belum tersimpan ke akun:", err);
    }
}

let jedaUnggah = null;
function jadwalUnggah() {
    clearTimeout(jedaUnggah);
    jedaUnggah = setTimeout(unggah, 1200);
}

// setiap kali progres berubah di halaman mana pun, jadwalkan simpan ke akun
const setAsli = Storage.prototype.setItem;
Storage.prototype.setItem = function (k, v) {
    setAsli.call(this, k, v);
    if (this === window.localStorage && !menulisSendiri && pengguna && G.KUNCI.includes(k)) jadwalUnggah();
};
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") unggah(); });

async function sinkronAwal() {
    const snap = await fb.getDoc(refDoc());
    const awan = snap.exists() ? (snap.data().data || {}) : {};

    // progres milik akun LAIN yang tertinggal di perangkat ini tidak boleh ikut tercampur
    const pemilik = localStorage.getItem(KUNCI_PEMILIK);
    const lokal = pemilik && pemilik !== pengguna.uid ? {} : G.bacaLokal();

    const gabungan = G.gabung(lokal, awan);
    if (!gabungan["phyn-nama"] && pengguna.displayName) {
        gabungan["phyn-nama"] = pengguna.displayName.split(" ")[0].slice(0, 20);
    }

    const sebelum = JSON.stringify(G.bacaLokal());
    menulisSendiri = true;
    G.tulisLokal(gabungan);
    setAsli.call(localStorage, KUNCI_PEMILIK, pengguna.uid);
    menulisSendiri = false;

    await fb.setDoc(refDoc(), { data: gabungan, diperbarui: fb.serverTimestamp() });
    sessionStorage.setItem("phyn-terunggah", JSON.stringify(gabungan));
    sessionStorage.setItem("phyn-sinkron", pengguna.uid);
    waktuSimpan = new Date();

    // muat ulang halaman supaya angka progres di layar ikut diperbarui
    if (JSON.stringify(G.bacaLokal()) !== sebelum) location.reload();
}

async function keluar() {
    await unggah();
    await fb.signOut(auth);
    // bersihkan progres di perangkat ini agar tidak tercampur dengan siswa berikutnya
    G.hapusLokal();
    localStorage.removeItem(KUNCI_PEMILIK);
    sessionStorage.removeItem("phyn-sinkron");
    sessionStorage.removeItem("phyn-terunggah");
    location.reload();
}

/* ---------- Mulai ---------- */
async function mulai() {
    gambarChip();
    if (!AKTIF) return;

    const url = (m) => `https://www.gstatic.com/firebasejs/${VERSI_SDK}/firebase-${m}.js`;
    try {
        const [app, a, f] = await Promise.all([import(url("app")), import(url("auth")), import(url("firestore"))]);
        fb = { ...a, ...f };
        const aplikasi = app.initializeApp(cfg);
        auth = a.getAuth(aplikasi);
        db = f.getFirestore(aplikasi);
    } catch (err) {
        console.warn("Fitur akun tidak bisa dimuat (mungkin sedang offline).", err);
        return;
    }

    fb.onAuthStateChanged(auth, async (u) => {
        pengguna = u;
        if (u) {
            try {
                if (sessionStorage.getItem("phyn-sinkron") !== u.uid) await sinkronAwal();
                else await unggah();
            } catch (err) {
                console.warn("Sinkronisasi progres gagal:", err);
            }
        } else if (localStorage.getItem(KUNCI_PEMILIK)) {
            // akun sudah keluar (misalnya dari perangkat lain): jangan tinggalkan progresnya di sini
            G.hapusLokal();
            localStorage.removeItem(KUNCI_PEMILIK);
            sessionStorage.removeItem("phyn-sinkron");
            location.reload();
            return;
        }
        gambarChip();
    });
}

mulai();
