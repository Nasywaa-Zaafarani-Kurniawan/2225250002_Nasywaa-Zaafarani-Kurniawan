/* =========================================================
   PHYNthagoras — skrip bersama untuk halaman materi
   1. Fungsi bantu angka (dipakai kalkulator di tiap topik)
   2. Contoh soal: buka langkah satu per satu
   3. Langkah visual: gambar berubah mengikuti langkah
   4. Kuis cek pemahaman + catatan kesalahan
   5. Kertas coretan
   6. Penanda materi yang sudah dibuka
   ========================================================= */

/* ---------- 1. Fungsi bantu angka ---------- */
const Phyn = {
    // 2.5 -> "2,5" (format Indonesia, maks. 2 angka desimal)
    angka(x, desimal = 2) {
        return Number(x).toLocaleString("id-ID", { maximumFractionDigits: desimal });
    },

    // Teks akar kuadrat yang rapi: 169 -> "13", 113 -> "√113 ≈ 10,63", 50 -> "5√2 ≈ 7,07"
    akar(n) {
        const hasil = Math.sqrt(n);
        if (Number.isInteger(hasil)) return Phyn.angka(hasil);

        if (Number.isInteger(n)) {
            // sederhanakan: cari k terbesar sehingga k² membagi n
            let k = 1;
            for (let i = 2; i * i <= n; i++) {
                if (n % (i * i) === 0) k = i;
            }
            const sisa = n / (k * k);
            const bentuk = (k > 1 ? k : "") + "√" + sisa;
            return `${bentuk} ≈ ${Phyn.angka(hasil)}`;
        }

        // bilangan desimal yang bukan kuadrat sempurna
        const bulat = Math.round(hasil * 1000) / 1000;
        if (Math.abs(bulat * bulat - n) < 1e-9) return Phyn.angka(bulat, 3);
        return "≈ " + Phyn.angka(hasil);
    },

    // nilai pada input number (koma juga diterima)
    baca(input) {
        return parseFloat(String(input.value).replace(",", "."));
    },
};

/* ---------- 2. Contoh soal: langkah demi langkah ---------- */
document.querySelectorAll("ol[data-langkah]").forEach((daftar) => {
    const langkah = [...daftar.children];
    if (langkah.length < 2) return;

    let terbuka = 1;
    const kontrol = document.createElement("div");
    kontrol.className = "kontrol-langkah";
    kontrol.innerHTML = `
        <button type="button" class="tombol tombol-utama berikut">Langkah berikutnya ↓</button>
        <button type="button" class="tombol tombol-garis semua">Tampilkan semua</button>
        <button type="button" class="tombol tombol-garis ulang" hidden>↺ Ulangi dari awal</button>`;
    daftar.after(kontrol);

    const tBerikut = kontrol.querySelector(".berikut");
    const tSemua = kontrol.querySelector(".semua");
    const tUlang = kontrol.querySelector(".ulang");

    function perbarui() {
        langkah.forEach((li, i) => (li.hidden = i >= terbuka));
        const selesai = terbuka >= langkah.length;
        tBerikut.hidden = selesai;
        tSemua.hidden = selesai;
        tUlang.hidden = !selesai;
    }

    tBerikut.addEventListener("click", () => { terbuka++; perbarui(); });
    tSemua.addEventListener("click", () => { terbuka = langkah.length; perbarui(); });
    tUlang.addEventListener("click", () => { terbuka = 1; perbarui(); });
    perbarui();
});

/* ---------- 3. Langkah visual ---------- */
document.querySelectorAll("[data-visual]").forEach((wadah) => {
    const daftar = [...wadah.querySelectorAll(".teks-langkah > li")];
    const jumlah = daftar.length;
    let sekarang = 1;

    const kontrol = document.createElement("div");
    kontrol.className = "kontrol-visual";
    kontrol.innerHTML = `
        <button type="button" class="tombol tombol-garis mundur">← Sebelumnya</button>
        <span class="penghitung-langkah"></span>
        <button type="button" class="tombol tombol-utama maju">Berikutnya →</button>`;
    wadah.append(kontrol);

    const tMundur = kontrol.querySelector(".mundur");
    const tMaju = kontrol.querySelector(".maju");
    const penghitung = kontrol.querySelector(".penghitung-langkah");

    function perbarui() {
        daftar.forEach((li, i) => li.classList.toggle("sekarang", i + 1 === sekarang));

        // elemen yang muncul mulai langkah tertentu
        wadah.querySelectorAll("[data-dari]").forEach((el) => {
            el.classList.toggle("muncul", sekarang >= Number(el.dataset.dari));
        });
        // elemen yang hilang setelah langkah tertentu (misalnya tanda "?")
        wadah.querySelectorAll("[data-sampai]").forEach((el) => {
            el.classList.toggle("hilang", sekarang > Number(el.dataset.sampai));
        });
        // elemen yang disorot hanya pada langkah tertentu
        wadah.querySelectorAll("[data-sorot]").forEach((el) => {
            const daftarLangkah = el.dataset.sorot.split(" ").map(Number);
            el.classList.toggle("sorot", daftarLangkah.includes(sekarang));
        });

        penghitung.textContent = `Langkah ${sekarang} dari ${jumlah}`;
        tMundur.disabled = sekarang === 1;
        tMaju.disabled = sekarang === jumlah;
    }

    tMundur.addEventListener("click", () => { sekarang--; perbarui(); });
    tMaju.addEventListener("click", () => { sekarang++; perbarui(); });
    perbarui();
});

/* ---------- 4. Kuis cek pemahaman ---------- */
document.querySelectorAll(".kuis").forEach((kuis) => {
    const umpan = kuis.querySelector(".umpan-balik");
    const penjelasan = kuis.querySelector(".penjelasan");
    const tombol = [...kuis.querySelectorAll(".pilihan-kuis button")];

    tombol.forEach((t) => {
        t.addEventListener("click", () => {
            if (t.hasAttribute("data-benar")) {
                t.classList.add("benar");
                tombol.forEach((x) => (x.disabled = true));
                umpan.className = "umpan-balik benar";
                umpan.innerHTML = "<strong>✓ Benar!</strong>" +
                    (penjelasan ? penjelasan.innerHTML : "");
            } else {
                t.classList.add("salah");
                t.disabled = true;
                umpan.className = "umpan-balik salah";
                umpan.innerHTML = "<strong>✗ Belum tepat, coba lagi.</strong>" +
                    (t.dataset.catatan || "");
            }
        });
    });
});

/* ---------- 5. Kertas coretan ---------- */
(function () {
    const panel = document.getElementById("coretan");
    const kanvas = document.getElementById("kanvas-coretan");
    if (!panel || !kanvas) return;

    const ctx = kanvas.getContext("2d");
    let warna = "#2b1d1e";
    let menghapus = false;
    let menggambar = false;
    let sudahDiatur = false;

    function aturUkuran() {
        const rasio = window.devicePixelRatio || 1;
        const lebar = kanvas.clientWidth;
        const tinggi = kanvas.clientHeight;
        if (!lebar || !tinggi) return;

        // simpan gambar lama supaya tidak hilang saat ukuran berubah
        const salinan = document.createElement("canvas");
        salinan.width = kanvas.width;
        salinan.height = kanvas.height;
        if (sudahDiatur) salinan.getContext("2d").drawImage(kanvas, 0, 0);

        kanvas.width = lebar * rasio;
        kanvas.height = tinggi * rasio;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (sudahDiatur) ctx.drawImage(salinan, 0, 0);
        ctx.setTransform(rasio, 0, 0, rasio, 0, 0);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        sudahDiatur = true;
    }

    function posisi(e) {
        const r = kanvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    kanvas.addEventListener("pointerdown", (e) => {
        menggambar = true;
        kanvas.setPointerCapture(e.pointerId);
        const p = posisi(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 0.01, p.y);
        gaya();
        ctx.stroke();
    });

    kanvas.addEventListener("pointermove", (e) => {
        if (!menggambar) return;
        const p = posisi(e);
        ctx.lineTo(p.x, p.y);
        gaya();
        ctx.stroke();
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((jenis) =>
        kanvas.addEventListener(jenis, () => (menggambar = false)));

    function gaya() {
        ctx.globalCompositeOperation = menghapus ? "destination-out" : "source-over";
        ctx.strokeStyle = warna;
        ctx.lineWidth = menghapus ? 26 : 3;
    }

    const tPenghapus = document.getElementById("alat-penghapus");
    const tWarna = panel.querySelectorAll(".warna");

    tWarna.forEach((t) => t.addEventListener("click", () => {
        warna = t.dataset.warna;
        menghapus = false;
        tWarna.forEach((x) => x.classList.toggle("aktif", x === t));
        tPenghapus.classList.remove("aktif");
    }));

    tPenghapus.addEventListener("click", () => {
        menghapus = !menghapus;
        tPenghapus.classList.toggle("aktif", menghapus);
    });

    document.getElementById("bersihkan-coretan").addEventListener("click", () => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, kanvas.width, kanvas.height);
        ctx.restore();
    });

    function buka() {
        panel.hidden = false;
        document.body.style.overflow = "hidden";
        aturUkuran();
    }

    function tutup() {
        panel.hidden = true;
        document.body.style.overflow = "";
    }

    document.getElementById("buka-coretan").addEventListener("click", buka);
    document.getElementById("tutup-coretan").addEventListener("click", tutup);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !panel.hidden) tutup();
    });
    window.addEventListener("resize", () => { if (!panel.hidden) aturUkuran(); });
})();

/* ---------- 6. Penanda materi yang sudah dibuka ---------- */
(function () {
    const KUNCI = "phyn-materi-dibuka";
    let dibuka = [];
    try { dibuka = JSON.parse(localStorage.getItem(KUNCI)) || []; } catch (e) { dibuka = []; }

    const slug = document.body.dataset.topik;
    if (slug && !dibuka.includes(slug)) {
        dibuka.push(slug);
        try { localStorage.setItem(KUNCI, JSON.stringify(dibuka)); } catch (e) { /* abaikan */ }
    }

    document.querySelectorAll("[data-slug]").forEach((el) => {
        if (dibuka.includes(el.dataset.slug)) el.classList.add("dibaca");
    });
})();
