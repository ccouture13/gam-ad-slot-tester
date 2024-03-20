window.googletag = window.googletag || {cmd: []};
        
googletag.cmd.push(function() {
    // Define a slot as a global variable for easy access.
    window.slot = null;
});

let refreshCount = 0; // Global variable to keep track of refresh count
let autoRefreshInterval = null; // Variable to store interval ID

function log(message) {
    const logElement = document.getElementById('log');
    const logItem = document.createElement('p');
    logItem.classList.add('log-item');
    logItem.innerHTML = message;
    logElement.appendChild(logItem);
    logElement.scrollTop = logElement.scrollHeight;
}
function configureAdSlots() {
    const networkCode = document.getElementById('network-code').value;
    const adUnitPath = document.getElementById('ad-unit-path').value;
    const ppid = document.getElementById('ppid').value;
    const keyInput = document.getElementById('key');
    const key = keyInput ? keyInput.value : 'none';
    const valueInput = document.getElementById('value');
    const value = valueInput ? valueInput.value : 'none';


    window.googletag = window.googletag || { cmd: [] };
    googletag.cmd.push(function() {
        // Clear existing slots to prevent errors on reconfiguration.
        googletag.pubads().clear(); 

        // Set PPID if provided.
        if(ppid) {
            googletag.pubads().setPublisherProvidedId(ppid);
            log('<strong>Publisher Provided ID</strong>' + " = " + ppid);
        }

        // Define and configure the ad slot.
        const slot = googletag.defineSlot(`/${networkCode}/${adUnitPath}`, [300, 250], 'ad-slot');
        slot.addService(googletag.pubads());

        // Set key/value targeting if provided.
        if(key && value) {
            slot.setTargeting(key, value);
            log('<strong>K/V Pair</strong>' + " = " + key + " / " + value);
        }

        // Enable GPT services and display the ad slot.
        googletag.enableServices();
        log('<strong>GPT Services Enabled</strong>');

        // Display the ad slot and hide the placeholder text.
        const adSlotElement = document.getElementById('ad-slot');
        adSlotElement.innerHTML = ''; // Clear any existing content
        googletag.display('ad-slot');
        log('<strong>Ad Slot Rendered</strong>' + " = " + adUnitPath + " for network code " + networkCode);
    });
}

function refreshAdSlots() {
    googletag.pubads().refresh();
    refreshCount++; // Increment refresh count
    log(`<strong>Ad slot refreshed.</strong> (${refreshCount})`); // Log with count
}

function toggleAutoRefresh() {
    const autoRefreshStatus = document.getElementById('autoRefreshDropdown').value;
    const cancelBtn = document.getElementById('cancelAutoRefreshButton');
    if (autoRefreshStatus === 'on') {
        if (!autoRefreshInterval) {
            autoRefreshInterval = setInterval(refreshAdSlots, 5000); // Refresh every 5 seconds
            cancelBtn.style.display = 'inline-block'; // Show the cancel button
        }
    } else {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        cancelBtn.style.display = 'none'; // Hide the cancel button
    }
}

function cancelAutoRefresh() {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    document.getElementById('autoRefreshDropdown').value = 'off'; // Reset dropdown
    document.getElementById('cancelAutoRefreshButton').style.display = 'none'; // Hide button
    log('<strong>Auto refresh cancelled.</strong>'); // Log cancellation
}

// Attaching event listeners to buttons and dropdown
document.getElementById('configureAdButton').addEventListener('click', configureAdSlots);
document.getElementById('refreshAdButton').addEventListener('click', refreshAdSlots);
document.getElementById('autoRefreshDropdown').addEventListener('change', toggleAutoRefresh);
document.getElementById('cancelAutoRefreshButton').addEventListener('click', cancelAutoRefresh);

// Load the saved values from local storage on page load
window.addEventListener('DOMContentLoaded', function() {
    const fields = ['network-code', 'ad-unit-path', 'key', 'value', 'refresh-interval'];
    fields.forEach(function(field) {
        const value = localStorage.getItem(field);
        if (value) {
            document.getElementById(field).value = value;
        }
    });
});