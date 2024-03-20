window.googletag = window.googletag || {cmd: []};
        
googletag.cmd.push(function() {
    window.slot = null;
});

let refreshCount = 0;
let autoRefreshInterval = null;

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
        adSlotElement.innerHTML = '';
        googletag.display('ad-slot');
        log('<strong>Ad Slot Rendered</strong>' + " = " + adUnitPath + " for network code " + networkCode);
    });
}

function refreshAdSlots() {
    googletag.pubads().refresh();
    refreshCount++;
    log(`<strong>Ad slot refreshed.</strong> (${refreshCount})`);
}

function toggleAutoRefresh() {
    const autoRefreshStatus = document.getElementById('autoRefreshDropdown').value;
    const cancelBtn = document.getElementById('cancelAutoRefreshButton');
    if (autoRefreshStatus === 'on') {
        if (!autoRefreshInterval) {
            autoRefreshInterval = setInterval(refreshAdSlots, 5000);
            cancelBtn.style.display = 'inline-block';
        }
    } else {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        cancelBtn.style.display = 'none';
    }
}

function cancelAutoRefresh() {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    document.getElementById('autoRefreshDropdown').value = 'off';
    document.getElementById('cancelAutoRefreshButton').style.display = 'none';
    log('<strong>Auto refresh cancelled.</strong>');
}

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

        // Load saved value from localStorage
        const savedValue = localStorage.getItem(field);
        if (savedValue) {
          inputElement.value = savedValue;
        }

        // Save to localStorage on change
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
