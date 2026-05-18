// Register Service Worker for PWA installability
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

const html5QrCode = new Html5Qrcode("reader");
const resultText = document.getElementById("result-text");
const resumeBtn = document.getElementById("resume-btn");
const historyBtn = document.getElementById("history-btn");
const historyView = document.getElementById("history-view");
const scanView = document.getElementById("scan-view");
const historyList = document.getElementById("history-list");
const backBtn = document.getElementById("back-btn");

let isScanning = false;

// Helper to check if a string is a valid URL
function isUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Save scan to local storage
function saveToHistory(text) {
    let history = JSON.parse(localStorage.getItem("qrScannerHistory") || "[]");
    history.unshift({ text: text, timestamp: new Date().toLocaleString() });
    localStorage.setItem("qrScannerHistory", JSON.stringify(history));
}

// Handle successful scan
function onScanSuccess(decodedText) {
    if (!isScanning) return;
    isScanning = false;
    
    // Pause the camera
    html5QrCode.stop().then(() => {
        saveToHistory(decodedText);
        
        let displayHtml = `<strong>Raw Data:</strong><br>${decodedText}<br><br>`;
        if (isUrl(decodedText)) {
            displayHtml += `<a href="${decodedText}" target="_blank">🔗 Open Link in Browser</a>`;
        }
        
        resultText.innerHTML = displayHtml;
        resumeBtn.style.display = "block";
    }).catch(err => console.error("Failed to stop scanner", err));
}

// Start or Resume the camera
function startScanner() {
    isScanning = true;
    resultText.innerHTML = "Scanning...";
    resumeBtn.style.display = "none";
    
    html5QrCode.start(
        { facingMode: "environment" }, // Forces rear camera on mobile
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        (errorMessage) => { /* Ignore background scan errors */ }
    ).catch(err => {
        resultText.innerHTML = `Camera access denied or unavailable.`;
    });
}

// Event Listeners for UI Buttons
resumeBtn.addEventListener("click", startScanner);

historyBtn.addEventListener("click", () => {
    scanView.style.display = "none";
    historyView.style.display = "block";
    
    const history = JSON.parse(localStorage.getItem("qrScannerHistory") || "[]");
    historyList.innerHTML = history.length === 0 ? "<p>No history yet.</p>" : "";
    
    history.forEach(item => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `<div class="timestamp">${item.timestamp}</div><div>${item.text}</div>`;
        historyList.appendChild(div);
    });
});

backBtn.addEventListener("click", () => {
    scanView.style.display = "block";
    historyView.style.display = "none";
});

// Boot up the scanner on load
startScanner();
