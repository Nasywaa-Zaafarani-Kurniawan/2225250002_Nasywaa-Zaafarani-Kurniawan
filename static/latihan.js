/* =========================================================
   PHYNtagoras — Latihan bertingkat
   1. Alat bantu (acak, format angka, gambar SVG)
   2. Bank soal: setiap jenis soal dibuat acak oleh sebuah fungsi
   3. Daftar dunia & level
   4. Penyimpanan progres
   5. Peta level
   6. Arena soal (level biasa & ujian)
   ========================================================= */

/* ---------- 1. Alat bantu ---------- */
const acakInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pilih = (daftar) => daftar[Math.floor(Math.random() * daftar.length)];
const kocok = (daftar) => {
    const a = [...daftar];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
const F = (x) => Number(x).toLocaleString("id-ID", { maximumFractionDigits: 2 });
const dekat = (x, y) => Math.abs(x - y) < 0.011;
const kuadrat = (x) => Math.round(x * x * 10000) / 10000;

const TRIPEL_DASAR = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];

// tripel acak (boleh kelipatan) dengan sisi miring tidak lebih dari "maks"
function tripel(maks = 30) {
    const calon = [];
    TRIPEL_DASAR.forEach(([a, b, c]) => {
        for (let k = 1; c * k <= maks; k++) calon.push([a * k, b * k, c * k]);
    });
    const t = pilih(calon);
    return Math.random() < 0.5 ? [t[1], t[0], t[2]] : t;
}

// Catatan kesalahan untuk soal Pythagoras biasa.
// cari "miring": diketahui sisi siku-siku a & b, jawaban c
// cari "siku"  : diketahui sisi miring c & sisi siku-siku a, jawaban b
function analisis(x, { cari, a, b, c }) {
    if (cari === "miring") {
        if (dekat(x, a + b)) return `Kamu menjumlahkan panjang sisinya langsung (${F(a)} + ${F(b)}). Yang dijumlahkan itu <b>kuadratnya</b>: ${F(a)}² + ${F(b)}².`;
        if (dekat(x, kuadrat(a) + kuadrat(b))) return `Hampir! ${F(x)} itu baru c². Langkah terakhir: <b>akarkan</b> hasilnya.`;
        if (dekat(x, Math.sqrt(Math.abs(kuadrat(a) - kuadrat(b))))) return `Kamu mengurangkan kuadratnya. Yang dicari <b>sisi miring</b>, jadi kuadratnya <b>ditambah</b>.`;
        if (x <= Math.max(a, b)) return `Sisi miring harus <b>paling panjang</b>, jadi jawabannya pasti lebih dari ${F(Math.max(a, b))}.`;
        return `Belum pas. Yang dicari sisi miring → <b>tambah</b> kuadrat kedua sisi siku-siku, lalu akarkan.`;
    }
    if (dekat(x, c - a)) return `Kamu mengurangkan panjangnya langsung (${F(c)} − ${F(a)}). Yang dikurangkan itu <b>kuadratnya</b>: ${F(c)}² − ${F(a)}².`;
    if (dekat(x, kuadrat(c) - kuadrat(a))) return `Hampir! ${F(x)} itu baru kuadratnya. Langkah terakhir: <b>akarkan</b> hasilnya.`;
    if (dekat(x, Math.sqrt(kuadrat(c) + kuadrat(a)))) return `Kamu menjumlahkan kuadratnya. Padahal ${F(c)} adalah <b>sisi miring</b>, jadi yang dicari sisi siku-siku → <b>dikurang</b>.`;
    if (dekat(x, c + a)) return `Panjang sisi tidak dijumlah langsung. ${F(c)} adalah sisi miring, jadi hitung ${F(c)}² − ${F(a)}², lalu akarkan.`;
    if (x >= c) return `Jawabannya tidak mungkin ${F(c)} atau lebih, karena ${F(c)} adalah sisi miring (yang paling panjang).`;
    return `Belum pas. ${F(c)} adalah sisi miring, jadi yang dicari sisi siku-siku → <b>kurangkan</b> kuadratnya, lalu akarkan.`;
}

function pembahasanMiring(a, b, c, nama = "c", satuan = "") {
    return `<p>Yang dicari sisi miring → <b>tambah</b>.</p>
        <p>${nama}² = ${F(a)}² + ${F(b)}² = ${F(kuadrat(a))} + ${F(kuadrat(b))} = ${F(kuadrat(c))}</p>
        <p>${nama} = √${F(kuadrat(c))} = <b>${F(c)} ${satuan}</b></p>`;
}

function pembahasanSiku(c, a, b, nama = "x", satuan = "") {
    return `<p>${F(c)} adalah sisi miring. Yang dicari sisi siku-siku → <b>kurang</b>.</p>
        <p>${nama}² = ${F(c)}² − ${F(a)}² = ${F(kuadrat(c))} − ${F(kuadrat(a))} = ${F(kuadrat(b))}</p>
        <p>${nama} = √${F(kuadrat(b))} = <b>${F(b)} ${satuan}</b></p>`;
}

const PETUNJUK_MIRING = "Yang dicari sisi miring (di seberang sudut siku-siku) → kuadrat kedua sisi lainnya DITAMBAH, lalu diakarkan.";
const PETUNJUK_SIKU = "Yang dicari sisi siku-siku → kuadrat sisi miring DIKURANG kuadrat sisi yang diketahui, lalu diakarkan.";

/* ---------- Gambar SVG ---------- */
const teksSVG = (x, y, isi, kelas = "") =>
    `<text x="${x}" y="${y}" class="s-teks ${isi === "?" ? "s-teks-e" : ""} ${kelas}">${isi}</text>`;

// Segitiga siku-siku: sudut siku-siku di titik[1] (bawah), titik[0] di atas, titik[2] di samping
function svgSegitiga({ kiri = "", bawah = "", miring = "", titik = ["A", "B", "C"] }) {
    const cermin = Math.random() < 0.5;
    const X = (x) => (cermin ? 320 - x : x);
    return `<svg viewBox="0 0 320 230" class="gambar-soal" aria-hidden="true">
        <path d="M${X(70)} 40 L${X(70)} 190 L${X(260)} 190 Z" class="s-isi s-garis"/>
        <path d="M${X(70)} 176 L${X(84)} 176 L${X(84)} 190" class="s-siku"/>
        ${teksSVG(X(70), 30, titik[0])}${teksSVG(X(54), 208, titik[1])}${teksSVG(X(276), 208, titik[2])}
        ${teksSVG(X(40), 120, kiri, "s-kecil")}
        ${teksSVG(X(165), 214, bawah, "s-kecil")}
        ${teksSVG(X(184), 104, miring, "s-kecil")}
    </svg>`;
}

function svgPersegiPanjang(p, l, d) {
    return `<svg viewBox="0 0 320 210" class="gambar-soal" aria-hidden="true">
        <rect x="40" y="30" width="240" height="140" class="s-isi s-garis"/>
        <line x1="40" y1="170" x2="280" y2="30" class="s-aksen" style="stroke:var(--merah);stroke-width:3"/>
        <path d="M266 170 v-14 h14" class="s-siku"/>
        ${teksSVG(160, 196, p, "s-kecil")}${teksSVG(302, 104, l, "s-kecil")}${teksSVG(142, 90, d, "s-kecil")}
    </svg>`;
}

function svgTrapesium(ad, dc, ab) {
    return `<svg viewBox="0 0 380 220" class="gambar-soal" aria-hidden="true">
        <path d="M30 30 L270 30 L350 180 L30 180 Z" class="s-isi s-garis"/>
        <path d="M30 44 h14 v-14 M30 166 h14 v14" class="s-siku"/>
        ${teksSVG(20, 24, "D")}${teksSVG(280, 24, "C")}${teksSVG(20, 200, "A")}${teksSVG(362, 200, "B")}
        ${teksSVG(150, 22, dc, "s-kecil")}${teksSVG(68, 110, ad, "s-kecil")}${teksSVG(190, 202, ab, "s-kecil")}${teksSVG(334, 100, "?")}
    </svg>`;
}

function svgDuaSegitiga(ab, ad, cd) {
    return `<svg viewBox="20 30 380 300" class="gambar-soal" aria-hidden="true">
        <path d="M80 64 L80 280 L242 280 L357.2 193.6 Z" class="s-isi s-garis"/>
        <line x1="80" y1="64" x2="242" y2="280" class="s-garis-g" stroke-width="2"/>
        <path d="M80 266 h14 v14" class="s-siku"/>
        <path d="M233.6 268.8 L244.8 260.4 L253.2 271.6" class="s-siku"/>
        ${teksSVG(68, 58, "A")}${teksSVG(66, 300, "B")}${teksSVG(248, 302, "C")}${teksSVG(374, 194, "D")}
        ${teksSVG(46, 176, ab, "s-kecil")}${teksSVG(226, 112, ad, "s-kecil")}${teksSVG(322, 258, cd, "s-kecil")}${teksSVG(161, 304, "?")}
    </svg>`;
}

function svgKoordinat(x1, y1, x2, y2) {
    const s = 13, o = 125; // 13 px per satuan, titik (0,0) di tengah
    const P = (x, y) => [o + x * s, o - y * s];
    let petak = "";
    for (let i = -9; i <= 9; i++) {
        petak += `<line x1="${o + i * s}" y1="${o - 9 * s}" x2="${o + i * s}" y2="${o + 9 * s}"/>`;
        petak += `<line x1="${o - 9 * s}" y1="${o + i * s}" x2="${o + 9 * s}" y2="${o + i * s}"/>`;
    }
    const [ax, ay] = P(x1, y1), [bx, by] = P(x2, y2);
    return `<svg viewBox="0 0 250 250" class="gambar-soal" aria-hidden="true">
        <g class="s-petak" style="opacity:.3">${petak}</g>
        <line x1="${o - 9 * s}" y1="${o}" x2="${o + 9 * s}" y2="${o}" class="s-garis-g" stroke-width="1.5"/>
        <line x1="${o}" y1="${o - 9 * s}" x2="${o}" y2="${o + 9 * s}" class="s-garis-g" stroke-width="1.5"/>
        <line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" class="s-garis" stroke-dasharray="6 5"/>
        <circle cx="${ax}" cy="${ay}" r="5" style="fill:var(--merah)"/><circle cx="${bx}" cy="${by}" r="5" style="fill:var(--merah)"/>
        <text x="${ax}" y="${ay - 10}" class="s-teks s-kecil">A</text><text x="${bx}" y="${by - 10}" class="s-teks s-kecil">B</text>
    </svg>`;
}

function svgIstimewa45(sisi, miring) {
    return `<svg viewBox="0 0 260 220" class="gambar-soal" aria-hidden="true">
        <path d="M30 190 L200 190 L200 20 Z" class="s-isi s-garis"/>
        <path d="M186 190 v-14 h14" class="s-siku"/>
        ${teksSVG(66, 182, "45°", "s-kecil s-teks-e")}${teksSVG(184, 60, "45°", "s-kecil s-teks-e")}
        ${teksSVG(115, 212, sisi, "s-kecil")}${teksSVG(228, 110, sisi === "?" ? "" : sisi, "s-kecil")}${teksSVG(92, 96, miring, "s-kecil")}
    </svg>`;
}

function svgIstimewa30(pendek, panjang, miring) {
    return `<svg viewBox="0 0 320 200" class="gambar-soal" aria-hidden="true">
        <path d="M30 170 L260 170 L260 37 Z" class="s-isi s-garis"/>
        <path d="M246 170 v-14 h14" class="s-siku"/>
        ${teksSVG(84, 162, "30°", "s-kecil s-teks-e")}${teksSVG(240, 72, "60°", "s-kecil s-teks-e")}
        ${teksSVG(286, 108, pendek, "s-kecil")}${teksSVG(145, 192, panjang, "s-kecil")}${teksSVG(132, 92, miring, "s-kecil")}
    </svg>`;
}

/* ---------- 2. Bank soal ----------
   Setiap fungsi menerima { gambar: true/false } dan mengembalikan:
   teks, gambar (SVG/null), tipe ("isian"/"pilihan"), jawaban, satuan,
   pilihan [{teks, benar, catatan}], catatan(x), petunjuk, pembahasan, topik */
const BANK = {

    kuadrat(ctx) {
        const n = acakInt(11, 25);
        if (Math.random() < 0.5) {
            return {
                teks: `Berapakah nilai ${n}²?`, tipe: "isian", jawaban: n * n, satuan: "",
                catatan: (x) => dekat(x, 2 * n) ? `${n}² bukan ${n} × 2. Angka kecil 2 artinya ${n} dikalikan dengan <b>dirinya sendiri</b>.`
                    : dekat(x, n + 2) ? `Kuadrat bukan ditambah 2, tapi dikalikan dengan dirinya sendiri: ${n} × ${n}.`
                    : `Belum pas. Hitung pelan-pelan: ${n} × ${n} = (${n} × 10) + (${n} × ${n - 10}).`,
                petunjuk: `a² = a × a. Coba pecah: ${n} × ${n} = (${n} × 10) + (${n} × ${n - 10}).`,
                pembahasan: `<p>${n}² = ${n} × ${n} = <b>${n * n}</b></p>`,
                topik: "prasyarat",
            };
        }
        return {
            teks: `Berapakah nilai √${n * n}?`, tipe: "isian", jawaban: n, satuan: "",
            catatan: (x) => dekat(x, n * n / 2) ? `Akar bukan dibagi 2. Cari bilangan yang jika dikalikan dengan dirinya sendiri hasilnya ${n * n}.`
                : `Cek: ${F(x)} × ${F(x)} = ${F(kuadrat(x))}, bukan ${n * n}. ${x * x < n * n ? "Coba bilangan yang lebih besar." : "Coba bilangan yang lebih kecil."}`,
            petunjuk: `Cari bilangan yang jika dikalikan dirinya sendiri hasilnya ${n * n}. Jawabannya antara 10 dan 26.`,
            pembahasan: `<p>Karena ${n} × ${n} = ${n * n}, maka √${n * n} = <b>${n}</b></p>`,
            topik: "prasyarat",
        };
    },

    kenaliMiring(ctx) {
        const huruf = pilih(["ABC", "PQR", "KLM", "DEF", "XYZ", "STU"]).split("");
        const [atas, siku, samping] = kocok(huruf);
        const sisi = (p, q) => [p, q].sort().join("");
        const miring = sisi(atas, samping);
        const lain = [sisi(atas, siku), sisi(siku, samping)];
        return {
            teks: `Segitiga ${huruf.join("")} siku-siku di ${siku}. Manakah sisi miringnya?`,
            gambar: ctx.gambar ? svgSegitiga({ titik: [atas, siku, samping] }) : null,
            tipe: "pilihan",
            pilihan: [
                { teks: miring, benar: true },
                ...lain.map((s) => ({ teks: s, catatan: `Sisi ${s} menyentuh titik ${siku}, tempat sudut siku-siku. Jadi ${s} adalah <b>sisi siku-siku</b>. Sisi miring ada di <b>seberang</b> titik ${siku}.` })),
            ],
            petunjuk: `Letakkan jarimu di titik ${siku} (sudut siku-siku), lalu lihat sisi di seberangnya.`,
            pembahasan: `<p>Sisi miring adalah sisi yang <b>tidak</b> menyentuh titik sudut siku-siku (${siku}). Jadi sisi miringnya <b>${miring}</b>.</p>`,
            topik: "segitiga-siku",
        };
    },

    cariMiring(ctx) {
        const [a, b, c] = tripel(30), s = pilih(["cm", "m"]);
        return {
            teks: `Segitiga ABC siku-siku di B. Panjang AB = ${a} ${s} dan BC = ${b} ${s}. Berapa panjang AC?`,
            gambar: ctx.gambar ? svgSegitiga({ kiri: `${a} ${s}`, bawah: `${b} ${s}`, miring: "?" }) : null,
            tipe: "isian", jawaban: c, satuan: s,
            catatan: (x) => analisis(x, { cari: "miring", a, b, c }),
            petunjuk: `AC ada di seberang sudut siku-siku B, jadi AC sisi miring. ${PETUNJUK_MIRING}`,
            pembahasan: pembahasanMiring(a, b, c, "AC", s),
            topik: "menghitung-sisi",
        };
    },

    cariSiku(ctx) {
        const [a, b, c] = tripel(30), s = pilih(["cm", "m"]);
        return {
            teks: `Segitiga PQR siku-siku di Q. Panjang PR = ${c} ${s} dan PQ = ${a} ${s}. Berapa panjang QR?`,
            gambar: ctx.gambar ? svgSegitiga({ kiri: `${a} ${s}`, bawah: "?", miring: `${c} ${s}`, titik: ["P", "Q", "R"] }) : null,
            tipe: "isian", jawaban: b, satuan: s,
            catatan: (x) => analisis(x, { cari: "siku", a, b, c }),
            petunjuk: `PR ada di seberang sudut siku-siku Q, jadi PR sisi miring. ${PETUNJUK_SIKU}`,
            pembahasan: pembahasanSiku(c, a, b, "QR", s),
            topik: "menghitung-sisi",
        };
    },

    cariMiringAkar(ctx) {
        let a, b, n;
        do {
            a = acakInt(2, 9); b = acakInt(2, 9); n = a * a + b * b;
        } while (a === b || Number.isInteger(Math.sqrt(n)));
        const selisih = Math.abs(a * a - b * b);
        return {
            teks: `Sisi siku-siku sebuah segitiga panjangnya ${a} cm dan ${b} cm. Panjang sisi miringnya adalah …`,
            gambar: ctx.gambar ? svgSegitiga({ kiri: `${a} cm`, bawah: `${b} cm`, miring: "?" }) : null,
            tipe: "pilihan",
            pilihan: [
                { teks: `√${n} cm`, benar: true },
                { teks: `${a + b} cm`, catatan: `Kamu menjumlahkan panjang sisinya langsung. Yang dijumlahkan itu <b>kuadratnya</b>: ${a}² + ${b}² = ${n}.` },
                { teks: `√${selisih} cm`, catatan: `Kamu mengurangkan kuadratnya. Yang dicari sisi <b>miring</b>, jadi kuadratnya <b>ditambah</b>.` },
                { teks: `${n} cm`, catatan: `${n} itu baru c². Jangan lupa <b>diakarkan</b>.` },
            ],
            petunjuk: PETUNJUK_MIRING,
            pembahasan: `<p>c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${n}</p><p>c = <b>√${n} cm</b> ≈ ${F(Math.sqrt(n))} cm</p>`,
            topik: "menghitung-sisi",
        };
    },

    cekTripel(ctx) {
        const benar = tripel(41);
        const susun = (t) => [...t].sort((x, y) => x - y);
        const bukanTripel = (t) => { const [x, y, z] = susun(t); return x * x + y * y !== z * z; };
        const salah = [];
        while (salah.length < 3) {
            const t = [...tripel(41)];
            const ubah = pilih([2, 2, 0, 1]);
            t[ubah] += pilih([-1, 1, 2]);
            const kunci = susun(t).join(",");
            if (t.every((v) => v > 0) && bukanTripel(t) && !salah.some((s) => susun(s).join(",") === kunci)) salah.push(t);
        }
        const tampil = (t) => susun(t).join(", ");
        const [x, y, z] = susun(benar);
        return {
            teks: "Manakah kelompok bilangan berikut yang merupakan tripel Pythagoras?",
            tipe: "pilihan",
            pilihan: [
                { teks: tampil(benar), benar: true },
                ...salah.map((t) => {
                    const [p, q, r] = susun(t);
                    return { teks: tampil(t), catatan: `Cek: ${p}² + ${q}² = ${p * p + q * q}, sedangkan ${r}² = ${r * r}. Hasilnya tidak sama.` };
                }),
            ],
            petunjuk: "Kuadratkan dua bilangan terkecil lalu jumlahkan. Bandingkan dengan kuadrat bilangan terbesar.",
            pembahasan: `<p>${x}² + ${y}² = ${x * x} + ${y * y} = ${z * z} = ${z}². Jadi <b>${x}, ${y}, ${z}</b> adalah tripel Pythagoras.</p>`,
            topik: "tripel",
        };
    },

    lengkapiTripel(ctx) {
        const [a, b, c] = [...tripel(41)].sort((x, y) => x - y);
        const hilang = acakInt(0, 2);
        const tampil = [a, b, c].map((v, i) => (i === hilang ? "…" : v)).join(", ");
        const jawaban = [a, b, c][hilang];
        const cariMiring = hilang === 2;
        const [k1, k2] = [a, b, c].filter((_, i) => i !== hilang);
        return {
            teks: `Lengkapi tripel Pythagoras berikut: ${tampil}`, tipe: "isian", jawaban, satuan: "",
            catatan: (x) => cariMiring ? analisis(x, { cari: "miring", a: k1, b: k2, c })
                : analisis(x, { cari: "siku", c, a: hilang === 0 ? b : a, b: jawaban }),
            petunjuk: cariMiring ? "Bilangan yang hilang adalah yang terbesar (sisi miring) → jumlahkan kuadrat dua bilangan lainnya, lalu akarkan."
                : "Bilangan terbesar adalah sisi miring. Kurangkan kuadratnya dengan kuadrat bilangan yang diketahui, lalu akarkan.",
            pembahasan: cariMiring ? pembahasanMiring(a, b, c, "c") : pembahasanSiku(c, hilang === 0 ? b : a, jawaban, "x"),
            topik: "tripel",
        };
    },

    jenisSegitiga(ctx, { satuan = "", kelipatan = 1, teks } = {}) {
        const jenis = pilih(["siku", "lancip", "tumpul"]);
        let [a, b, c] = [...tripel(30)].sort((x, y) => x - y);
        if (jenis === "lancip") c -= 1;
        if (jenis === "tumpul") c += 1;
        [a, b, c] = [a, b, c].map((v) => v * kelipatan).sort((x, y) => x - y);
        const kiri = c * c, kanan = a * a + b * b;
        const tanda = kiri === kanan ? "=" : kiri < kanan ? "&lt;" : "&gt;";
        const urut = kocok([a, b, c]).map((v) => `${v}${satuan ? " " + satuan : ""}`).join(", ");
        const nama = { siku: "Siku-siku", lancip: "Lancip", tumpul: "Tumpul" };
        const catatanSalah = {
            siku: `${c}² = ${kiri}, sedangkan ${a}² + ${b}² = ${kanan}. Hasilnya tidak sama, jadi bukan siku-siku.`,
            lancip: `Lancip kalau (sisi terpanjang)² <b>lebih kecil</b> dari jumlah kuadrat dua sisi lainnya. Di sini ${kiri} ${tanda} ${kanan}.`,
            tumpul: `Tumpul kalau (sisi terpanjang)² <b>lebih besar</b> dari jumlah kuadrat dua sisi lainnya. Di sini ${kiri} ${tanda} ${kanan}.`,
        };
        return {
            teks: teks ? teks(urut) : `Sebuah segitiga memiliki sisi ${urut}. Termasuk segitiga apakah itu?`,
            tipe: "pilihan",
            pilihan: ["siku", "lancip", "tumpul"].map((j) => ({
                teks: nama[j], benar: j === jenis,
                catatan: j === jenis ? "" : catatanSalah[j] + ` (Pastikan kamu memakai sisi terpanjang, ${c}, sebagai c.)`,
            })),
            petunjuk: "Urutkan sisinya. Bandingkan (sisi terpanjang)² dengan jumlah kuadrat dua sisi lainnya: sama → siku-siku, lebih kecil → lancip, lebih besar → tumpul.",
            pembahasan: `<p>Sisi terpanjang = ${c}. ${c}² = ${kiri}, dan ${a}² + ${b}² = ${a * a} + ${b * b} = ${kanan}.</p>
                <p>${kiri} ${tanda} ${kanan}, jadi segitiganya <b>${nama[jenis].toLowerCase()}</b>.</p>`,
            topik: "jenis-segitiga",
        };
    },

    istimewa45(ctx) {
        const k = acakInt(2, 15);
        if (Math.random() < 0.5) {
            return {
                teks: `Segitiga siku-siku sama kaki memiliki sisi siku-siku ${k} cm (sudutnya 45°, 45°, 90°). Panjang sisi miringnya adalah …`,
                gambar: ctx.gambar ? svgIstimewa45(`${k} cm`, "?") : null,
                tipe: "pilihan",
                pilihan: [
                    { teks: `${k}√2 cm`, benar: true },
                    { teks: `${2 * k} cm`, catatan: "Sisi miring = 2 × sisi terpendek itu aturan segitiga <b>30°–60°–90°</b>. Untuk 45°–45°–90°, perbandingannya 1 : 1 : √2." },
                    { teks: `${k}√3 cm`, catatan: "√3 dipakai pada segitiga 30°–60°–90°. Untuk sudut 45°, kalikan dengan <b>√2</b>." },
                    { teks: `${k} cm`, catatan: "Sisi miring harus lebih panjang dari sisi siku-siku." },
                ],
                petunjuk: "Perbandingan sisi segitiga 45°–45°–90° = 1 : 1 : √2.",
                pembahasan: `<p>Sisi miring = sisi siku-siku × √2 = <b>${k}√2 cm</b> (≈ ${F(k * Math.SQRT2)} cm).</p>`,
                topik: "segitiga-istimewa",
            };
        }
        return {
            teks: `Segitiga siku-siku sama kaki memiliki sisi miring ${k}√2 cm. Berapa cm panjang sisi siku-sikunya?`,
            gambar: ctx.gambar ? svgIstimewa45("?", `${k}√2`) : null,
            tipe: "isian", jawaban: k, satuan: "cm",
            catatan: (x) => dekat(x, 2 * k) ? "Dari sisi miring ke sisi siku-siku itu <b>dibagi</b> √2, bukan dikali."
                : dekat(x, k * Math.SQRT2) ? `${F(x)} ≈ ${k}√2, itu panjang sisi miringnya sendiri. Bagi dengan √2.`
                : "Perbandingannya 1 : 1 : √2. Sisi siku-siku = sisi miring ÷ √2.",
            petunjuk: "Perbandingan sisi segitiga 45°–45°–90° = 1 : 1 : √2.",
            pembahasan: `<p>Sisi siku-siku = ${k}√2 ÷ √2 = <b>${k} cm</b>.</p>`,
            topik: "segitiga-istimewa",
        };
    },

    istimewa30(ctx) {
        const k = acakInt(2, 15);
        const awal = `Pada ΔABC, ∠A = 30°, ∠B = 60°, dan ∠C = 90°.`;
        const v = pilih([1, 2, 3]);
        if (v === 1) {
            return {
                teks: `${awal} Panjang BC (di depan sudut 30°) = ${k} cm. Berapa cm panjang AB (sisi miring)?`,
                gambar: ctx.gambar ? svgIstimewa30(`${k}`, "", "?") : null,
                tipe: "isian", jawaban: 2 * k, satuan: "cm",
                catatan: (x) => dekat(x, k / 2) ? "Sisi miring itu <b>dua kali</b> sisi terpendek, bukan setengahnya."
                    : dekat(x, k * Math.sqrt(3)) ? "Itu panjang sisi di depan sudut 60° (×√3). Sisi miring = 2 × sisi terpendek."
                    : "Perbandingan sisi 30°–60°–90° = 1 : √3 : 2. Sisi miring = 2 × sisi di depan 30°.",
                petunjuk: "Perbandingan sisi segitiga 30°–60°–90° = 1 : √3 : 2 (depan 30° : depan 60° : sisi miring).",
                pembahasan: `<p>AB = 2 × BC = 2 × ${k} = <b>${2 * k} cm</b>.</p>`,
                topik: "segitiga-istimewa",
            };
        }
        if (v === 2) {
            return {
                teks: `${awal} Panjang BC (di depan sudut 30°) = ${k} cm. Panjang AC (di depan sudut 60°) adalah …`,
                gambar: ctx.gambar ? svgIstimewa30(`${k}`, "?", "") : null,
                tipe: "pilihan",
                pilihan: [
                    { teks: `${k}√3 cm`, benar: true },
                    { teks: `${2 * k} cm`, catatan: "Itu panjang sisi miring (2 × sisi terpendek). AC berada di depan sudut 60°, jadi dikali √3." },
                    { teks: `${k}√2 cm`, catatan: "√2 dipakai pada segitiga 45°–45°–90°. Untuk sudut 60°, kalikan dengan <b>√3</b>." },
                    { teks: `${k} cm`, catatan: "Sisi di depan 60° lebih panjang dari sisi di depan 30°." },
                ],
                petunjuk: "Perbandingan sisi segitiga 30°–60°–90° = 1 : √3 : 2.",
                pembahasan: `<p>AC = √3 × BC = <b>${k}√3 cm</b> (≈ ${F(k * Math.sqrt(3))} cm).</p>`,
                topik: "segitiga-istimewa",
            };
        }
        return {
            teks: `${awal} Panjang AB (sisi miring) = ${2 * k} cm. Berapa cm panjang BC (di depan sudut 30°)?`,
            gambar: ctx.gambar ? svgIstimewa30("?", "", `${2 * k}`) : null,
            tipe: "isian", jawaban: k, satuan: "cm",
            catatan: (x) => dekat(x, 4 * k) ? "Dari sisi miring ke sisi terpendek itu <b>dibagi</b> 2, bukan dikali."
                : "Sisi di depan 30° = setengah sisi miring.",
            petunjuk: "Sisi di depan sudut 30° = setengah dari sisi miring.",
            pembahasan: `<p>BC = AB ÷ 2 = ${2 * k} ÷ 2 = <b>${k} cm</b>.</p>`,
            topik: "segitiga-istimewa",
        };
    },

    persegiPanjang(ctx) {
        const [p, l, d] = tripel(30);
        if (Math.random() < 0.5) {
            return {
                teks: `Sebuah persegi panjang berukuran ${p} cm × ${l} cm. Berapa cm panjang diagonalnya?`,
                gambar: ctx.gambar ? svgPersegiPanjang(`${p} cm`, `${l} cm`, "?") : null,
                tipe: "isian", jawaban: d, satuan: "cm",
                catatan: (x) => analisis(x, { cari: "miring", a: p, b: l, c: d }),
                petunjuk: "Diagonal membagi persegi panjang menjadi dua segitiga siku-siku, dan diagonal adalah sisi miringnya.",
                pembahasan: pembahasanMiring(p, l, d, "d", "cm"),
                topik: "bangun-gabungan",
            };
        }
        return {
            teks: `Diagonal sebuah persegi panjang ${d} cm dan panjangnya ${p} cm. Berapa cm lebarnya?`,
            gambar: ctx.gambar ? svgPersegiPanjang(`${p} cm`, "?", `${d} cm`) : null,
            tipe: "isian", jawaban: l, satuan: "cm",
            catatan: (x) => analisis(x, { cari: "siku", c: d, a: p, b: l }),
            petunjuk: "Diagonal adalah sisi miring. Lebar adalah sisi siku-siku → dikurang.",
            pembahasan: pembahasanSiku(d, p, l, "l", "cm"),
            topik: "bangun-gabungan",
        };
    },

    trapesium(ctx) {
        const [h, x, c] = tripel(30);
        const dc = acakInt(5, 20), ab = dc + x;
        return {
            teks: `Trapesium ABCD siku-siku di A dan D. Panjang AD = ${h} cm, DC = ${dc} cm, dan AB = ${ab} cm. Berapa cm panjang BC?`,
            gambar: ctx.gambar ? svgTrapesium(`${h} cm`, `${dc} cm`, `${ab} cm`) : null,
            tipe: "isian", jawaban: c, satuan: "cm",
            catatan: (y) => dekat(y, Math.sqrt(h * h + ab * ab)) ? `Sisi datar segitiganya bukan AB. Tarik garis tinggi CE, lalu BE = AB − DC = ${ab} − ${dc} = ${x}.`
                : dekat(y, x) ? `${x} itu baru BE (sisi datar segitiga). BC adalah sisi miring segitiga BEC.`
                : analisis(y, { cari: "miring", a: h, b: x, c }),
            petunjuk: "Tarik garis tinggi dari C ke AB (titik E). Segitiga BEC siku-siku di E.",
            pembahasan: `<p>Tarik garis tinggi CE. CE = AD = ${h} cm, BE = AB − DC = ${ab} − ${dc} = ${x} cm.</p>${pembahasanMiring(h, x, c, "BC", "cm")}`,
            topik: "bangun-gabungan",
        };
    },

    duaSegitiga(ctx) {
        // [AB, BC, AC, CD, AD]: AC adalah sisi miring ΔABC dan sisi siku-siku ΔACD
        const [AB, BC, AC, CD, AD] = pilih([
            [3, 4, 5, 12, 13], [4, 3, 5, 12, 13], [12, 9, 15, 8, 17], [9, 12, 15, 8, 17],
            [8, 6, 10, 24, 26], [6, 8, 10, 24, 26], [16, 12, 20, 15, 25], [12, 16, 20, 21, 29], [20, 15, 25, 60, 65],
        ]);
        return {
            teks: `Pada segi empat ABCD, ∠ABC = 90° dan ∠ACD = 90°. Panjang AB = ${AB} cm, CD = ${CD} cm, dan AD = ${AD} cm. Berapa cm panjang BC?`,
            gambar: ctx.gambar ? svgDuaSegitiga(`${AB} cm`, `${AD} cm`, `${CD} cm`) : null,
            tipe: "isian", jawaban: BC, satuan: "cm",
            catatan: (x) => dekat(x, AC) ? `${AC} itu panjang AC (sisi jembatan). Masih satu langkah lagi: pakai AC sebagai sisi miring ΔABC.`
                : dekat(x, Math.sqrt(AD * AD - AB * AB)) ? "AD dan AB tidak berada di segitiga siku-siku yang sama. Cari dulu AC dari ΔACD."
                : "Cari dulu sisi jembatan AC dari ΔACD (AD sisi miring), lalu pakai AC sebagai sisi miring ΔABC.",
            petunjuk: "Ada dua segitiga siku-siku: ABC (siku-siku di B) dan ACD (siku-siku di C). Hitung AC dulu.",
            pembahasan: `<p>ΔACD: AC² = ${AD}² − ${CD}² = ${AD * AD} − ${CD * CD} = ${AC * AC}, jadi AC = ${AC} cm.</p>
                <p>ΔABC: BC² = ${AC}² − ${AB}² = ${AC * AC} − ${AB * AB} = ${BC * BC}, jadi BC = <b>${BC} cm</b>.</p>`,
            topik: "bangun-gabungan",
        };
    },

    jarakTitik(ctx) {
        const [dx0, dy0, c] = pilih([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13]]);
        const tempat = (d) => { const awal = acakInt(-8, 8 - d); return Math.random() < 0.5 ? [awal, awal + d] : [awal + d, awal]; };
        const [x1, x2] = tempat(dx0), [y1, y2] = tempat(dy0);
        return {
            teks: `Berapa jarak antara titik A(${x1}, ${y1}) dan B(${x2}, ${y2}) pada bidang koordinat?`,
            gambar: ctx.gambar ? svgKoordinat(x1, y1, x2, y2) : null,
            tipe: "isian", jawaban: c, satuan: "satuan",
            catatan: (x) => dekat(x, dx0 + dy0) ? `Selisih x (${dx0}) dan selisih y (${dy0}) tidak dijumlah langsung. Keduanya adalah sisi siku-siku → c² = ${dx0}² + ${dy0}².`
                : dekat(x, Math.hypot(x1 + x2, y1 + y2)) || dekat(x, Math.hypot(x2 - x1, y1 + y2)) || dekat(x, Math.hypot(x1 + x2, y2 - y1))
                    ? "Hati-hati dengan tanda negatif. Selisih = koordinat B − koordinat A, misalnya 3 − (−5) = 8."
                : analisis(x, { cari: "miring", a: dx0, b: dy0, c }),
            petunjuk: "Sisi datar = selisih koordinat x, sisi tegak = selisih koordinat y. Jarak AB adalah sisi miringnya.",
            pembahasan: `<p>Selisih x = |${x2} − (${x1})| = ${dx0}, selisih y = |${y2} − (${y1})| = ${dy0}.</p>${pembahasanMiring(dx0, dy0, c, "AB", "satuan")}`,
            topik: "penerapan",
        };
    },

    /* ----- soal cerita (tanpa gambar) ----- */

    ceritaTangga() {
        const [a, b, c] = pilih([[1.5, 2, 2.5], [3, 4, 5], [2.4, 3.2, 4], [3.6, 4.8, 6], [2.5, 6, 6.5], [1.8, 2.4, 3]]);
        if (Math.random() < 0.5) {
            return {
                teks: `Sebuah tangga sepanjang ${F(c)} m bersandar pada tembok. Kaki tangga berjarak ${F(a)} m dari tembok. Berapa meter tinggi ujung atas tangga dari lantai?`,
                tipe: "isian", jawaban: b, satuan: "m",
                catatan: (x) => analisis(x, { cari: "siku", c, a, b }),
                petunjuk: PETUNJUK_SIKU,
                pembahasan: `<p>Tangga = sisi miring, tembok dan lantai membentuk 90°.</p>${pembahasanSiku(c, a, b, "t", "m")}`,
                topik: "penerapan",
            };
        }
        return {
            teks: `Sebuah tangga sepanjang ${F(c)} m bersandar pada tembok. Ujung atas tangga berada ${F(b)} m dari lantai. Berapa meter jarak kaki tangga ke tembok?`,
            tipe: "isian", jawaban: a, satuan: "m",
            catatan: (x) => analisis(x, { cari: "siku", c, a: b, b: a }),
            petunjuk: PETUNJUK_SIKU,
            pembahasan: `<p>Tangga = sisi miring, tembok dan lantai membentuk 90°.</p>${pembahasanSiku(c, b, a, "x", "m")}`,
            topik: "penerapan",
        };
    },

    ceritaLayangan() {
        const [a, b, c] = tripel(30);
        return {
            teks: `Panjang benang layang-layang yang terulur lurus adalah ${c} m. Jarak dari orang yang bermain ke bayangan layang-layang di tanah adalah ${a} m. Berapa meter tinggi layang-layang dari tanah?`,
            tipe: "isian", jawaban: b, satuan: "m",
            catatan: (x) => analisis(x, { cari: "siku", c, a, b }),
            petunjuk: PETUNJUK_SIKU,
            pembahasan: `<p>Benang = sisi miring, tinggi layang-layang tegak lurus tanah.</p>${pembahasanSiku(c, a, b, "t", "m")}`,
            topik: "penerapan",
        };
    },

    ceritaTiang() {
        const [a, b, c] = tripel(50);
        return {
            teks: `Sebuah tiang dipasangi kawat penyangga sepanjang ${c} m dari puncak tiang ke patok di tanah. Patok berjarak ${a} m dari kaki tiang. Berapa meter tinggi tiang tersebut?`,
            tipe: "isian", jawaban: b, satuan: "m",
            catatan: (x) => analisis(x, { cari: "siku", c, a, b }),
            petunjuk: PETUNJUK_SIKU,
            pembahasan: `<p>Kawat = sisi miring, tiang tegak lurus tanah.</p>${pembahasanSiku(c, a, b, "t", "m")}`,
            topik: "penerapan",
        };
    },

    ceritaJalan() {
        const [a, b, c] = tripel(30);
        const [arah1, arah2] = pilih([["utara", "timur"], ["selatan", "barat"], ["utara", "barat"], ["timur", "selatan"]]);
        return {
            teks: `Rani berjalan ${a} m ke arah ${arah1}, lalu berbelok dan berjalan ${b} m ke arah ${arah2}. Berapa meter jarak lurus Rani dari titik awal?`,
            tipe: "isian", jawaban: c, satuan: "m",
            catatan: (x) => dekat(x, a + b) ? `${a + b} m adalah panjang jalan yang ditempuh, bukan jarak lurus. Jarak lurus = sisi miring → ${a}² + ${b}².` : analisis(x, { cari: "miring", a, b, c }),
            petunjuk: PETUNJUK_MIRING,
            pembahasan: `<p>Arah ${arah1} dan ${arah2} saling tegak lurus, jadi jarak lurusnya adalah sisi miring.</p>${pembahasanMiring(a, b, c, "d", "m")}`,
            topik: "penerapan",
        };
    },

    ceritaLapangan() {
        const [a, b, c] = tripel(100);
        return {
            teks: `Sebuah lapangan berbentuk persegi panjang berukuran ${a} m × ${b} m. Andi berlari lurus dari satu pojok ke pojok yang berseberangan. Berapa meter jarak yang ditempuh Andi?`,
            tipe: "isian", jawaban: c, satuan: "m",
            catatan: (x) => dekat(x, Math.max(a, b)) ? "Itu sisi terpanjang lapangan. Pojok ke pojok berseberangan adalah <b>diagonal</b>, yaitu sisi miring segitiga." : analisis(x, { cari: "miring", a, b, c }),
            petunjuk: PETUNJUK_MIRING,
            pembahasan: `<p>Lintasan diagonal adalah sisi miring segitiga siku-siku.</p>${pembahasanMiring(a, b, c, "d", "m")}`,
            topik: "penerapan",
        };
    },

    ceritaPerahu() {
        const [a, b, c] = tripel(50);
        return {
            teks: `Seorang penjaga pantai melihat perahu nelayan ${a} km lurus di depannya. Sebuah perahu wisata berada ${b} km dari perahu nelayan, dengan arah tegak lurus terhadap pandangan penjaga pantai. Berapa km jarak penjaga pantai ke perahu wisata?`,
            tipe: "isian", jawaban: c, satuan: "km",
            catatan: (x) => analisis(x, { cari: "miring", a, b, c }),
            petunjuk: PETUNJUK_MIRING,
            pembahasan: pembahasanMiring(a, b, c, "d", "km"),
            topik: "penerapan",
        };
    },

    ceritaTukang(ctx) {
        return BANK.jenisSegitiga(ctx, {
            satuan: "cm", kelipatan: 10,
            teks: (urut) => `Seorang tukang memasang tali berukuran ${urut} untuk membentuk sudut fondasi rumah. Segitiga yang terbentuk adalah segitiga …`,
        });
    },

    ceritaHiasan() {
        const k = acakInt(5, 40);
        return {
            teks: `Seorang pengrajin membuat hiasan dinding berbentuk segitiga siku-siku dengan salah satu sudut 30°. Sisi di depan sudut 30° panjangnya ${k} cm. Berapa cm panjang sisi miringnya?`,
            tipe: "isian", jawaban: 2 * k, satuan: "cm",
            catatan: (x) => dekat(x, k / 2) ? "Sisi miring itu <b>dua kali</b> sisi di depan 30°, bukan setengahnya."
                : dekat(x, k * Math.sqrt(3)) ? "Itu panjang sisi di depan sudut 60°. Sisi miring = 2 × sisi di depan 30°."
                : "Segitiga 30°–60°–90° punya perbandingan 1 : √3 : 2.",
            petunjuk: "Perbandingan sisi segitiga 30°–60°–90° = 1 : √3 : 2.",
            pembahasan: `<p>Sisi miring = 2 × ${k} = <b>${2 * k} cm</b>.</p>`,
            topik: "segitiga-istimewa",
        };
    },

    ceritaSamaSisi() {
        const k = acakInt(2, 12), sisi = 2 * k;
        return {
            teks: `Sebuah papan nama berbentuk segitiga sama sisi dengan panjang sisi ${sisi} cm. Tinggi papan nama tersebut adalah …`,
            tipe: "pilihan",
            pilihan: [
                { teks: `${k}√3 cm`, benar: true },
                { teks: `${sisi}√3 cm`, catatan: `Garis tinggi membagi alas menjadi dua, jadi sisi pendek segitiganya ${k} cm, bukan ${sisi} cm.` },
                { teks: `${k}√5 cm`, catatan: `Kamu menjumlahkan kuadratnya (${sisi}² + ${k}²). Tinggi adalah sisi siku-siku, jadi kuadratnya dikurang: ${sisi}² − ${k}².` },
                { teks: `${k}√2 cm`, catatan: "√2 dipakai pada segitiga 45°–45°–90°. Garis tinggi segitiga sama sisi membentuk segitiga 30°–60°–90°." },
            ],
            petunjuk: "Garis tinggi membagi segitiga sama sisi menjadi dua segitiga siku-siku.",
            pembahasan: `<p>Garis tinggi membagi alas menjadi ${k} cm. t² = ${sisi}² − ${k}² = ${sisi * sisi} − ${k * k} = ${3 * k * k}, jadi t = <b>${k}√3 cm</b> (≈ ${F(k * Math.sqrt(3))} cm).</p>`,
            topik: "segitiga-istimewa",
        };
    },

    ceritaJalanBalik() {
        const [v, h, c] = tripel(20);
        const a1 = acakInt(2, 9), a2 = a1 + v;
        return {
            teks: `Bima berjalan ${a1} m ke utara, lalu ${h} m ke timur, lalu ${a2} m ke selatan. Berapa meter jarak Bima dari posisi semula?`,
            tipe: "isian", jawaban: c, satuan: "m",
            catatan: (x) => dekat(x, Math.hypot(a2, h)) ? `Kamu lupa bahwa utara dan selatan <b>saling mengurangi</b>. Posisi akhir Bima ${a2} − ${a1} = ${v} m di selatan titik awal.`
                : dekat(x, Math.hypot(a1 + a2, h)) ? "Utara dan selatan berlawanan arah, jadi dikurangkan, bukan dijumlah."
                : dekat(x, a1 + h + a2) ? "Itu panjang seluruh jalan yang ditempuh. Yang ditanya jarak lurus dari titik awal."
                : `Gambar dulu sketsanya. Posisi akhir: ${v} m ke selatan dan ${h} m ke timur dari titik awal.`,
            petunjuk: "Gambar sketsanya. Gerak utara dan selatan saling mengurangi.",
            pembahasan: `<p>Selisih utara-selatan = ${a2} − ${a1} = ${v} m, ke timur = ${h} m.</p>${pembahasanMiring(v, h, c, "d", "m")}`,
            topik: "penerapan",
        };
    },

    ceritaBalok() {
        const [p, l, t, d1, D] = pilih([[3, 4, 12, 5, 13], [4, 3, 12, 5, 13], [6, 8, 24, 10, 26], [8, 6, 24, 10, 26], [12, 16, 15, 20, 25], [9, 12, 8, 15, 17]]);
        return {
            teks: `Sebuah kotak berbentuk balok berukuran panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm. Berapa cm panjang diagonal ruangnya (dari pojok bawah ke pojok atas yang berseberangan)?`,
            tipe: "isian", jawaban: D, satuan: "cm",
            catatan: (x) => dekat(x, d1) ? `${d1} cm itu baru diagonal alasnya. Masih satu langkah lagi: pakai diagonal alas dan tinggi ${t} cm.`
                : dekat(x, p + l + t) ? "Ukuran balok tidak dijumlah langsung. Hitung diagonal alas dulu, lalu diagonal ruang."
                : (dekat(x, Math.hypot(p, t)) || dekat(x, Math.hypot(l, t))) ? "Diagonal ruang melibatkan ketiga ukuran. Mulai dari diagonal alas (panjang dan lebar)."
                : "Langkah 1: diagonal alas dari panjang dan lebar. Langkah 2: diagonal ruang dari diagonal alas dan tinggi.",
            petunjuk: "Hitung diagonal alas dulu, lalu pakai diagonal alas dan tinggi.",
            pembahasan: `<p>Diagonal alas: √(${p}² + ${l}²) = √${p * p + l * l} = ${d1} cm.</p>
                <p>Diagonal ruang: √(${d1}² + ${t}²) = √${d1 * d1 + t * t} = <b>${D} cm</b>.</p>`,
            topik: "bangun-gabungan",
        };
    },
};

/* ---------- 3. Dunia & level ---------- */
const CERITA = ["ceritaTangga", "ceritaLayangan", "ceritaTiang", "ceritaJalan", "ceritaLapangan", "ceritaPerahu",
                "ceritaTukang", "ceritaHiasan", "ceritaSamaSisi", "ceritaJalanBalik", "ceritaBalok"];

const DUNIA = [
    {
        nama: "Kebun Apel", emoji: "🍎", tingkat: "Mudah", kelas: "dunia-apel",
        ket: "Ada gambar, kartu rumus, dan tombol petunjuk. Pemanasan dulu!",
        gambar: true, bantuan: true, hiasan: ["🍃", "🍎", "✨"],
        level: [
            { judul: "Kuadrat & akar", jenis: ["kuadrat"], n: 3 },
            { judul: "Temukan sisi miring", jenis: ["kenaliMiring"], n: 3 },
            { judul: "Hitung sisi miring", jenis: ["cariMiring"], n: 3 },
            { judul: "Hitung sisi siku-siku", jenis: ["cariSiku"], n: 4 },
            { judul: "Tripel Pythagoras", jenis: ["cekTripel", "lengkapiTripel"], n: 3 },
            { judul: "Jenis segitiga", jenis: ["jenisSegitiga"], n: 4 },
        ],
    },
    {
        nama: "Ladang Clover", emoji: "🍀", tingkat: "Sedang", kelas: "dunia-clover",
        ket: "Gambar masih ada, tapi rumus dan petunjuk disimpan. Ingat sendiri, ya!",
        gambar: true, bantuan: false, hiasan: ["🍀", "🌼", "🦋"],
        level: [
            { judul: "Campuran sisi", jenis: ["cariMiring", "cariSiku", "cariMiringAkar"], n: 4 },
            { judul: "Segitiga istimewa", jenis: ["istimewa45", "istimewa30"], n: 4 },
            { judul: "Persegi panjang & trapesium", jenis: ["persegiPanjang", "trapesium"], n: 5 },
            { judul: "Dua segitiga terhubung", jenis: ["duaSegitiga"], n: 5 },
            { judul: "Jarak dua titik", jenis: ["jarakTitik"], n: 4 },
            { judul: "Campuran Ladang Clover", jenis: ["cariMiringAkar", "istimewa45", "istimewa30", "trapesium", "duaSegitiga", "jarakTitik"], n: 5 },
        ],
    },
    {
        nama: "Bukit Tanpa Gambar", emoji: "🌙", tingkat: "Sulit", kelas: "dunia-bukit",
        ket: "Tanpa gambar, tanpa petunjuk. Bikin sketsa sendiri di Coretan!",
        gambar: false, bantuan: false, hiasan: ["⭐", "🌙", "✨"],
        level: [
            { judul: "Tangga, layangan, tiang", jenis: ["ceritaTangga", "ceritaLayangan", "ceritaTiang"], n: 4 },
            { judul: "Jarak & diagonal", jenis: ["ceritaJalan", "ceritaLapangan", "ceritaPerahu"], n: 4 },
            { judul: "Tukang & hiasan", jenis: ["ceritaTukang", "ceritaHiasan", "ceritaSamaSisi"], n: 4 },
            { judul: "Bolak-balik & balok", jenis: ["ceritaJalanBalik", "ceritaBalok"], n: 5 },
            { judul: "Banyak segitiga", jenis: ["duaSegitiga", "trapesium", "ceritaBalok", "ceritaJalanBalik"], n: 5 },
            { judul: "Campuran Bukit", jenis: CERITA, n: 5 },
        ],
    },
];

const UJIAN = {
    n: 10,
    jenis: ["cariMiring", "cariSiku", "jenisSegitiga", "lengkapiTripel", "istimewa30", "istimewa45", "trapesium",
            "duaSegitiga", "jarakTitik", "ceritaTangga", "ceritaJalanBalik", "ceritaBalok", "ceritaSamaSisi", "ceritaLayangan"],
    lulus: 75,
};

// semua level dalam satu daftar: nomor 1..18
const LEVEL = [];
DUNIA.forEach((d, i) => d.level.forEach((l) => LEVEL.push({ ...l, nomor: LEVEL.length + 1, dunia: d, duniaKe: i + 1 })));
const LEVEL_TERAKHIR = LEVEL.length;

// buat n soal dari daftar jenis, merata dan tanpa soal kembar
function buatSoal(jenis, n, ctx) {
    const urutan = [];
    while (urutan.length < n) urutan.push(...kocok(jenis));
    const hasil = [], teksTerpakai = new Set();
    for (let i = 0; i < n; i++) {
        let soal, coba = 0;
        do { soal = BANK[urutan[i]](ctx); coba++; } while (teksTerpakai.has(soal.teks) && coba < 20);
        teksTerpakai.add(soal.teks);
        soal.jenis = urutan[i];
        hasil.push(soal);
    }
    return hasil;
}

// untuk pengujian otomatis
window.PhynLatihan = { BANK, DUNIA, LEVEL, UJIAN, buatSoal };

/* ---------- 4. Penyimpanan progres ---------- */
const KUNCI = "phyn-latihan";
function muatData() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KUNCI)); } catch (e) { d = null; }
    return Object.assign({ buka: 1, bintang: {}, skor: {}, coba: {}, ujian: null }, d || {});
}
let data = muatData();
function simpanData() {
    try { localStorage.setItem(KUNCI, JSON.stringify(data)); } catch (e) { /* abaikan */ }
}

const TOPIK = window.PHYN_TOPIK || [];
function infoTopik(slug) {
    const i = TOPIK.findIndex((t) => t.slug === slug);
    return i === -1 ? null : { nomor: i + 1, ...TOPIK[i] };
}

/* ---------- 5. Peta level ---------- */
const $ = (id) => document.getElementById(id);

function pesanMaskot() {
    if (data.buka > LEVEL_TERAKHIR) return data.ujian !== null && data.ujian >= UJIAN.lulus
        ? "Kamu sudah lulus ujian! 👑 Mau naikkan nilai? Ujian bisa diulang kapan saja."
        : "Semua level beres! Saatnya Ujian Akhir. Kamu pasti bisa 💪";
    if (data.buka <= 6) return "Di Kebun Apel kamu masih dibantu gambar, rumus, dan petunjuk. Manfaatkan ya! 🍎";
    if (data.buka <= 12) return "Selamat datang di Ladang Clover! Petunjuknya aku simpan dulu 😉";
    return "Bukit Tanpa Gambar nih. Gambar sketsa sendiri di Coretan, pasti kebantu! ✏️";
}

function perbaruiStatistik() {
    const bintang = Object.values(data.bintang).reduce((a, b) => a + b, 0);
    const skor = Object.values(data.skor).reduce((a, b) => a + b, 0) + (data.ujian || 0);
    const selesai = Object.keys(data.bintang).length;
    $("stat-bintang").textContent = bintang;
    $("stat-skor").textContent = skor;
    $("stat-selesai").textContent = `${selesai}/${LEVEL_TERAKHIR}`;
}

function gambarPeta() {
    const wadah = $("peta-dunia");
    wadah.innerHTML = DUNIA.map((d, i) => {
        const level = LEVEL.filter((l) => l.duniaKe === i + 1);
        return `
        <section class="dunia ${d.kelas}">
            ${d.hiasan.map((h, j) => `<span class="hiasan hiasan-${j + 1}" aria-hidden="true">${h}</span>`).join("")}
            <h2 class="nama-dunia"><span>${d.emoji}</span> ${d.nama}</h2>
            <div class="info-dunia">
                <span class="chip-dunia">Dunia ${i + 1} • Tingkat ${d.tingkat}</span>
                <span class="chip-dunia">Level ${level[0].nomor}–${level[level.length - 1].nomor}</span>
            </div>
            <p class="ket-dunia">${d.ket}</p>
            <div class="peta">
                <svg class="jalur" aria-hidden="true"></svg>
                ${level.map((l) => simpul(l)).join("")}
            </div>
        </section>`;
    }).join("");

    // Ujian
    const terbuka = data.buka > LEVEL_TERAKHIR;
    $("tombol-ujian").disabled = !terbuka;
    $("tombol-ujian").textContent = terbuka ? "Mulai Ujian 👑" : `🔒 Selesaikan Level ${LEVEL_TERAKHIR} dulu`;
    $("nilai-ujian").textContent = data.ujian === null ? "Belum pernah ujian"
        : `Nilai terbaik: ${data.ujian}${data.ujian >= UJIAN.lulus ? " · LULUS 👑" : ""}`;

    $("pesan-maskot").textContent = pesanMaskot();
    perbaruiStatistik();

    wadah.querySelectorAll(".simpul:not([disabled])").forEach((t) =>
        t.addEventListener("click", () => mulaiLevel(Number(t.dataset.level))));
    aturJalur();
}

function simpul(l) {
    const bintang = data.bintang[l.nomor] || 0;
    const sekarang = l.nomor === data.buka;
    const terkunci = l.nomor > data.buka;
    const status = terkunci ? "terkunci" : sekarang ? "sekarang" : "selesai";
    return `
    <div class="sel-simpul" data-urut="${l.nomor}">
        ${sekarang ? `<span class="penanda-kamu">🍎 Kamu di sini</span>` : ""}
        <button type="button" class="simpul ${status}" data-level="${l.nomor}" ${terkunci ? "disabled" : ""}
                aria-label="Level ${l.nomor}: ${l.judul}${terkunci ? " (terkunci)" : ""}">
            ${terkunci ? "🔒" : l.nomor}
        </button>
        <span class="bintang-simpul">${terkunci ? "" : "★".repeat(bintang) + "☆".repeat(3 - bintang)}</span>
        <span class="judul-simpul">${l.judul}<small>${l.n} soal</small></span>
    </div>`;
}

// susun simpul berkelok seperti ular, lalu gambar jalurnya
function aturJalur() {
    document.querySelectorAll(".peta").forEach((peta) => {
        const kolom = parseInt(getComputedStyle(peta).getPropertyValue("--kolom")) || 4;
        const sel = [...peta.querySelectorAll(".sel-simpul")];
        sel.forEach((s, i) => {
            const baris = Math.floor(i / kolom);
            const kol = baris % 2 === 0 ? i % kolom : kolom - 1 - (i % kolom);
            s.style.gridRow = baris + 1;
            s.style.gridColumn = kol + 1;
        });

        const kotak = peta.getBoundingClientRect();
        const titik = sel.map((s) => {
            const r = s.querySelector(".simpul").getBoundingClientRect();
            return [r.left + r.width / 2 - kotak.left, r.top + r.height / 2 - kotak.top];
        });
        const svg = peta.querySelector(".jalur");
        svg.setAttribute("width", kotak.width);
        svg.setAttribute("height", kotak.height);
        const garis = titik.map((t) => t.join(",")).join(" ");
        const selesai = sel.filter((s) => Number(s.dataset.urut) <= data.buka).length;
        const garisSelesai = titik.slice(0, Math.max(selesai, 1)).map((t) => t.join(",")).join(" ");
        svg.innerHTML = `
            <polyline points="${garis}" class="jalur-tepi"/>
            <polyline points="${garis}" class="jalur-isi"/>
            <polyline points="${garisSelesai}" class="jalur-selesai"/>`;
    });
}
window.addEventListener("resize", aturJalur);

/* ---------- 6. Arena soal ---------- */
let sesi = null;

function bukaArena() {
    $("arena").hidden = false;
    document.body.classList.add("arena-terbuka");
}

function tutupArena() {
    $("arena").hidden = true;
    document.body.classList.remove("arena-terbuka");
    sesi = null;
    gambarPeta();
}

function mulaiLevel(nomor) {
    const l = LEVEL[nomor - 1];
    sesi = {
        mode: "level", level: l,
        soal: buatSoal(l.jenis, l.n, { gambar: l.dunia.gambar }),
        ke: 0, benar: 0,
    };
    data.coba[nomor] = (data.coba[nomor] || 0) + 1;
    simpanData();
    bukaArena();
    tampilSoal();
}

function mulaiUjian() {
    const jenis = kocok(UJIAN.jenis).slice(0, UJIAN.n);
    sesi = {
        mode: "ujian",
        soal: buatSoal(jenis, UJIAN.n, { gambar: false }),
        ke: 0, jawaban: [],
    };
    bukaArena();
    tampilSoal();
}

function kepalaArena() {
    const total = sesi.soal.length;
    const judul = sesi.mode === "ujian" ? "👑 Ujian Akhir"
        : `Level ${sesi.level.nomor} · ${sesi.level.dunia.emoji} ${sesi.level.dunia.nama}`;
    $("arena-judul").textContent = judul;
    $("arena-hitung").textContent = `${Math.min(sesi.ke + 1, total)}/${total}`;
    $("arena-bar").style.width = `${(sesi.ke / total) * 100}%`;
}

function tampilSoal() {
    kepalaArena();
    const s = sesi.soal[sesi.ke];
    const dunia = sesi.mode === "level" ? sesi.level.dunia : null;
    const bantuan = dunia && dunia.bantuan;

    const isian = s.tipe === "isian"
        ? `<form class="jawab-soal" id="form-jawab">
               <input type="number" step="any" id="isi-jawab" placeholder="Jawabanmu" aria-label="Jawaban" autocomplete="off">
               <span class="satuan-soal">${s.satuan || ""}</span>
               <button type="submit" class="tombol-cek">${sesi.mode === "ujian" ? "Simpan & lanjut →" : "Cek jawaban"}</button>
           </form>`
        : `<div class="pilihan-soal" id="pilihan-soal">
               ${kocok(s.pilihan).map((p, i) => `<button type="button" data-i="${s.pilihan.indexOf(p)}">${p.teks}</button>`).join("")}
           </div>`;

    $("arena-badan").innerHTML = `
        <div class="kartu-soal">
            <span class="label-soal">Soal ${sesi.ke + 1}</span>
            <p class="teks-soal">${s.teks}</p>
            ${s.gambar && (!dunia || dunia.gambar) ? `<div class="wadah-gambar-soal">${s.gambar}</div>` : ""}
            ${bantuan ? `
                <div class="bantuan">
                    <span class="chip-rumus">📌 c² = a² + b² &nbsp;(c = sisi miring)</span>
                    <button type="button" class="tombol-petunjuk" id="tombol-petunjuk">💡 Petunjuk</button>
                </div>
                <p class="petunjuk" id="petunjuk" hidden>${s.petunjuk}</p>` : ""}
            ${sesi.mode === "level" && !dunia.gambar ? `<p class="ingat-sketsa">✏️ Tidak ada gambar. Coba sketsa dulu di <button type="button" class="buka-coretan-kecil">Coretan</button></p>` : ""}
            ${isian}
            <div class="umpan" id="umpan" aria-live="polite"></div>
        </div>`;

    if (bantuan) {
        $("tombol-petunjuk").addEventListener("click", () => {
            $("petunjuk").hidden = false;
            $("tombol-petunjuk").disabled = true;
        });
    }
    document.querySelectorAll(".kartu-soal .buka-coretan-kecil").forEach((t) =>
        t.addEventListener("click", () => $("buka-coretan").click()));

    if (s.tipe === "isian") {
        const input = $("isi-jawab");
        input.focus();
        $("form-jawab").addEventListener("submit", (e) => {
            e.preventDefault();
            const x = parseFloat(String(input.value).replace(",", "."));
            if (isNaN(x)) {
                input.classList.remove("goyang"); void input.offsetWidth; input.classList.add("goyang");
                input.focus();
                return;
            }
            periksa(dekat(x, s.jawaban), x, F(x));
        });
    } else {
        $("pilihan-soal").querySelectorAll("button").forEach((t) =>
            t.addEventListener("click", () => {
                const p = s.pilihan[Number(t.dataset.i)];
                t.classList.add(p.benar ? "benar" : "salah");
                periksa(!!p.benar, p, p.teks);
            }));
    }
}

function kunciInput() {
    document.querySelectorAll(".kartu-soal input, .kartu-soal button:not(.buka-coretan-kecil)").forEach((el) => (el.disabled = true));
}

function jawabanBenarTeks(s) {
    return s.tipe === "isian" ? `${F(s.jawaban)} ${s.satuan || ""}` : s.pilihan.find((p) => p.benar).teks;
}

function linkMateri(slug) {
    const t = infoTopik(slug);
    return t ? `<a class="link-materi" href="materi-${t.slug}.html">📖 Pelajari lagi: Materi ${t.nomor} · ${t.judul} →</a>` : "";
}

function periksa(benar, nilai, teksJawaban) {
    const s = sesi.soal[sesi.ke];
    kunciInput();

    // --- mode ujian: simpan saja, tanpa umpan balik ---
    if (sesi.mode === "ujian") {
        sesi.jawaban.push({ soal: s, benar, teksJawaban, nilai });
        sesi.ke++;
        if (sesi.ke < sesi.soal.length) setTimeout(tampilSoal, 250);
        else hasilUjian();
        return;
    }

    const umpan = $("umpan");
    if (benar) {
        sesi.benar++;
        const terakhir = sesi.ke + 1 === sesi.soal.length;
        umpan.className = "umpan benar";
        umpan.innerHTML = `
            <strong>${pilih(["Mantap! 🔥", "Benar banget! ✨", "Keren! 🍀", "Yes, betul! 🎉"])}</strong>
            <details><summary>Lihat pembahasan</summary>${s.pembahasan}</details>
            <button type="button" class="tombol-lanjut" id="tombol-lanjut">${terakhir ? "Selesaikan level 🎉" : "Soal berikutnya →"}</button>`;
        $("tombol-lanjut").focus();
        $("tombol-lanjut").addEventListener("click", () => {
            sesi.ke++;
            if (sesi.ke < sesi.soal.length) tampilSoal();
            else levelLulus();
        });
        return;
    }

    // --- jawaban salah: level gagal, mundur ke level sebelumnya ---
    const nomor = sesi.level.nomor;
    const diPerbatasan = nomor === data.buka;
    const tujuan = diPerbatasan ? Math.max(1, nomor - 1) : nomor;
    if (diPerbatasan) {
        data.buka = tujuan;
        simpanData();
    }
    const catatan = s.tipe === "isian" ? s.catatan(nilai) : (nilai.catatan || "");
    const teksTombol = !diPerbatasan ? `Ulangi Level ${nomor}`
        : nomor === 1 ? "Ulangi Level 1" : `Mundur ke Level ${tujuan}`;

    umpan.className = "umpan salah";
    umpan.innerHTML = `
        <strong>Yah, belum tepat 😢</strong>
        <p>${catatan}</p>
        <p class="jawaban-benar">Jawaban yang benar: <b>${jawabanBenarTeks(s)}</b></p>
        <details open><summary>Pembahasan</summary>${s.pembahasan}</details>
        ${linkMateri(s.topik)}
        <div class="info-mundur">
            ${diPerbatasan && nomor > 1
                ? `⬅️ Aturannya: salah satu soal berarti <b>mundur ke Level ${tujuan}</b>. Selesaikan lagi Level ${tujuan} untuk membuka Level ${nomor}.`
                : `🔁 Coba lagi dari awal level. Soalnya akan diacak ulang.`}
        </div>
        <div class="baris-tombol">
            <button type="button" class="tombol-lanjut" id="tombol-mundur">${teksTombol}</button>
            <button type="button" class="tombol-kedua" id="tombol-peta">Kembali ke peta</button>
        </div>`;
    $("tombol-mundur").addEventListener("click", () => mulaiLevel(tujuan));
    $("tombol-peta").addEventListener("click", tutupArena);
}

function levelLulus() {
    const nomor = sesi.level.nomor;
    const percobaan = data.coba[nomor] || 1;
    const bintang = percobaan === 1 ? 3 : percobaan === 2 ? 2 : 1;
    data.bintang[nomor] = Math.max(data.bintang[nomor] || 0, bintang);
    data.skor[nomor] = Math.max(data.skor[nomor] || 0, sesi.soal.length * 10);
    if (nomor === data.buka) data.buka = nomor + 1;
    data.coba[nomor] = 0;
    simpanData();

    $("arena-bar").style.width = "100%";
    const adaBerikut = nomor < LEVEL_TERAKHIR;
    const pindahDunia = adaBerikut && LEVEL[nomor].duniaKe !== sesi.level.duniaKe;
    $("arena-badan").innerHTML = `
        <div class="kartu-soal kartu-hasil">
            <div class="bintang-besar">${"⭐".repeat(bintang)}${"<span class='redup'>⭐</span>".repeat(3 - bintang)}</div>
            <h2>Level ${nomor} selesai!</h2>
            <p>${sesi.soal.length} dari ${sesi.soal.length} soal benar · +${sesi.soal.length * 10} skor</p>
            <p class="ket-bintang">${bintang === 3 ? "Sempurna di percobaan pertama! 🔥" : `Lulus di percobaan ke-${percobaan}. Ulangi level ini untuk mengejar ⭐⭐⭐`}</p>
            ${pindahDunia ? `<div class="info-mundur">🎉 Kamu membuka dunia baru: <b>${LEVEL[nomor].dunia.emoji} ${LEVEL[nomor].dunia.nama}</b>. ${LEVEL[nomor].dunia.ket}</div>` : ""}
            ${!adaBerikut ? `<div class="info-mundur">👑 Semua level selesai! <b>Ujian Akhir</b> sudah terbuka.</div>` : ""}
            <div class="baris-tombol">
                ${adaBerikut ? `<button type="button" class="tombol-lanjut" id="tombol-berikut">Lanjut Level ${nomor + 1} →</button>` : ""}
                <button type="button" class="${adaBerikut ? "tombol-kedua" : "tombol-lanjut"}" id="tombol-peta">Kembali ke peta</button>
            </div>
        </div>`;
    konfeti();
    if (adaBerikut) $("tombol-berikut").addEventListener("click", () => mulaiLevel(nomor + 1));
    $("tombol-peta").addEventListener("click", tutupArena);
}

function hasilUjian() {
    const jumlahBenar = sesi.jawaban.filter((j) => j.benar).length;
    const nilai = Math.round((jumlahBenar / sesi.soal.length) * 100);
    const lulus = nilai >= UJIAN.lulus;
    data.ujian = Math.max(data.ujian || 0, nilai);
    simpanData();

    // kelompokkan kesalahan per topik materi
    const salah = sesi.jawaban.filter((j) => !j.benar);
    const perTopik = {};
    salah.forEach((j) => { perTopik[j.soal.topik] = (perTopik[j.soal.topik] || 0) + 1; });
    const rekomendasi = Object.entries(perTopik).sort((a, b) => b[1] - a[1]).map(([slug, n]) => {
        const t = infoTopik(slug);
        return t ? `<li><a href="materi-${t.slug}.html"><span class="no-rek">${t.nomor}</span><span><b>${t.judul}</b><small>${n} soal salah</small></span><span>→</span></a></li>` : "";
    }).join("");

    $("arena-bar").style.width = "100%";
    $("arena-hitung").textContent = `${sesi.soal.length}/${sesi.soal.length}`;
    $("arena-badan").innerHTML = `
        <div class="kartu-soal kartu-hasil ${lulus ? "lulus" : ""}">
            <div class="nilai-besar">${nilai}</div>
            <h2>${lulus ? "Selamat, kamu LULUS! 👑" : "Belum lulus, tapi kamu sudah dekat 💪"}</h2>
            <p>${jumlahBenar} dari ${sesi.soal.length} soal benar · batas lulus ${UJIAN.lulus}</p>
            ${salah.length ? `
                <div class="rekomendasi">
                    <h3>📖 Rekomendasi materi untukmu</h3>
                    <p>Kesalahanmu paling banyak ada di materi ini. Pelajari lagi, lalu coba ujian ulang.</p>
                    <ul>${rekomendasi}</ul>
                </div>
                <div class="daftar-salah">
                    <h3>Soal yang masih salah</h3>
                    ${salah.map((j, i) => `
                        <details>
                            <summary>${i + 1}. ${j.soal.teks}</summary>
                            <p>Jawabanmu: <b class="merah">${j.teksJawaban}</b> · Jawaban benar: <b>${jawabanBenarTeks(j.soal)}</b></p>
                            <p>${j.soal.tipe === "isian" ? j.soal.catatan(j.nilai) : (j.nilai.catatan || "")}</p>
                            ${j.soal.pembahasan}
                            ${linkMateri(j.soal.topik)}
                        </details>`).join("")}
                </div>` : `<p class="ket-bintang">Sempurna, tidak ada yang salah! Kamu resmi Master Pythagoras 🔥</p>`}
            <div class="baris-tombol">
                <button type="button" class="tombol-lanjut" id="tombol-ulang-ujian">Ulangi ujian</button>
                <button type="button" class="tombol-kedua" id="tombol-peta">Kembali ke peta</button>
            </div>
        </div>`;
    if (lulus) konfeti();
    $("tombol-ulang-ujian").addEventListener("click", mulaiUjian);
    $("tombol-peta").addEventListener("click", tutupArena);
}

function konfeti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < 24; i++) {
        const s = document.createElement("span");
        s.className = "konfeti";
        s.textContent = ["🍎", "🍀", "⭐"][i % 3];
        s.style.left = window.innerWidth / 2 + "px";
        s.style.top = window.innerHeight / 2 + "px";
        const sudut = Math.random() * Math.PI * 2, jarak = 120 + Math.random() * 220;
        s.style.setProperty("--dx", Math.cos(sudut) * jarak + "px");
        s.style.setProperty("--dy", Math.sin(sudut) * jarak - 80 + "px");
        s.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1300);
    }
}

/* ---------- Mulai ---------- */
$("tombol-ujian").addEventListener("click", mulaiUjian);
$("arena-keluar").addEventListener("click", () => {
    if (sesi && sesi.mode === "level" && sesi.ke > 0 && !confirm("Keluar dari level? Progres soal di level ini tidak disimpan.")) return;
    tutupArena();
});
$("tombol-reset").addEventListener("click", () => {
    if (!confirm("Hapus semua progres latihan (bintang, skor, level)? Ini tidak bisa dibatalkan.")) return;
    data = { buka: 1, bintang: {}, skor: {}, coba: {}, ujian: null };
    simpanData();
    gambarPeta();
});
gambarPeta();
