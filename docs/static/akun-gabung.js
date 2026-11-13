/* =========================================================
   PHYNthagoras — aturan menggabungkan progres
   Dipakai saat siswa masuk: progres di perangkat ini digabung
   dengan progres yang tersimpan di akunnya, tanpa ada yang hilang.
   ========================================================= */
(function () {
    // kunci localStorage yang ikut disimpan ke akun
    const KUNCI = [
        "phyn-materi-dibuka",   // daftar materi yang sudah dibuka
        "phyn-latihan",         // level, bintang, skor, nilai ujian
        "phyn-streak",          // streak tantangan harian
        "phyn-harian",          // tanggal terakhir tantangan harian selesai
        "phyn-tebak-rekor",     // rekor Tebak Kilat
        "phyn-nama",            // nama panggilan
    ];

    const maksObj = (a = {}, b = {}) => {
        const hasil = { ...a };
        Object.entries(b).forEach(([k, v]) => { hasil[k] = Math.max(hasil[k] || 0, v || 0); });
        return hasil;
    };

    const ATURAN = {
        // gabungan: materi yang dibuka di mana pun dihitung
        "phyn-materi-dibuka": (a = [], b = []) => [...new Set([...(a || []), ...(b || [])])],

        // ambil yang paling maju dari keduanya
        "phyn-latihan": (a, b) => {
            if (!a) return b;
            if (!b) return a;
            const pakaiA = (a.buka || 1) >= (b.buka || 1);
            return {
                buka: Math.max(a.buka || 1, b.buka || 1),
                bintang: maksObj(a.bintang, b.bintang),
                skor: maksObj(a.skor, b.skor),
                coba: (pakaiA ? a.coba : b.coba) || {},
                ujian: a.ujian == null ? b.ujian : b.ujian == null ? a.ujian : Math.max(a.ujian, b.ujian),
            };
        },

        // streak yang terakhir diperbarui; kalau sama harinya, yang lebih panjang
        "phyn-streak": (a, b) => {
            if (!a) return b;
            if (!b) return a;
            if (a.terakhir !== b.terakhir) return a.terakhir > b.terakhir ? a : b;
            return a.jumlah >= b.jumlah ? a : b;
        },

        "phyn-harian": (a, b) => ((a || "") > (b || "") ? a : b) || "",
        "phyn-tebak-rekor": (a, b) => Math.max(a || 0, b || 0),
        "phyn-nama": (a, b) => a || b || "",
    };

    // gabungkan dua kumpulan progres { kunci: nilai }
    function gabung(lokal = {}, awan = {}) {
        const hasil = {};
        KUNCI.forEach((k) => {
            const a = lokal[k], b = awan[k];
            if (a === undefined && b === undefined) return;
            const nilai = a === undefined ? b : b === undefined ? a : ATURAN[k](a, b);
            if (nilai !== undefined && nilai !== null && nilai !== "") hasil[k] = nilai;
        });
        return hasil;
    }

    // baca semua progres dari localStorage
    function bacaLokal() {
        const hasil = {};
        KUNCI.forEach((k) => {
            try {
                const isi = localStorage.getItem(k);
                if (isi !== null) hasil[k] = JSON.parse(isi);
            } catch (e) { /* abaikan data rusak */ }
        });
        return hasil;
    }

    function tulisLokal(data) {
        KUNCI.forEach((k) => {
            try {
                if (k in data) localStorage.setItem(k, JSON.stringify(data[k]));
                else localStorage.removeItem(k);
            } catch (e) { /* abaikan */ }
        });
    }

    function hapusLokal() {
        KUNCI.forEach((k) => { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } });
    }

    window.PhynGabung = { KUNCI, gabung, bacaLokal, tulisLokal, hapusLokal };
})();
