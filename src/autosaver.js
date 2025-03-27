
const SETTINGS = {
    ALLOW_DEBUG: {
      description: "Allow debug messages in the console",
      label: "Enable Debugging",
      value: true,
      default: true
    },
    AUTOSAVE_SECONDS_DELAY: {
      description: "Seconds between autosaving the current copy",
      label: "Autosave Delay (seconds)",
      value: 30,
      default: 30
    },
    AUTOARCHIVE_MINUTES_DELAY: {
      description: "Minutes between archiving copies",
      label: "Auto-Archive Delay (minutes)",
      value: 1,
      default: 1
    },
    MAX_ARCHIVED: {
      description: "Maximum number of archived copies before older ones are removed",
      label: "Max Archived Copies",
      value: 30,
      default: 30
    },
    PLACE_NEAR_TEXTAREA: {
      description: "Whether to place the panel near the textarea or in the window corner",
      label: "Place Panel Near Textarea",
      value: true,
      default: true
    }
  };

/* JSONs data structure:

{
    lastArchived: <date>,
    archived: [
            {date: <date>, text: <text>},
            {date: <date>, text: <text>},
            {date: <date>, text: <text>}...
        ]
}
*/

import { settingsMenu } from './settingsMenu.js';
import { createElement, Save, RotateCcw, Layers, Trash2, Settings  } from "lucide";

const phpBBForumAutosaver_g_textArea = document.querySelector("textarea#message") || document.querySelector('textarea[name="message"]');
var phpBBForumAutosaver_g_ID_current, phpBBForumAutosaver_g_ID_old;
var phpBBForumAutosaver_g_interval,phpBBForumAutoarchiver_g_intervalArch;
var phpBBForumAutosaver_g_panelButtons=[];



function Setup_PhpBBForumAutosaver(){
    // userscript menu
    
    settingsMenu.init(SETTINGS,settingUpdateCallback);
    

    if (! phpBBForumAutosaver_g_textArea ){
        if (SETTINGS.ALLOW_DEBUG.value){
            console.warn("phpBBForumAutosaver:","No textareas with proper ID found on that page");
        }
        return 0;
    }

    // Ok now we have our textarea, find unique identifier for that site. 
    let ID = CreatePageID_PhpBBForumAutosaver();
    if (! ID) { return 0; }
    else { 
        phpBBForumAutosaver_g_ID_old = "PhpBBForumAutosaver-" + ID + "_old";
        phpBBForumAutosaver_g_ID_current = "PhpBBForumAutosaver-" + ID + "_current";
    }

    // Let's create panel
    let panel = CreatePanel_PhpBBForumAutosaver(phpBBForumAutosaver_g_textArea);

    // Retrieve a saved copy if any
    handleInit();

    // Init autosave

    phpBBForumAutosaver_g_interval = setInterval(()=>{
        handleAutoSave();
    },SETTINGS.AUTOSAVE_SECONDS_DELAY.value*1000);

    phpBBForumAutoarchiver_g_intervalArch = setInterval(()=>{
    
        handleAutoArchive();
    },SETTINGS.AUTOARCHIVE_MINUTES_DELAY.value*1000*60);  
}

function settingUpdateCallback(key,value){
    if (key === "AUTOSAVE_SECONDS_DELAY"){
        clearInterval(phpBBForumAutosaver_g_interval);
        phpBBForumAutosaver_g_interval = setInterval(()=>{
            handleAutoSave();
        },value*1000);

    }

    if (key === "AUTOARCHIVE_MINUTES_DELAY"){
        clearInterval(phpBBForumAutoarchiver_g_intervalArch);
        phpBBForumAutoarchiver_g_intervalArch = setInterval(()=>{
            handleAutoArchive();
        },value*1000*60); 
    }
}

function CreatePageID_PhpBBForumAutosaver(){
    const url = new URL(window.location.href);

// for testing purpose only
    if( url.hostname === "localhost" || url.hostname === "127.0.0.1"){
        return "localhost_devTest";
    }

// For topic reply or quick reply
    let topicId = url.searchParams.get("t"); // "t" stands for "topic" in phpBB forums urls.
    if (!topicId) {
        // If no "t" parameter, check if the pathname ends with "<topic-slug>,<topic_id>.html"
        const regex = /\/[^,]+,(\d+)\.html$/;
        const match = url.pathname.match(regex);
        if (match) {
          topicId = match[1];
        }
    }

    if (topicId){
        return (`topicReply_${topicId}`);
    }

// now check on which mode user is ( "compose" - writing PM , "post" - writing new topic)
    const modeType = url.searchParams.get("mode");

    if (!modeType){
        console.warn("phpBBForumAutosaver:","Textarea found, but can't create ID for this url");
        return 0;
    }

// check if user is creating new topic
    if (modeType === "post"){
        let f = url.searchParams.get("f");
        return (`newTopicOnSubforum_${f}`);
    }

// check if user is composing PM

    if (modeType === "compose"){
        let p = url.searchParams.get("p");
// user is replying to PM
        if (p){
            return (`ReplyPM_${p}`);
        }
// user is creating new PM
        else {
            return (`NewPM`)
        }
    }

// at this point we don't know what's happening
    console.warn("phpBBForumAutosaver:","Textarea found, but can't create ID for this url, unknown mode");
    return 0;

}

function CreatePanel_PhpBBForumAutosaver(textarea_node){

     // Create panel container
     const panel = document.createElement("div");
     panel.id = "PhpBBForumAutosaver_Panel";
 
     // Button data: Lucide icons and tooltips
     const buttons = [
         { icon: Save, tooltip: "Manually save post", name: "save" ,onClick: onManualSave},
         { icon: RotateCcw, tooltip: "Load last saved post", name: "loadLast", onClick: onManualLoad },
         { icon: Layers, tooltip: "Load copy - choose from saved versions", name: "loadAny", onClick: onMultiLoad },
         { icon: Trash2, tooltip: "Delete all saved copies for this draft", name: "delete", onClick: onDelete ,spacing: true },
         { icon: Settings , tooltip: "Settings", name: "settings", onClick: onSettings ,spacing: true }
     ];
 
     buttons.forEach(({ icon, tooltip,name,onClick,spacing }) => {
         const button = document.createElement("div");
         button.className = "icon-btn";
         button.id = `btn_${name}`;
         button.setAttribute("data-tooltip", tooltip);
         button.onclick = onClick;
 
         if (spacing) {
            button.style.marginTop = "20px"; 
        }

         // Create and append the icon
         const svg = createElement(icon);
         button.appendChild(svg);
 
         panel.appendChild(button);

         phpBBForumAutosaver_g_panelButtons.push(button);
     });

     
     if (SETTINGS.PLACE_NEAR_TEXTAREA.value === true){
        let rect = textarea_node.getBoundingClientRect();
        panel.style.left = `${rect.left + window.scrollX - 30}px`;  // X position (aligns left)
        panel.style.top = `${rect.top + window.scrollY + 100}px`;    // Y position (aligns top)
        panel.style.position = "absolute";
     }
     else{
        panel.style.left = "20px";  
        panel.style.top = "8rem";  
        panel.style.position = "fixed";

     }
     
    document.body.appendChild(panel);
 
     return panel;
}

function handleInit(){
    let current = localStorage.getItem(phpBBForumAutosaver_g_ID_current); 
    let old = JSON.parse(localStorage.getItem( phpBBForumAutosaver_g_ID_old)); 
    if (phpBBForumAutosaver_g_textArea.value === ""){
        if (current){
            phpBBForumAutosaver_g_textArea.value = current;
        }
        else if (old){
            phpBBForumAutosaver_g_textArea.value = old.archived.at(-1).text;
        }
    }

}
function handleAutoArchive(){
    let btn = phpBBForumAutosaver_g_panelButtons.find(el => el.id==="btn_loadAny");

    if (phpBBForumAutosaver_g_textArea.value === "" || phpBBForumAutosaver_g_textArea.value.length < 10 ){
        return;
    }

    let old = JSON.parse(localStorage.getItem( phpBBForumAutosaver_g_ID_old));
    let archived;
    if (old) {
        // if nothing has changed since last save- ignore.
        if (old.archived.length > 0 && old.archived.at(-1).text === phpBBForumAutosaver_g_textArea.value){
            _changeBtnColor(btn,"yellow",2000);
            return;
        }

        archived = old.archived;
        if (archived.length >= SETTINGS.MAX_ARCHIVED.value){
            archived.shift();
        }

    }
    else{
        archived = [];
    }

    let date = new Date();
    archived.push({date: date, text:phpBBForumAutosaver_g_textArea.value });
    
    let json = {lastArchived: date, archived: archived}
    localStorage.setItem(phpBBForumAutosaver_g_ID_old, JSON.stringify(json)); 
    _changeBtnColor(btn,"green",5000);

}

function handleAutoSave(){
    if (phpBBForumAutosaver_g_textArea.value === "" || phpBBForumAutosaver_g_textArea.value.length < 10){
        return;
    }
    localStorage.setItem(phpBBForumAutosaver_g_ID_current, phpBBForumAutosaver_g_textArea.value);   
    let btn = phpBBForumAutosaver_g_panelButtons.find(el => el.id==="btn_save");
    _changeBtnColor(btn,"green",2000);
}

function onManualSave(){
    handleAutoSave();
}

function onManualLoad(){
    let current = localStorage.getItem(phpBBForumAutosaver_g_ID_current); 
    let btn = phpBBForumAutosaver_g_panelButtons.find(el => el.id==="btn_loadLast");
    if (current){
        phpBBForumAutosaver_g_textArea.value = current;
        _changeBtnColor(btn,"green",3000);
    }
    else{
        _changeBtnColor(btn,"red",2000);
        console.warn("PhpBBForumAutosaver:","no saved draft yet");
    }

    
    
}

function onSettings(){
    settingsMenu.showSettingsWindow();
}

function onMultiLoad(){
    let old = JSON.parse(localStorage.getItem( phpBBForumAutosaver_g_ID_old)); 
    if (old && old.archived){
        showArchiveWindow(old.archived);
    }
}

function onDelete(){
    if (confirm("Do you really want to DELETE all drafts for this page?")) {
        localStorage.removeItem(phpBBForumAutosaver_g_ID_current);
        localStorage.removeItem(phpBBForumAutosaver_g_ID_old);
        alert("All drafts deleted.");
    
    }
}

function _changeBtnColor(btn,newColor,timeout){
    let previousColor = btn.style.color;
    btn.style.color = newColor;
    setTimeout(()=>{
        btn.style.color = previousColor;
    },timeout)
}

function showArchiveWindow(archived) {
    const modal = document.createElement("div");
    modal.className = "modal-window";
    
    const closeButton = document.createElement("div");
    closeButton.className = "modal-close";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = () => document.body.removeChild(modal);
    modal.appendChild(closeButton);

    const tableContainer = document.createElement("div");
    tableContainer.className = "modal-table-container";
    if (archived.length > 7) {
        tableContainer.style.maxHeight = "300px";
        tableContainer.style.overflowY = "auto";
    }
    
    const table = document.createElement("table");
    table.className = "modal-table";
    const header = table.createTHead().insertRow();
    ["Date", "Text", "Action", "Delete"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        header.appendChild(th);
    });
    
    const tbody = table.createTBody();
    archived.forEach(({ date, text }, index) => {
        const row = tbody.insertRow();
        row.insertCell().textContent = new Date(date).toLocaleString();
        
        const firstLine = text.split("\n")[0] || "";
        const lastLine = text.split("\n").slice(-1)[0] || "";
        row.insertCell().textContent = `${firstLine} (...) ${lastLine}`;
        
        const loadButton = document.createElement("button");
        loadButton.textContent = "Load";
        loadButton.onclick = () => {
            phpBBForumAutosaver_g_textArea.value = text;
            document.body.removeChild(modal);
        };
        row.insertCell().appendChild(loadButton);
        
        const deleteButton = document.createElement("button");
        const svg = createElement(Trash2);
        deleteButton.appendChild(svg);
        deleteButton.onclick = () => {
            
            if (confirm("Do you really want to DELETE this version?")){
                document.body.removeChild(modal);
                handleRemoveFromArch(date);   
            }
            
             
        } 
        row.insertCell().appendChild(deleteButton);
    });

    tableContainer.appendChild(table);
    modal.appendChild(tableContainer);
    document.body.appendChild(modal);
}

function handleRemoveFromArch(date){
    let old = JSON.parse(localStorage.getItem( phpBBForumAutosaver_g_ID_old)); 
    let idxToRemove = old.archived.findIndex(e=>e.date === date);
    if (idxToRemove !== -1) {
        old.archived.splice(idxToRemove,1);
        localStorage.setItem(phpBBForumAutosaver_g_ID_old, JSON.stringify(old)); 
    }
    else {
        console.warn("PhpBBForumAutosaver:","cant delete archived copy, something went wrong");
    }
    // reopen window
    showArchiveWindow(old.archived) ;
}

function detectForum(){
    const url = new URL(window.location.href);
    let res =  url.searchParams.get("mode") || url.href.includes("viewtopic");
    return res;
}

// START OF EXECUTION

if (detectForum()){
  
    Setup_PhpBBForumAutosaver();
}

