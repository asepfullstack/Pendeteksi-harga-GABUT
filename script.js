const nameEl = document.getElementById('item-name');
const priceEl = document.getElementById('item-price');
const statusEl = document.getElementById('status');

// ==========================================
// BLOCK DAFTAR PRODUK (TAMBAH DI SINI)
// ==========================================
const productDatabase = {
    "8992775311615": { name: "Chocolatos", price: 2500 },
    "8991748613655": { name: "YOU Acne Plus Spot Care Serum", price: 35000 },
    "8998103018515": { name: "Cussons Baby Powder", price: 15000 },
    "886001026025":  { name: "Astor Wonderful Sensation", price: 12000 }
    // "KODE_BARCODE": { name: "NAMA_BARANG", price: HARGA_ANGKA },
};
// ==========================================

// Inisialisasi QuaggaJS
Quagga.init({
    inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#interactive'),
        constraints: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    },
    decoder: {
        readers: ["ean_reader", "ean_8_reader", "code_128_reader"]
    },
    locate: true
}, function (err) {
    if (err) {
        console.error(err);
        nameEl.innerText = "Kamera Bermasalah";
        return;
    }
    Quagga.start();
});

// Event saat barcode terdeteksi
Quagga.onDetected(function (result) {
    const code = result.codeResult.code;
    
    // Validasi apakah kode ada di database
    if (productDatabase[code]) {
        const item = productDatabase[code];
        nameEl.innerText = item.name;
        priceEl.innerText = "Rp " + item.price.toLocaleString('id-ID');
        statusEl.innerText = "TERDETEKSI: " + code;
        statusEl.style.color = "#00f2ff";
    } else {
        nameEl.innerText = "Produk Belum Terdaftar";
        priceEl.innerText = "Rp 0";
        statusEl.innerText = "KODE BARU: " + code;
        statusEl.style.color = "#ffb300";
    }
});