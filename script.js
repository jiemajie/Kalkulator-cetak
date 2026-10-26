// Kredensial Login Sederhana
const VALID_USER = "admin";
const VALID_PASS = "123";

// Elemen Login
const pageLogin = document.getElementById("pageLogin");
const pageKalkulator = document.getElementById("pageKalkulator");
const formLogin = document.getElementById("formLogin");
const inputUser = document.getElementById("username");
const inputPass = document.getElementById("password");
const loginError = document.getElementById("loginError");
const btnLogout = document.getElementById("btnLogout");

// Elemen Input Kalkulator
const inputPanjang = document.getElementById("panjang");
const inputLebar = document.getElementById("lebar");
const inputBleed = document.getElementById("bleed");
const inputJumlahJadi = document.getElementById("jumlahJadi");
const inputHargaLembar = document.getElementById("hargaLembar");
const inputBiayaFinishing1 = document.getElementById("biayaFinishing1");
const inputBiayaFinishing2 = document.getElementById("biayaFinishing2");
const btnHapus = document.getElementById("btnHapus");

// Elemen Hasil
const elUkuranPotong = document.getElementById("ukuranPotong");
const elPcsA = document.getElementById("pcsA");
const elLayoutA = document.getElementById("layoutA");
const elPcsB = document.getElementById("pcsB");
const elLayoutB = document.getElementById("layoutB");

const boxOpsiA = document.getElementById("boxOpsiA");
const boxOpsiB = document.getElementById("boxOpsiB");

const elTerbanyakValue = document.getElementById("terbanyakValue");
const elTerbanyakOpsi = document.getElementById("terbanyakOpsi");
const elTotalLembar = document.getElementById("totalLembar");
const elBiayaCetak = document.getElementById("biayaCetak");
const elBiayaFinishingTotal = document.getElementById("biayaFinishingTotal");
const elTotalBiaya = document.getElementById("totalBiaya");
const elBiayaPPN = document.getElementById("biayaPPN");
const elTotalSetelahPPN = document.getElementById("totalSetelahPPN");

const canvas = document.getElementById("canvasPreview");
const ctx = canvas.getContext("2d");

// Ukuran Area Cetak Tetap (dalam cm)
const AREA_PANJANG = 31;
const AREA_LEBAR = 46;

// LOGIKA LOGIN & LOGOUT
formLogin.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = inputUser.value.trim();
  const password = inputPass.value.trim();

  if (username === VALID_USER && password === VALID_PASS) {
    loginError.textContent = "";
    pageLogin.classList.add("hidden");
    pageKalkulator.classList.remove("hidden");
    hitung(); // Trigger kalkulasi awal
  } else {
    loginError.textContent = "Username atau password salah!";
  }
});

btnLogout.addEventListener("click", function () {
  pageKalkulator.classList.add("hidden");
  pageLogin.classList.remove("hidden");
  inputUser.value = "";
  inputPass.value = "";
  loginError.textContent = "";
});

// LOGIKA KALKULATOR
function hitung() {
  // Input Values
  const p = parseFloat(inputPanjang.value) || 0;
  const l = parseFloat(inputLebar.value) || 0;
  const bleed = parseFloat(inputBleed.value) || 0;
  const totalTargetPcs = parseInt(inputJumlahJadi.value) || 0;
  const hargaPerLembar = parseFloat(inputHargaLembar.value) || 0;

  // --- TAMBAHAN 2 OPSI FINISHING ---
  const finishing1PerLembar = parseFloat(inputBiayaFinishing1.value) || 0;
  const finishing2PerLembar = parseFloat(inputBiayaFinishing2.value) || 0;
  // Gabungkan total finishing per lembar
  const finishingPerLembarTotal = finishing1PerLembar + finishing2PerLembar;

  // Ukuran total setelah ditambahkan Bleed (dua sisi)
  const pTotal = p + bleed * 2;
  const lTotal = l + bleed * 2;

  elUkuranPotong.textContent =
    p > 0 && l > 0 ? `${pTotal.toFixed(1)} x ${lTotal.toFixed(1)} cm` : "-";

  // JIKA INPUT KOSONG / KURANG DARI 0, RESET SEMUA TAMPILAN
  if (pTotal <= 0 || lTotal <= 0) {
    elPcsA.textContent = "0 pcs / lembar";
    elLayoutA.textContent = "Layout: 0 x 0";
    elPcsB.textContent = "0 pcs / lembar";
    elLayoutB.textContent = "Layout: 0 x 0";

    elTerbanyakValue.textContent = "0 Pcs / Lembar";
    elTerbanyakOpsi.textContent = "Menggunakan Opsi -";

    elTotalLembar.textContent = "0 Lembar";
    elBiayaCetak.textContent = "Rp 0";
    elBiayaFinishingTotal.textContent = "Rp 0";
    elTotalBiaya.textContent = "Rp 0";
    elBiayaPPN.textContent = "Rp 0";
    elTotalSetelahPPN.textContent = "Rp 0";

    boxOpsiA.classList.remove("active");
    boxOpsiB.classList.remove("active");

    gambarLayout(0, 0, 0, 0, 0, 0, 0);
    return;
  }

  // Opsi A: Ukuran Jadi Panjang x Lebar
  const colsA = Math.floor(AREA_PANJANG / pTotal);
  const rowsA = Math.floor(AREA_LEBAR / lTotal);
  const totalA = colsA * rowsA;

  // Opsi B: Ukuran Jadi Diputar (Lebar x Panjang)
  const colsB = Math.floor(AREA_PANJANG / lTotal);
  const rowsB = Math.floor(AREA_LEBAR / pTotal);
  const totalB = colsB * rowsB;

  // Render text Opsi A
  elPcsA.textContent = `${totalA} pcs / lembar`;
  elLayoutA.textContent = `Layout: ${colsA} kolom x ${rowsA} baris`;

  // Render text Opsi B
  elPcsB.textContent = `${totalB} pcs / lembar`;
  elLayoutB.textContent = `Layout: ${colsB} kolom x ${rowsB} baris`;

  // Tentukan mana yang paling banyak
  let terbanyakPcs = 0;
  let opsiTerpilih = "A";
  let bestCols = 0;
  let bestRows = 0;
  let bestW = pTotal;
  let bestH = lTotal;

  if (totalA >= totalB) {
    terbanyakPcs = totalA;
    opsiTerpilih = "A";
    bestCols = colsA;
    bestRows = rowsA;
    bestW = pTotal;
    bestH = lTotal;

    boxOpsiA.classList.add("active");
    boxOpsiB.classList.remove("active");
  } else {
    terbanyakPcs = totalB;
    opsiTerpilih = "B";
    bestCols = colsB;
    bestRows = rowsB;
    bestW = lTotal;
    bestH = pTotal;

    boxOpsiB.classList.add("active");
    boxOpsiA.classList.remove("active");
  }

  // Tampilkan Hasil Utama
  elTerbanyakValue.textContent = `${terbanyakPcs} Pcs / Lembar`;
  elTerbanyakOpsi.textContent = `Menggunakan Opsi ${opsiTerpilih} (${opsiTerpilih === "A" ? "Normal" : "Diputar 90°"})`;

  // Kebutuhan Lembar & Rincian Biaya
  let lembarDibutuhkan = 0;
  let totalBiayaCetak = 0;
  let totalBiayaFinishing = 0;
  let estimasiTotalBiaya = 0;
  let nilaiPPN = 0;
  let totalDenganPPN = 0;

  if (terbanyakPcs > 0 && totalTargetPcs > 0) {
    lembarDibutuhkan = Math.ceil(totalTargetPcs / terbanyakPcs);
    totalBiayaCetak = lembarDibutuhkan * hargaPerLembar;

    // Perhitungan biaya finishing menggunakan gabungan 2 opsi finishing
    totalBiayaFinishing = lembarDibutuhkan * finishingPerLembarTotal;

    estimasiTotalBiaya = totalBiayaCetak + totalBiayaFinishing;
    nilaiPPN = estimasiTotalBiaya * 0.11;
    totalDenganPPN = estimasiTotalBiaya + nilaiPPN;
  }

  elTotalLembar.textContent = `${lembarDibutuhkan.toLocaleString("id-ID")} Lembar`;
  elBiayaCetak.textContent = `Rp ${totalBiayaCetak.toLocaleString("id-ID")}`;
  elBiayaFinishingTotal.textContent = `Rp ${totalBiayaFinishing.toLocaleString("id-ID")}`;
  elTotalBiaya.textContent = `Rp ${estimasiTotalBiaya.toLocaleString("id-ID")}`;
  elBiayaPPN.textContent = `Rp ${nilaiPPN.toLocaleString("id-ID")}`;
  elTotalSetelahPPN.textContent = `Rp ${totalDenganPPN.toLocaleString("id-ID")}`;

  // Visualisasi Canvas
  gambarLayout(bestCols, bestRows, bestW, bestH, p, l, bleed);
}

function gambarLayout(cols, rows, itemW, itemH, p, l, bleed) {
  // Reset Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Skala Canvas (310px x 440px) -> 1cm = 10px
  const scale = 10;

  // Background Lembar Cetak
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border Lembar Cetak
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  if (cols <= 0 || rows <= 0) return;

  const bleedPx = bleed * scale;
  const pPx = p * scale;
  const lPx = l * scale;

  // Gambar Setiap Item Imposisi
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * itemW * scale;
      const y = r * itemH * scale;

      // Outer Box (+ Bleed)
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(x, y, itemW * scale, itemH * scale);

      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(x, y, itemW * scale, itemH * scale);
      ctx.setLineDash([]);

      // Inner Box (Ukuran Jadi)
      const innerX = x + bleedPx;
      const innerY = y + bleedPx;
      const innerW = itemW === p + bleed * 2 ? pPx : lPx;
      const innerH = itemH === l + bleed * 2 ? lPx : pPx;

      ctx.fillStyle = "#dbeafe";
      ctx.fillRect(innerX, innerY, innerW, innerH);

      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 1;
      ctx.strokeRect(innerX, innerY, innerW, innerH);
    }
  }
}

// Tombol Reset / Hapus
btnHapus.addEventListener("click", function () {
  // Kosongkan seluruh nilai input
  inputPanjang.value = "";
  inputLebar.value = "";
  inputBleed.value = "";
  inputJumlahJadi.value = "";
  inputHargaLembar.value = "";
  inputBiayaFinishing1.value = "";
  inputBiayaFinishing2.value = "";

  hitung();
});

// Event Listener input
[
  inputPanjang,
  inputLebar,
  inputBleed,
  inputJumlahJadi,
  inputHargaLembar,
  inputBiayaFinishing1,
  inputBiayaFinishing2,
].forEach((input) => {
  input.addEventListener("input", hitung);
});
