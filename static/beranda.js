/* =========================================================
   PHYNthagoras — Beranda
   1. Sapaan + nama panggilan
   2. Progres & tombol "lanjut belajar"
   3. Tantangan harian + streak
   4. Kalkulator kilat
   5. Fakta seru
   6. Ubin coretan
   ========================================================= */

const simpan = {
    ambil(kunci, bawaan) {
        try {
            const isi = localStorage.getItem(kunci);
            return isi === null ? bawaan : JSON.parse(isi);
        } catch (e) { return bawaan; }
    },
    taruh(kunci, nilai) {
        try { localStorage.setItem(kunci, JSON.stringify(nilai)); } catch (e) { /* abaikan */ }
    },
};

// tanggal lokal dalam format YYYY-MM-DD
function kunciTanggal(d = new Date()) {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const HARI_INI = kunciTanggal();
const KEMARIN = kunciTanggal(new Date(Date.now() - 864e5));

/* ---------- 1. Sapaan + nama ---------- */
(function () {
    const jam = new Date().getHours();
    const waktu = jam < 11 ? "Selamat pagi ☀️" : jam < 15 ? "Selamat siang 🌤️"
                : jam < 18 ? "Selamat sore 🌇" : "Selamat malam 🌙";
    document.getElementById("sapa-waktu").textContent = waktu;

    const tombolNama = document.getElementById("tombol-nama");
    const formNama = document.getElementById("form-nama");
    const isiNama = document.getElementById("isi-nama");
    const judul = document.getElementById("judul-sapa");

    function tampilkanNama() {
        const nama = simpan.ambil("phyn-nama", "");
        if (nama) {
            judul.textContent = `Halo, ${nama}! Hari ini mau ngulik apa?`;
            tombolNama.textContent = "✎ Ganti nama";
        } else {
            judul.textContent = "Hari ini mau ngulik apa?";
            tombolNama.textContent = "✎ Panggil aku…";
        }
    }

    tombolNama.addEventListener("click", () => {
        formNama.hidden = !formNama.hidden;
        if (!formNama.hidden) {
            isiNama.value = simpan.ambil("phyn-nama", "");
            isiNama.focus();
        }
    });

    formNama.addEventListener("submit", (e) => {
        e.preventDefault();
        simpan.taruh("phyn-nama", isiNama.value.trim().slice(0, 20));
        formNama.hidden = true;
        tampilkanNama();
    });

    tampilkanNama();
})();

/* ---------- 2. Progres & lanjut belajar ---------- */
(function () {
    const dataTopik = document.getElementById("data-topik");
    const slug = dataTopik ? JSON.parse(dataTopik.dataset.slug) : [];
    const judul = dataTopik ? JSON.parse(dataTopik.dataset.judul) : [];
    const dibuka = simpan.ambil("phyn-materi-dibuka", []).filter((s) => slug.includes(s));
    const jumlah = dibuka.length;
    const total = slug.length || 1;

    document.getElementById("jumlah-dibuka").textContent = jumlah;
    const keliling = 2 * Math.PI * 50;
    document.getElementById("cincin-isi").classList.toggle("kosong", jumlah === 0);
    requestAnimationFrame(() => {
        document.getElementById("cincin-isi").style.strokeDashoffset =
            keliling * (1 - jumlah / total);
    });

    const level = jumlah === 0 ? "🌱 Baru mulai"
                : jumlah < 4 ? "✨ Lagi pemanasan"
                : jumlah < total ? "🔥 Lagi panas-panasnya"
                : "👑 Master Pythagoras";
    document.getElementById("level").textContent = level;

    // materi pertama yang belum dibuka
    const tujuan = slug.findIndex((s) => !dibuka.includes(s));
    const tombol = document.getElementById("lanjut-belajar");
    const label = document.getElementById("lanjut-label");
    const namaMateri = document.getElementById("lanjut-judul");

    if (tujuan === -1) {
        tombol.href = "latihan.html";
        label.textContent = "Semua materi sudah dibuka 🎉";
        namaMateri.textContent = "Gas ke Latihan";
    } else {
        tombol.href = `materi-${slug[tujuan]}.html`;
        label.textContent = jumlah === 0 ? "Mulai dari awal" : `Lanjut ke materi ${tujuan + 1}`;
        namaMateri.textContent = judul[tujuan];
    }
})();

/* ---------- 3. Tantangan harian ---------- */
(function () {
    // pengacak dengan "benih" tanggal: soal sama untuk semua orang di hari yang sama
    function pengacak(benih) {
        return function () {
            benih |= 0; benih = (benih + 0x6D2B79F5) | 0;
            let t = Math.imul(benih ^ (benih >>> 15), 1 | benih);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const acak = pengacak(Number(HARI_INI.replace(/-/g, "")));
    const pilih = (daftar) => daftar[Math.floor(acak() * daftar.length)];

    // tripel dasar dan kelipatan maksimumnya
    const tripel = pilih([[3, 4, 5, 4], [5, 12, 13, 2], [8, 15, 17, 2], [7, 24, 25, 1], [6, 8, 10, 2], [20, 21, 29, 1]]);
    const k = 1 + Math.floor(acak() * tripel[3]);
    let [a, b, c] = [tripel[0] * k, tripel[1] * k, tripel[2] * k];
    if (acak() < 0.5) [a, b] = [b, a];

    const cerita = [
        { cari: "siku", satuan: "m", teks: `Tangga sepanjang ${c} m bersandar di tembok. Kaki tangga berjarak ${a} m dari tembok. Berapa meter tinggi ujung atas tangga dari lantai?` },
        { cari: "siku", satuan: "m", teks: `Benang layanganmu terulur lurus sepanjang ${c} m. Jarakmu ke bayangan layangan di tanah ${a} m. Berapa meter tinggi layanganmu?` },
        { cari: "siku", satuan: "m", teks: `Kawat penyangga sepanjang ${c} m ditarik dari puncak tiang ke patok yang berjarak ${a} m dari kaki tiang. Berapa meter tinggi tiangnya?` },
        { cari: "miring", satuan: "m", teks: `Kamu jalan ${a} m ke utara, lalu belok ${b} m ke timur. Berapa meter jarak lurus kamu dari titik awal?` },
        { cari: "miring", satuan: "m", teks: `Lapangan berbentuk persegi panjang berukuran ${a} m × ${b} m. Kamu lari lurus dari satu pojok ke pojok seberangnya. Berapa meter jaraknya?` },
        { cari: "miring", satuan: "cm", teks: `Sebuah bingkai foto berukuran ${a} cm × ${b} cm. Berapa cm panjang diagonalnya?` },
    ];
    const soal = pilih(cerita);
    const jawaban = soal.cari === "miring" ? c : b;

    const el = (id) => document.getElementById(id);
    el("soal-harian").textContent = soal.teks;
    el("satuan-harian").textContent = soal.satuan;
    el("tanggal-harian").textContent = new Date().toLocaleDateString("id-ID",
        { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    // pembahasan
    el("pembahasan-harian").innerHTML = soal.cari === "miring"
        ? `<p>Yang dicari jarak miring → <strong>sisi miring → tambah</strong>.</p>
           <p>${c}² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}</p>
           <p>c = √${c * c} = <strong>${c} ${soal.satuan}</strong></p>`
        : `<p>${c} ${soal.satuan} adalah sisi miring. Yang dicari <strong>sisi siku-siku → kurang</strong>.</p>
           <p>x² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}</p>
           <p>x = √${b * b} = <strong>${b} ${soal.satuan}</strong></p>`;

    // streak
    const chipStreak = el("chip-streak");
    function tampilkanStreak() {
        const s = simpan.ambil("phyn-streak", { terakhir: "", jumlah: 0 });
        const aktif = s.terakhir === HARI_INI || s.terakhir === KEMARIN ? s.jumlah : 0;
        chipStreak.textContent = `🔥 ${aktif} hari`;
    }
    tampilkanStreak();

    const form = el("form-harian");
    const isian = el("isi-harian");
    const umpan = el("umpan-harian");
    const tombolPembahasan = el("tombol-pembahasan");

    tombolPembahasan.addEventListener("click", () => {
        const kotak = el("pembahasan-harian");
        kotak.hidden = !kotak.hidden;
        tombolPembahasan.textContent = kotak.hidden ? "Lihat pembahasan ↓" : "Tutup pembahasan ↑";
    });

    function selesai(baruSaja) {
        isian.disabled = true;
        form.querySelector("button").disabled = true;
        isian.value = jawaban;
        umpan.className = "umpan-harian benar";
        umpan.innerHTML = baruSaja
            ? `<strong>Mantap, benar! 🎉</strong>Jawabannya ${jawaban} ${soal.satuan}. Balik lagi besok buat soal baru, jangan putus streak-nya!`
            : `<strong>Tantangan hari ini beres ✅</strong>Kamu sudah menjawab dengan benar. Soal baru muncul besok.`;
        tombolPembahasan.hidden = false;
    }

    if (simpan.ambil("phyn-harian", "") === HARI_INI) selesai(false);

    const dekat = (x, y) => Math.abs(x - y) < 0.01;

    function catatanSalah(x) {
        if (soal.cari === "miring") {
            if (dekat(x, a + b)) return `Kamu menjumlahkan panjangnya langsung (${a} + ${b}). Yang dijumlahkan itu <b>kuadratnya</b>: ${a}² + ${b}².`;
            if (dekat(x, a * a + b * b)) return `Hampir! ${x} itu baru c². Tinggal <b>diakarkan</b>.`;
            if (dekat(x, Math.sqrt(Math.abs(a * a - b * b)))) return `Kamu mengurangkan kuadratnya. Jarak miring itu <b>sisi miring</b>, jadi kuadratnya ditambah.`;
            if (x <= Math.max(a, b)) return `Sisi miring harus <b>paling panjang</b>, jadi jawabannya pasti lebih dari ${Math.max(a, b)}.`;
            return `Belum pas. Yang dicari sisi miring → <b>tambah</b> kuadratnya, lalu akarkan.`;
        }
        if (dekat(x, c - a)) return `Kamu mengurangkan panjangnya langsung (${c} − ${a}). Yang dikurangkan itu <b>kuadratnya</b>: ${c}² − ${a}².`;
        if (dekat(x, c * c - a * a)) return `Hampir! ${x} itu baru x². Tinggal <b>diakarkan</b>.`;
        if (dekat(x, Math.sqrt(c * c + a * a))) return `Kamu menjumlahkan kuadratnya. Padahal ${c} ${soal.satuan} itu sisi miring, jadi yang dicari sisi siku-siku → <b>kurang</b>.`;
        if (dekat(x, c + a)) return `Panjang sisi nggak dijumlah langsung. ${c} ${soal.satuan} itu sisi miring, jadi hitung ${c}² − ${a}², lalu akarkan.`;
        if (x >= c) return `Jawabannya nggak mungkin lebih dari ${c}, karena ${c} ${soal.satuan} itu sisi miring (yang paling panjang).`;
        return `Belum pas. ${c} ${soal.satuan} itu sisi miring, jadi yang dicari sisi siku-siku → <b>kurang</b> kuadratnya, lalu akarkan.`;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const x = parseFloat(String(isian.value).replace(",", "."));
        if (isNaN(x)) {
            isian.focus();
            return;
        }

        if (dekat(x, jawaban)) {
            const lama = simpan.ambil("phyn-streak", { terakhir: "", jumlah: 0 });
            if (lama.terakhir !== HARI_INI) {
                const jumlah = lama.terakhir === KEMARIN ? lama.jumlah + 1 : 1;
                simpan.taruh("phyn-streak", { terakhir: HARI_INI, jumlah });
            }
            simpan.taruh("phyn-harian", HARI_INI);
            tampilkanStreak();
            chipStreak.classList.add("menyala");
            selesai(true);
            konfeti(form.querySelector("button"));
        } else {
            umpan.className = "umpan-harian salah";
            void umpan.offsetWidth; // ulang animasi geleng
            umpan.classList.add("goyang");
            umpan.innerHTML = `<strong>Belum tepat, coba lagi 💪</strong>${catatanSalah(x)}`;
            tombolPembahasan.hidden = false;
        }
    });

    function konfeti(asal) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = asal.getBoundingClientRect();
        for (let i = 0; i < 16; i++) {
            const s = document.createElement("span");
            s.className = "konfeti";
            s.textContent = i % 2 ? "🍀" : "🍎";
            s.style.left = r.left + r.width / 2 + "px";
            s.style.top = r.top + r.height / 2 + "px";
            const sudut = Math.random() * Math.PI * 2, jarak = 80 + Math.random() * 120;
            s.style.setProperty("--dx", Math.cos(sudut) * jarak + "px");
            s.style.setProperty("--dy", Math.sin(sudut) * jarak - 60 + "px");
            s.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
            document.body.appendChild(s);
            setTimeout(() => s.remove(), 1200);
        }
    }
})();

/* ---------- 4. Tebak kilat: siku-siku atau bukan? ---------- */
(function () {
    const TRIPEL = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
    const elAngka = document.getElementById("tebak-angka");
    const elHasil = document.getElementById("tebak-hasil");
    const elBeruntun = document.getElementById("tebak-beruntun");
    const elRekor = document.getElementById("tebak-rekor");
    const tombol = document.querySelectorAll(".tombol-tebak button");

    let beruntun = 0;
    let rekor = simpan.ambil("phyn-tebak-rekor", 0);
    let sekarang = null;
    elRekor.textContent = rekor;

    function soalBaru() {
        // pilih tripel (boleh kelipatan) dengan sisi terbesar maksimal 30
        const calon = [];
        TRIPEL.forEach(([a, b, c]) => { for (let k = 1; c * k <= 30; k++) calon.push([a * k, b * k, c * k]); });
        let [a, b, c] = calon[Math.floor(Math.random() * calon.length)];
        const siku = Math.random() < 0.5;
        if (!siku) {
            // ubah sedikit supaya "hampir" tripel (jebakan)
            if (Math.random() < 0.6) c += Math.random() < 0.5 ? 1 : -1;
            else a += 1;
        }
        const urut = [a, b, c].sort((x, y) => x - y);
        sekarang = { sisi: urut, siku: urut[0] ** 2 + urut[1] ** 2 === urut[2] ** 2 };
        elAngka.textContent = urut.join(" · ");
        tombol.forEach((t) => { t.disabled = false; t.className = ""; });
    }

    tombol.forEach((t) => t.addEventListener("click", () => {
        const [a, b, c] = sekarang.sisi;
        const kiri = a * a + b * b, kanan = c * c;
        const benar = (t.dataset.jawab === "ya") === sekarang.siku;
        const alasan = sekarang.siku
            ? `${a}² + ${b}² = ${kiri} = ${c}²`
            : `${a}² + ${b}² = ${kiri}, tapi ${c}² = ${kanan}`;

        tombol.forEach((x) => (x.disabled = true));
        t.className = benar ? "benar" : "salah";

        if (benar) {
            beruntun++;
            if (beruntun > rekor) {
                rekor = beruntun;
                simpan.taruh("phyn-tebak-rekor", rekor);
                elRekor.textContent = rekor;
            }
            elHasil.innerHTML = `<b>✓ Betul!</b> ${alasan}`;
        } else {
            beruntun = 0;
            elHasil.innerHTML = `<b>✗ Ups!</b> ${alasan} → ${sekarang.siku ? "siku-siku" : "bukan siku-siku"}`;
        }
        elBeruntun.textContent = `🔥 ${beruntun}`;
        setTimeout(soalBaru, benar ? 1400 : 2600);
    }));

    soalBaru();
})();

/* ---------- 5. Fakta seru ---------- */
(function () {
    const fakta = [
        "Bangsa Babilonia sudah menulis daftar tripel Pythagoras di lempeng tanah liat bernama Plimpton 322, sekitar 3.700 tahun lalu. Itu jauh sebelum Pythagoras lahir!",
        "Seorang guru bernama Elisha Loomis mengumpulkan 367 cara berbeda untuk membuktikan teorema Pythagoras dalam satu buku.",
        "James Garfield, presiden ke-20 Amerika Serikat, pernah menemukan bukti teorema Pythagoras versinya sendiri pada tahun 1876.",
        "Tripel Pythagoras jumlahnya tak terhingga. Pakai rumus p² − q², 2pq, dan p² + q², kamu bisa bikin tripel sebanyak yang kamu mau.",
        "Tukang bangunan memakai trik 3-4-5 (misalnya tali 60, 80, dan 100 cm) untuk memastikan sudut fondasi rumah benar-benar siku-siku.",
        "Pythagoras lahir di Pulau Samos, Yunani, sekitar tahun 570 SM.",
        "Game 3D dan peta digital menghitung jarak dua titik dengan rumus √(Δx² + Δy²). Itu teorema Pythagoras!",
        "Ukuran layar TV dan HP (misalnya 32 inci) diukur miring dari pojok ke pojok. Ukuran itu adalah sisi miring segitiga siku-siku.",
    ];
    const teks = document.getElementById("teks-fakta");
    let i = Math.floor(Math.random() * fakta.length);

    function tampil() {
        teks.textContent = fakta[i];
        teks.style.animation = "none";
        void teks.offsetWidth;
        teks.style.animation = "";
    }
    document.getElementById("tombol-fakta").addEventListener("click", () => {
        i = (i + 1) % fakta.length;
        tampil();
    });
    tampil();
})();

/* ---------- 6. Ubin coretan ---------- */
["ubin-coretan", "tips-coretan"].forEach((id) => {
    document.getElementById(id).addEventListener("click", () => {
        document.getElementById("buka-coretan").click();
    });
});
