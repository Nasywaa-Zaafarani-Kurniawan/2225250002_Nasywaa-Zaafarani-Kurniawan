/* =========================================================
   Hujan apel 🍎 & clover 🍀 (dekorasi latar)
   Dipakai di halaman awal, halaman pilih Materi, dan halaman pilih Contoh Soal.
   Cukup sertakan: <script src="static/hujan.js"></script>
   ========================================================= */
(function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ---------- Pengaturan ----------
    const JENIS = ["apel", "clover", "apel-gigit", "clover"]; // jumlah clover = jumlah total apel
    const JUMLAH = window.innerWidth < 600 ? 8 : 16;          // HP : laptop
    const DURASI = [8, 13];                                    // detik jatuh dari atas ke bawah

    // ---------- Gaya ----------
    const gaya = document.createElement("style");
    gaya.textContent = `
        .hujan {
            position: fixed;
            inset: 0;
            z-index: -1;            /* di belakang konten */
            overflow: hidden;
            pointer-events: none;
        }
        .hujan .butir {
            position: absolute;
            top: -30px;
            width: var(--ukuran);
            height: var(--ukuran);
            opacity: 0.85;
            will-change: transform;
            animation: hujan-jatuh var(--durasi) linear var(--tunda) infinite;
        }
        .hujan .butir svg { width: 100%; height: 100%; display: block; }
        /* jatuh ke bawah, sedikit miring seperti tertiup angin */
        @keyframes hujan-jatuh {
            from { transform: translate(0, 0) rotate(0deg); }
            to   { transform: translate(14vh, calc(100vh + 60px)) rotate(var(--putar)); }
        }`;
    document.head.appendChild(gaya);

    // ---------- Bentuk apel, apel digigit, dan clover ----------
    const BENTUK = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
        <defs>
            <path id="badan-apel" d="M16 9c-2-1.5-5-2-7.5-.5C5 10.5 4 15 5.5 19.5 7 24 10 28 13 28c1.2 0 2-.6 3-.6s1.8.6 3 .6c3 0 6-4 7.5-8.5C28 15 27 10.5 23.5 8.5 21 7 18 7.5 16 9z"/>
            <mask id="gigit-kulit">
                <rect width="32" height="32" fill="white"/>
                <circle cx="29" cy="14" r="4.2" fill="black"/><circle cx="28.6" cy="20.6" r="4" fill="black"/>
            </mask>
            <mask id="gigit-daging">
                <rect width="32" height="32" fill="white"/>
                <circle cx="29" cy="14" r="3.4" fill="black"/><circle cx="28.6" cy="20.6" r="3.2" fill="black"/>
            </mask>
            <symbol id="apel" viewBox="0 0 32 32">
                <use href="#badan-apel" fill="#7d2027"/>
                <ellipse cx="10.5" cy="14" rx="1.5" ry="3" fill="#fff" opacity=".28" transform="rotate(20 10.5 14)"/>
                <path d="M16 9c0-2 .5-4 2-5.5" stroke="#5b3a29" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                <path d="M17.5 6c2-2.5 5-3 7-2-1 2.5-4 3.5-7 2z" fill="#5f8f4e"/>
            </symbol>
            <symbol id="apel-gigit" viewBox="0 0 32 32">
                <use href="#badan-apel" fill="#f3e3c3" mask="url(#gigit-daging)"/>
                <use href="#badan-apel" fill="#7d2027" mask="url(#gigit-kulit)"/>
                <ellipse cx="10.5" cy="14" rx="1.5" ry="3" fill="#fff" opacity=".28" transform="rotate(20 10.5 14)"/>
                <path d="M16 9c0-2 .5-4 2-5.5" stroke="#5b3a29" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                <path d="M17.5 6c2-2.5 5-3 7-2-1 2.5-4 3.5-7 2z" fill="#5f8f4e"/>
            </symbol>
            <path id="daun-clover" d="M12 12C9 9.5 6.5 7 8.3 4.6 9.6 3 11.4 3.6 12 5.2 12.6 3.6 14.4 3 15.7 4.6 17.5 7 15 9.5 12 12z"/>
            <symbol id="clover" viewBox="0 0 24 24">
                <g fill="#5f8f4e" stroke="#f7f2e8" stroke-width="1.1" stroke-linejoin="round">
                    <use href="#daun-clover"/>
                    <use href="#daun-clover" transform="rotate(90 12 12)"/>
                    <use href="#daun-clover" transform="rotate(180 12 12)"/>
                    <use href="#daun-clover" transform="rotate(270 12 12)"/>
                </g>
                <path d="M12 12q1.5 5 5 9" stroke="#4f7a43" stroke-width="1.4" fill="none" stroke-linecap="round"/>
            </symbol>
        </defs>
    </svg>`;

    const wadah = document.createElement("div");
    wadah.className = "hujan";
    wadah.setAttribute("aria-hidden", "true");
    wadah.innerHTML = BENTUK;

    // taruh di atas latar dekoratif (kalau ada), tetapi di belakang konten
    const latar = document.querySelector(".latar");
    if (latar) latar.after(wadah);
    else document.body.prepend(wadah);

    // ---------- Butir hujan ----------
    const acak = (min, max) => min + Math.random() * (max - min);
    for (let i = 0; i < JUMLAH; i++) {
        const jenis = JENIS[i % JENIS.length];
        const ukuran = jenis === "clover" ? acak(10, 14) : acak(13, 19);
        const durasi = acak(DURASI[0], DURASI[1]);

        const butir = document.createElement("div");
        butir.className = "butir";
        butir.style.left = acak(-5, 100) + "vw";
        butir.style.setProperty("--ukuran", ukuran + "px");
        butir.style.setProperty("--durasi", durasi + "s");
        butir.style.setProperty("--tunda", -acak(0, durasi) + "s"); // hujan sudah turun sejak halaman dibuka
        butir.style.setProperty("--putar", acak(-90, 90) + "deg");
        butir.innerHTML = `<svg viewBox="0 0 32 32"><use href="#${jenis}"/></svg>`;
        wadah.appendChild(butir);
    }
})();
