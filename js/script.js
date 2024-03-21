window.googletag = window.googletag || {cmd: []};
        
googletag.cmd.push(function() {
    window.slot = null;
});

let refreshCount = 0;
let autoRefreshInterval = null;
let ppidArray = [];

let currentPPIDIndex = 0; // Index to start PPID iteration.
let refreshInterval = 5; // This is seconds, will be multiplied by 1000 to pass as ms.

// Defines the "logs" section.
function log(message) {
    const logElement = document.getElementById('log');
    const logItem = document.createElement('p');
    logItem.classList.add('log-item');
    logItem.innerHTML = message;
    logElement.appendChild(logItem);
    logElement.scrollTop = logElement.scrollHeight;
}

// Configures ad slot based ont he entered information.
// PPID must be set FIRST so that it can be seen in the subsequent ad requests.
// Orer is CLEAR -> PPID -> DEFINESLOT -> K/V -> DISPLAY AD
function configureAdSlots() {
    const networkCode = document.getElementById('network-code').value;
    const adUnitPath = document.getElementById('ad-unit-path').value;
    const ppid = document.getElementById('ppid').value;
    const keyInput = document.getElementById('key');
    const key = keyInput ? keyInput.value : 'none';
    const valueInput = document.getElementById('value');
    const value = valueInput ? valueInput.value : 'none';

    ppidArray = ppid.split(',');
    currentPPIDIndex = 0;

    window.googletag = window.googletag || { cmd: [] };
    googletag.cmd.push(function() {
        googletag.pubads().clear(); 

        // Set initial PPID.
        if(ppidArray.length > 0) {
            googletag.pubads().setPublisherProvidedId(ppidArray[currentPPIDIndex]);
            log('<strong>Publisher Provided ID</strong>' + " = " + ppidArray[currentPPIDIndex]);
        }

        // Configure ad slot.
        const slot = googletag.defineSlot(`/${networkCode}/${adUnitPath}`, [300, 250], 'ad-slot');
        slot.addService(googletag.pubads());

        // Set K/V pair to retrieve ad.
        if(key && value) {
            slot.setTargeting(key, value);
            log('<strong>K/V Pair</strong>' + " = " + key + " / " + value);
        }

        // Enable GPT services.
        googletag.enableServices();
        log('<strong>GPT Services Enabled</strong>');

        // Display ad.
        const adSlotElement = document.getElementById('ad-slot');
        adSlotElement.innerHTML = '';
        googletag.display('ad-slot');
        log('<strong>Ad Slot Rendered</strong>' + " = " + adUnitPath + " for network code " + networkCode);
    });
}

// This is the code to reresh the ad slot when you change any values.
function refreshAdSlots() {
    googletag.pubads().refresh();
    refreshCount++;

    // Cycle through PPIDs if there are multiple passed as comma delimited.
    if (ppidArray.length > 1) {
        currentPPIDIndex = (currentPPIDIndex + 1) % ppidArray.length;
        googletag.pubads().setPublisherProvidedId(ppidArray[currentPPIDIndex]);
        log('<strong>Publisher Provided ID</strong>' + " = " + ppidArray[currentPPIDIndex]);
    }

    log(`<strong>Ad slot refreshed.</strong> (${refreshCount})`);
}

// This enables auto refresh at a 5s delay, beats the Google rate limit.
// When you pass comma delimited PPIDs, this will cycle thorough all PPIDs indefinitely.
// This allows you to let this run for a little and your PPIDs will be seen by Google.
// Later you can pass those IDs through batch upload of identifiers.
function toggleAutoRefresh() {
    const autoRefreshStatus = document.getElementById('autoRefreshDropdown').value;
    const cancelBtn = document.getElementById('cancelAutoRefreshButton');
    if (autoRefreshStatus === 'on') {
        if (!autoRefreshInterval) {
            autoRefreshInterval = setInterval(refreshAdSlots, refreshInterval*1000);
            cancelBtn.style.display = 'inline-block';
        }
    } else {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        cancelBtn.style.display = 'none';
    }
}

// Self explanatory, cancels the auto refresh.
function cancelAutoRefresh() {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    document.getElementById('autoRefreshDropdown').value = 'off';
    document.getElementById('cancelAutoRefreshButton').style.display = 'none';
    log('<strong>Auto refresh cancelled.</strong>');
}

// Set event listeners.
document.getElementById('configureAdButton').addEventListener('click', configureAdSlots);
document.getElementById('refreshAdButton').addEventListener('click', refreshAdSlots);
document.getElementById('autoRefreshDropdown').addEventListener('change', toggleAutoRefresh);
document.getElementById('cancelAutoRefreshButton').addEventListener('click', cancelAutoRefresh);

document.addEventListener('DOMContentLoaded', () => {
    const fields = ['network-code', 'ad-unit-path', 'ppid', 'key', 'value', 'autoRefreshDropdown'];
    fields.forEach(field => {
        const inputElement = document.getElementById(field);
        if (!inputElement) {
          return;
        }

        // Loads saved values from local storage.
        const savedValue = localStorage.getItem(field);
        if (savedValue) {
          inputElement.value = savedValue;
        }

        // Saves all values to localStorage on change.
        inputElement.addEventListener('change', () => {
            localStorage.setItem(field, inputElement.value);
        });
    });

    document.getElementById('configureAdButton').addEventListener('click', configureAdSlots);
    document.getElementById('refreshAdButton').addEventListener('click', refreshAdSlots);
    document.getElementById('autoRefreshDropdown').addEventListener('change', () => {
        toggleAutoRefresh();
        const autoRefreshDropdown = document.getElementById('autoRefreshDropdown');
        localStorage.setItem('autoRefreshDropdown', autoRefreshDropdown.value);
    });
    document.getElementById('cancelAutoRefreshButton').addEventListener('click', cancelAutoRefresh);
});