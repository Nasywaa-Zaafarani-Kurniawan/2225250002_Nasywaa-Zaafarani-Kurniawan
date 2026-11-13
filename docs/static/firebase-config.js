/* =========================================================
   Konfigurasi Firebase untuk fitur akun (progres tersimpan online).

   Cara mengisi: Firebase Console → Project settings → General →
   "Your apps" → pilih aplikasi Web → salin nilai firebaseConfig ke sini.

   Selama apiKey masih kosong, fitur akun mati dan web tetap berjalan
   seperti biasa (progres hanya tersimpan di browser).

   Catatan: nilai-nilai ini memang boleh terlihat publik. Keamanan data
   diatur oleh "Rules" di Firestore, bukan oleh kerahasiaan apiKey.
   ========================================================= */
window.PHYN_FIREBASE = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
};
