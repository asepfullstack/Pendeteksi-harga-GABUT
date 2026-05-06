// Database Produk Master
const masterData = {
    "8992775311615": { name: "Chocolatos", price: 2500 },
    "8991748613655": { name: "YOU Acne Plus Serum", price: 35000 },
    "8998103018515": { name: "Cussons Baby Powder", price: 15000 },
    "886001026025":  { name: "Astor Wonderful", price: 12000 },
    "8999908000000": { name: "Gudang Garam Filter", price: 24500 }
};

const nameEl = document.getElementById('item-name');
const priceEl = document.getElementById('item-price');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status-dot');
const historyList = document.getElementById('history-list');

// 1. Load Data dari Database Lokal (LocalStorage)
let scanHistory = JSON.parse(localStorage.getItem('sep_scan_db')) || [];

function updateHistoryTable() {
    historyList.innerHTML = "";
    scanHistory.slice().reverse().forEach(item => {
        const row = `<tr>
            <td>${item.time}</td>
            <td><code>${item.code}</code></td>
            <td>${item.name}</td>
            <td>Rp ${item.price.toLocaleString('id-ID')}</td>
        </tr>`;
        historyList.innerHTML += row;
    });
}

// 2. Simpan ke Database Lokal
function saveToLocalDB(code, name, price) {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}`;
    
    // Cek biar nggak duplikat dalam waktu berdekatan
    const lastEntry = scanHistory[scanHistory.length - 1];
    if (lastEntry && lastEntry.code === code) return; 

    scanHistory.push({ time: timeStr, code, name, price });
    localStorage.setItem('sep_scan_db', JSON.stringify(scanHistory));
    updateHistoryTable();
}

// 3. Init Scanner
Quagga.init({
    inputStream: {
        name: "Live", type: "LiveStream",
        target: document.querySelector('#interactive'),
        constraints: { facingMode: "environment" }
    },
    decoder: { readers: ["ean_reader", "code_128_reader"] }
}, function(err) {
    if (err) return;
    Quagga.start();
    statusText.innerText = "SISTEM AKTIF";
    statusDot.classList.add('active-dot');
});

// 4. Deteksi
Quagga.onDetected(function(result) {
    const code = result.codeResult.code;
    
    if (masterData[code]) {
        const item = masterData[code];
        nameEl.innerText = item.name;
        priceEl.innerText = "Rp " + item.price.toLocaleString('id-ID');
        
        // Simpan ke database lokal setiap ada scan sukses
        saveToLocalDB(code, item.name, item.price);
    }
});

// Fitur Hapus History
document.getElementById('save-manual').onclick = () => {
    if(confirm("Hapus semua riwayat scan?")) {
        scanHistory = [];
        localStorage.removeItem('sep_scan_db');
        updateHistoryTable();
    }
};

// Jalankan tabel saat start
updateHistoryTable();
