from flask import Flask, render_template, request, Response

app = Flask(__name__)

@app.route("/")
def landing():
    return render_template("landing.html")

@app.route("/beranda")
def beranda():
    bentuk = request.args.get("bentuk", "segitiga")

    pilihan = ["segitiga", "persegi", "tangga"]

    if bentuk not in pilihan:
        bentuk = "segitiga"

    return render_template("index.html", bentuk=bentuk)

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

@app.route("/materi")
def materi():
    return render_template("materi.html")

@app.route("/contoh")
def contoh():
    return render_template("contoh.html")

@app.route("/latihan")
def latihan():
    return render_template("latihan.html")


if __name__ == "__main__":
    app.run(debug=True)