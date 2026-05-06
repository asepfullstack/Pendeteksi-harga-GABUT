import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";

// 1. Konfigurasi Firebase Milik AsepTamvan
const firebaseConfig = {
  apiKey: "AIzaSyBO1Uk8aHZxMCaq2kk3TdQ2p0YAiISbHyY",
  authDomain: "aseptamvan-5de70.firebaseapp.com",
  projectId: "aseptamvan-5de70",
  storageBucket: "aseptamvan-5de70.firebasestorage.app",
  messagingSenderId: "349456602743",
  appId: "1:349456602743:web:3bf40266caee47c5f2d872",
  measurementId: "G-NZ13SSBRNG"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, 'scans');

// 2. Database Barang (Barang di Rumah Asep)
// Tambahkan di sini jika ada barang baru
const products = {
    "8992775311615": { name: "Chocolatos", price: 2500 },
    "8991748613655": { name: "Acne Plus Spot Care Serum", price: 35000 },
    "8998103018515": { name: "Cussons Baby Powder", price: 15000 },
    "886001026025":  { name: "Astor Wonderful Sensation", price: 12000 }
};

// Elements
const nameEl = document.getElementById('name');
const priceEl = document.getElementById('price');
const logTable = document.getElementById('log-table');
const statusDot = document.getElementById('dot');

// 3. LOGIKA UNTUK LAPTOP (Monitoring Realtime)
onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    logTable.innerHTML = "";
    
    if (data) {
        const list = Object.values(data).reverse();
        
        // Tampilkan info produk terakhir di card
        const latest = list[0];
        nameEl.innerText = latest.name;
        priceEl.innerText = latest.price.toLocaleString('id-ID');
        
        // Isi tabel history
        list.forEach(item => {
            const row = `<tr>
                <td>${item.time}</td>
                <td><code>${item.code}</code></td>
                <td>${item.name}</td>
                <td>Rp ${item.price.toLocaleString('id-ID')}</td>
            </tr>`;
            logTable.innerHTML += row;
        });
    }
});

// 4. LOGIKA UNTUK HP (Scanner)
Quagga.init({
    inputStream: {
        name: "Live", type: "LiveStream",
        target: document.querySelector('#interactive'),
        constraints: { facingMode: "environment" }
    },
    decoder: { readers: ["ean_reader", "code_128_reader"] }
}, (err) => {
    if (!err) {
        Quagga.start();
        statusDot.classList.add('online');
        document.getElementById('status').innerText = "CONNECTED";
    }
});

let isScanning = false;
Quagga.onDetected((result) => {
    const code = result.codeResult.code;
    
    if (!isScanning && products[code]) {
        isScanning = true;
        const item = products[code];
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // Push data ke Firebase
        push(dbRef, {
            code: code,
            name: item.name,
            price: item.price,
            time: time
        });

        // Delay 3 detik agar tidak scan berkali-kali
        setTimeout(() => { isScanning = false; }, 3000);
    }
});

// Bersihkan Database
document.getElementById('clear-btn').onclick = () => {
    if(confirm("Hapus semua log history?")) {
        remove(dbRef);
        nameEl.innerText = "Menunggu...";
        priceEl.innerText = "0";
    }
};
