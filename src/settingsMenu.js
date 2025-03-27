export const settingsMenu = (function () {
    var settings = {};
    var updateCb;
    var _useGM = ( (typeof GM_getValue !== "undefined" )&&(typeof GM_setValue !== "undefined" ) );
    var _useGMdot = (!_useGM && (typeof GM !== "undefined" ));



    async function init(initSettings, updateCallback) {
        updateCb = updateCallback;
        settings = initSettings;

        if (typeof GM_registerMenuCommand !== "undefined" ){
            GM.registerMenuCommand('Settings', function() {
                settingsMenu.showSettingsWindow();
              });
        }

        if (_useGMdot && (typeof GM_registerMenuCommand !== "undefined" )){
            GM_registerMenuCommand('Settings', function() {
                settingsMenu.showSettingsWindow();
              });
        }

        if (_useGM){
            Object.keys(settings).forEach(key=>{
                settings[key].value = GM_getValue(key,settings[key].default);
            })
        }

        if (_useGMdot){
            for (let key of Object.keys(settings)){
                settings[key].value = await GM.getValue(key,settings[key].default);
            }
        }

    }

    function showSettingsWindow() {
        const modal = document.createElement("div");
        modal.className = "userscript-settings-modal-window";
        
        const closeButton = document.createElement("span");
        closeButton.className = "userscript-settings-modal-close";
        closeButton.innerHTML = "&times;";
        closeButton.onclick = () => document.body.removeChild(modal);
        modal.appendChild(closeButton);
        
        const table = document.createElement("table");
        table.className = "userscript-settings-modal-table";
        
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = "<th>Setting</th><th>Value</th>";
        table.appendChild(headerRow);
        
        Object.keys(settings).forEach(key => {
            const row = document.createElement("tr");
            
            const tooltipCell = document.createElement("td");
            tooltipCell.className = "userscript-settings-tooltip-cell";
            tooltipCell.setAttribute("data-tooltip", settings[key].description);
            tooltipCell.textContent = settings[key].label;
            row.appendChild(tooltipCell);
            
            const valueCell = document.createElement("td");
            if (typeof settings[key].value === "boolean") {
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = settings[key].value;
                checkbox.onchange = () => settingsMenu.update(key, checkbox.checked) ;
                valueCell.appendChild(checkbox);
            } else {
                const input = document.createElement("input");
                input.type = "number";
                input.value = settings[key].value;
                input.onchange = () => settingsMenu.update(key, Number(input.value)) ;
                valueCell.appendChild(input);
            }
            row.appendChild(valueCell);
            
            table.appendChild(row);
        });
        
        modal.appendChild(table);
        document.body.appendChild(modal);
    }

    function update(key, value) {
        settings[key].value = value;
        if (_useGM){
            GM_setValue(key,value);
        }
        if (_useGMdot){
            (async () => await GM.setValue(key,value))(); 
        }
        updateCb(key,value);
    }

    function restoreDefault() {
        Object.keys(settings).forEach(key => {
            settingsMenu.update(key,settings[key].default);
        });
    }

    return {
        init,
        showSettingsWindow,
        update,
        restoreDefault
    };
})();