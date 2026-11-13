from flask import Flask, render_template, Response

app = Flask(__name__)

@app.route("/")
def landing():
    return render_template("landing.html")

@app.route("/beranda.html")
def beranda():
    return render_template("index.html")

@app.route("/gambar/<bentuk>.svg")
def gambar(bentuk):

    if bentuk == "segitiga":
        svg = """
        <svg viewBox="0 0 500 330"
             xmlns="http://www.w3.org/2000/svg">

            <path d="M100 260 L100 60 L390 260 Z"
                  fill="#F2E1DC"
                  stroke="#7D2027"
                  stroke-width="5"/>

            <path d="M100 235 L125 235 L125 260"
                  fill="none"
                  stroke="#7D2027"
                  stroke-width="3"/>

            <text x="65" y="160" font-size="24">a</text>
            <text x="240" y="295" font-size="24">b</text>
            <text x="265" y="135" font-size="24">c</text>
        </svg>
        """

    elif bentuk == "persegi":
        svg = """
        <svg viewBox="0 0 500 330"
             xmlns="http://www.w3.org/2000/svg">

            <rect x="80" y="60" width="340" height="220"
                  fill="#F3E6CC"
                  stroke="#B07D3A"
                  stroke-width="5"/>

            <path d="M80 280 L420 60"
                  stroke="#7D2027"
                  stroke-width="5"/>

            <text x="225" y="305" font-size="24">Panjang</text>
            <text x="30" y="175" font-size="24">Lebar</text>
            <text x="245" y="155" font-size="24">d</text>
        </svg>
        """

    elif bentuk == "tangga":
        svg = """
        <svg viewBox="0 0 500 330"
             xmlns="http://www.w3.org/2000/svg">

            <path d="M100 40 L100 280 L420 280"
                  fill="none"
                  stroke="#2B1D1E"
                  stroke-width="7"/>

            <path d="M100 65 L370 280"
                  stroke="#7D2027"
                  stroke-width="8"/>

            <path d="M100 255 L125 255 L125 280"
                  fill="none"
                  stroke="#7D2027"
                  stroke-width="3"/>

            <text x="55" y="175" font-size="23">Tinggi</text>
            <text x="225" y="315" font-size="23">Jarak</text>
            <text x="250" y="145" font-size="23">Tangga</text>
        </svg>
        """

    else:
        return Response("Gambar tidak ditemukan", status=404)

    return Response(svg, mimetype="image/svg+xml")

# ---------------------------------------------------------------
# Daftar topik materi. Urutan di sini = urutan belajar yang disarankan.
# Isi tiap topik ada di templates/materi/<slug>.html
# ---------------------------------------------------------------
TOPIK = [
    {
        "slug": "prasyarat",
        "kelompok": "Dasar",
        "judul": "Kuadrat & Akar Kuadrat",
        "ringkasan": "Bekal hitungan sebelum masuk ke Pythagoras.",
        "tujuan": ["Menghitung kuadrat suatu bilangan",
                   "Mencari akar kuadrat suatu bilangan"],
    },
    {
        "slug": "segitiga-siku",
        "kelompok": "Dasar",
        "judul": "Mengenal Segitiga Siku-Siku",
        "ringkasan": "Jenis segitiga, sisi siku-siku, dan sisi miring.",
        "tujuan": ["Membedakan segitiga lancip, siku-siku, dan tumpul",
                   "Menemukan sisi miring (hipotenusa) pada segitiga siku-siku"],
    },
    {
        "slug": "menemukan-teorema",
        "kelompok": "Dasar",
        "judul": "Menemukan Teorema Pythagoras",
        "ringkasan": "Dari luas persegi ke rumus a² + b² = c².",
        "tujuan": ["Menjelaskan asal rumus Pythagoras lewat luas persegi",
                   "Menuliskan rumus Pythagoras tanpa harus menghafal"],
    },
    {
        "slug": "menghitung-sisi",
        "kelompok": "Menghitung",
        "judul": "Menghitung Panjang Sisi",
        "ringkasan": "Kapan ditambah, kapan dikurang?",
        "tujuan": ["Menghitung panjang sisi miring",
                   "Menghitung panjang sisi siku-siku"],
    },
    {
        "slug": "jenis-segitiga",
        "kelompok": "Menghitung",
        "judul": "Siku-Siku, Lancip, atau Tumpul?",
        "ringkasan": "Kebalikan teorema Pythagoras untuk mengecek jenis segitiga.",
        "tujuan": ["Menentukan jenis segitiga dari panjang ketiga sisinya"],
    },
    {
        "slug": "tripel",
        "kelompok": "Menghitung",
        "judul": "Tripel Pythagoras",
        "ringkasan": "Pasangan bilangan 'ajaib' yang membuat hitungan cepat.",
        "tujuan": ["Mengenali tripel Pythagoras",
                   "Membuat tripel Pythagoras sendiri"],
    },
    {
        "slug": "segitiga-istimewa",
        "kelompok": "Menghitung",
        "judul": "Segitiga Siku-Siku Istimewa",
        "ringkasan": "Perbandingan sisi pada sudut 45° dan 30°–60°.",
        "tujuan": ["Memakai perbandingan 1 : 1 : √2",
                   "Memakai perbandingan 1 : √3 : 2"],
    },
    {
        "slug": "bangun-gabungan",
        "kelompok": "Penerapan",
        "judul": "Soal dengan Banyak Segitiga",
        "ringkasan": "Memecah bangun rumit menjadi segitiga siku-siku.",
        "tujuan": ["Menemukan segitiga siku-siku di dalam bangun yang rumit",
                   "Menghitung sisi pada dua segitiga yang saling terhubung"],
    },
    {
        "slug": "penerapan",
        "kelompok": "Penerapan",
        "judul": "Soal Cerita Sehari-hari",
        "ringkasan": "Dari cerita ke gambar, dari gambar ke jawaban.",
        "tujuan": ["Mengubah soal cerita menjadi gambar segitiga",
                   "Menyelesaikan masalah sehari-hari dengan Pythagoras"],
    },
]


@app.route("/materi.html")
def materi():
    return render_template("materi.html", semua_topik=TOPIK, aktif="materi")


@app.route("/materi-<slug>.html")
def materi_topik(slug):
    nomor = next((i for i, t in enumerate(TOPIK) if t["slug"] == slug), None)
    if nomor is None:
        return Response("Materi tidak ditemukan", status=404)

    return render_template(
        f"materi/{slug}.html",
        topik=TOPIK[nomor],
        nomor=nomor + 1,
        sebelum=TOPIK[nomor - 1] if nomor > 0 else None,
        sesudah=TOPIK[nomor + 1] if nomor + 1 < len(TOPIK) else None,
        semua_topik=TOPIK,
        aktif="materi",
    )

@app.route("/contoh.html")
def contoh():
    return render_template("contoh.html")

@app.route("/latihan.html")
def latihan():
    return render_template("latihan.html")


if __name__ == "__main__":
    app.run(debug=True)