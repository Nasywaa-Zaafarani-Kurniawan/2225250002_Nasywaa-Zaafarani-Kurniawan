/* =========================================================
   Jejak kursor: apel 🍎 dan clover 🍀 yang mengikuti mouse
   - hanya untuk mouse (tidak muncul di HP/layar sentuh)
   - mati saat kertas Coretan dibuka
   - mati jika pengguna memilih "kurangi animasi"
   ========================================================= */
(function () {
    const pakaiMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!pakaiMouse || kurangiGerak) return;

    const gaya = document.createElement("style");
    gaya.textContent = `
        .jejak {
            position: fixed;
            left: 0;
            top: 0;
            z-index: 80;
            pointer-events: none;
            user-select: none;
            line-height: 1;
            will-change: transform, opacity;
            animation: jejak-hilang var(--umur) ease-out forwards;
        }
        @keyframes jejak-hilang {
            from {
                opacity: 1;
                transform: translate(var(--x), var(--y)) translate(-50%, -50%) rotate(0deg) scale(1);
            }
            to {
                opacity: 0;
                transform: translate(calc(var(--x) + var(--gx)), calc(var(--y) + var(--gy)))
                           translate(-50%, -50%) rotate(var(--putar)) scale(0.4);
            }
        }`;
    document.head.appendChild(gaya);

    const JARAK_MIN = 34;     // piksel gerakan sebelum butir baru muncul
    const MAKS_BUTIR = 18;    // batas butir yang tampil bersamaan
    let terakhir = null;
    let urutan = 0;
    let aktif = 0;

    function coretanTerbuka() {
        const panel = document.getElementById("coretan");
        return panel && !panel.hidden;
    }

    window.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse" || coretanTerbuka()) return;
        if (terakhir && Math.hypot(e.clientX - terakhir[0], e.clientY - terakhir[1]) < JARAK_MIN) return;
        if (aktif >= MAKS_BUTIR) return;
        terakhir = [e.clientX, e.clientY];

        const butir = document.createElement("span");
        butir.className = "jejak";
        butir.textContent = urutan++ % 2 === 0 ? "🍎" : "🍀";
        const umur = 700 + Math.random() * 400;
        butir.style.fontSize = 13 + Math.random() * 7 + "px";
        butir.style.setProperty("--x", e.clientX + "px");
        butir.style.setProperty("--y", e.clientY + "px");
        butir.style.setProperty("--gx", (Math.random() * 30 - 15) + "px");
        butir.style.setProperty("--gy", 24 + Math.random() * 26 + "px");   // jatuh sedikit ke bawah
        butir.style.setProperty("--putar", (Math.random() * 240 - 120) + "deg");
        butir.style.setProperty("--umur", umur + "ms");

        document.body.appendChild(butir);
        aktif++;
        setTimeout(() => { butir.remove(); aktif--; }, umur);
    }, { passive: true });
})();
