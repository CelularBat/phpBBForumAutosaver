// ==UserScript==
// @name         phpBBForumAutosaver
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Autosaving drafts of posts and PMs on phpBB forums in local storage.
// @author       CelularBat
// @homepage     https://github.com/CelularBat/WebPainter_userscript
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM.getValue
// @grant              GM.setValue
// @grant              GM_registerMenuCommand
// ==/UserScript==

(function() {
    (function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&n(d)}).observe(document,{childList:!0,subtree:!0});function a(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(o){if(o.ep)return;o.ep=!0;const r=a(o);fetch(o.href,r)}})();/**
 * @license lucide v0.483.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide v0.483.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=([t,e,a])=>{const n=document.createElementNS("http://www.w3.org/2000/svg",t);return Object.keys(e).forEach(o=>{n.setAttribute(o,String(e[o]))}),a!=null&&a.length&&a.forEach(o=>{const r=A(o);n.appendChild(r)}),n},C=(t,e={})=>{const a="svg",n={...I,...e};return A([a,n,t])};/**
 * @license lucide v0.483.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"}]];/**
 * @license lucide v0.483.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{d:"M3 3v5h5"}]];/**
 * @license lucide v0.483.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7"}]];/**
 * @license lucide v0.483.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M3 6h18"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17"}]],v={AUTOSAVE_SECONDS_DELAY:{value:30},AUTOARCHIVE_MINUTES_DELAY:{value:1},MAX_ARCHIVED:{value:30}},l=document.querySelector("textarea#message");var m,i,y=[];function D(){if(GM_registerMenuCommand&&GM_registerMenuCommand("Settings",function(){console.log("settings")}),!l)return console.warn("phpBBForumAutosaver:","No textareas with proper ID found on that page"),0;let t=T();if(t)i="PhpBBForumAutosaver-"+t+"_old",m="PhpBBForumAutosaver-"+t+"_current";else return 0;N(l),O(),setInterval(()=>{E()},v.AUTOSAVE_SECONDS_DELAY.value*1e3),setInterval(()=>{P()},v.AUTOARCHIVE_MINUTES_DELAY.value*1e3*60)}function T(){const t=new URL(window.location.href);if(t.hostname==="localhost"||t.hostname==="127.0.0.1")return"localhost_devTest";let e=t.searchParams.get("t");if(!e){const n=/\/[^,]+,(\d+)\.html$/,o=t.pathname.match(n);o&&(e=o[1])}if(e)return`topicReply_${e}`;const a=t.searchParams.get("mode");if(!a)return console.warn("phpBBForumAutosaver:","Textarea found, but can't create ID for this url"),0;if(a==="post")return`newTopicOnSubforum_${t.searchParams.get("f")}`;if(a==="compose"){let n=t.searchParams.get("p");return n?`ReplyPM_${n}`:"NewPM"}return console.warn("phpBBForumAutosaver:","Textarea found, but can't create ID for this url, unknown mode"),0}function N(t){const e=document.createElement("div");e.id="PhpBBForumAutosaver_Panel",[{icon:L,tooltip:"Manually save post",name:"save",onClick:F},{icon:x,tooltip:"Load last saved post",name:"loadLast",onClick:R},{icon:M,tooltip:"Load copy - choose from saved versions",name:"loadAny",onClick:V},{icon:w,tooltip:"Delete all saved copies for this draft",name:"delete",onClick:H,spacing:!0}].forEach(({icon:o,tooltip:r,name:d,onClick:u,spacing:c})=>{const s=document.createElement("div");s.className="icon-btn",s.id=`btn_${d}`,s.setAttribute("data-tooltip",r),s.onclick=u,c&&(s.style.marginTop="20px");const p=C(o);s.appendChild(p),e.appendChild(s),y.push(s)});let n=t.getBoundingClientRect();return e.style.left=`${n.left+window.scrollX-30}px`,e.style.top=`${n.top+window.scrollY+70}px`,e.style.position="absolute",document.body.appendChild(e),e}function O(){let t=localStorage.getItem(m),e=JSON.parse(localStorage.getItem(i));l.value===""&&(t?l.value=t:e&&(l.value=e.archived.at(-1).text))}function P(){if(l.value===""||l.value.length<10)return;let t=JSON.parse(localStorage.getItem(i)),e;if(t){if(t.archived.at(-1).text===l.value)return;e=t.archived,e.length>=v.MAX_ARCHIVED.value&&e.shift()}else e=[];let a=new Date;e.push({date:a,text:l.value});let n={lastArchived:a,archived:e};localStorage.setItem(i,JSON.stringify(n))}function E(){if(l.value===""||l.value.length<10)return;localStorage.setItem(m,l.value);let t=y.find(e=>e.id==="btn_save");g(t,"green",2e3)}function F(){E()}function R(){let t=localStorage.getItem(m),e=y.find(a=>a.id==="btn_loadLast");t?(l.value=t,g(e,"green",3e3)):(g(e,"red",2e3),console.warn("PhpBBForumAutosaver:","no saved draft yet"))}function V(){let t=JSON.parse(localStorage.getItem(i));t&&t.archived&&S(t.archived)}function H(){confirm("Do you really want to DELETE all drafts for this page?")&&(localStorage.removeItem(m),localStorage.removeItem(i),alert("All drafts deleted."))}function g(t,e,a){let n=t.style.color;t.style.color=e,setTimeout(()=>{t.style.color=n},a)}function S(t){const e=document.createElement("div");e.className="modal-window";const a=document.createElement("div");a.className="modal-close",a.innerHTML="&times;",a.onclick=()=>document.body.removeChild(e),e.appendChild(a);const n=document.createElement("div");n.className="modal-table-container",t.length>7&&(n.style.maxHeight="300px",n.style.overflowY="auto");const o=document.createElement("table");o.className="modal-table";const r=o.createTHead().insertRow();["Date","Text","Action","Delete"].forEach(u=>{const c=document.createElement("th");c.textContent=u,r.appendChild(c)});const d=o.createTBody();t.forEach(({date:u,text:c},s)=>{const p=d.insertRow();p.insertCell().textContent=new Date(u).toLocaleString();const B=c.split(`
`)[0]||"",_=c.split(`
`).slice(-1)[0]||"";p.insertCell().textContent=`${B} (...) ${_}`;const h=document.createElement("button");h.textContent="Load",h.onclick=()=>{l.value=c,document.body.removeChild(e)},p.insertCell().appendChild(h);const f=document.createElement("button"),b=C(w);f.appendChild(b),f.onclick=()=>{confirm("Do you really want to DELETE this version?")&&(document.body.removeChild(e),k(u))},p.insertCell().appendChild(f)}),n.appendChild(o),e.appendChild(n),document.body.appendChild(e)}function k(t){let e=JSON.parse(localStorage.getItem(i)),a=e.archived.findIndex(n=>n.date===t);e.archived.splice(a,1),localStorage.setItem(i,JSON.stringify(e)),S(e.archived)}D();


/* Injected CSS */
const styleToInject = document.createElement('style');
        styleToInject.textContent = `#PhpBBForumAutosaver_Panel{transform:translateY(-50%);width:20px;background:#333;display:flex;flex-direction:column;gap:13px;padding:5px 2px;border-radius:3px}.icon-btn{width:20px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;position:relative}.icon-btn img{width:16px;height:16px}.icon-btn:hover{background:#fff3;border-radius:3px}.icon-btn:after{content:attr(data-tooltip);position:absolute;left:25px;background:#000;color:#fff;padding:5px;font-size:12px;white-space:nowrap;border-radius:3px;opacity:0;transition:opacity .2s;pointer-events:none}.icon-btn:hover:after{opacity:1}.modal-window{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#222;color:#fff;padding:15px;border-radius:5px;box-shadow:0 0 10px #00000080;z-index:1000;min-width:300px}.modal-close{position:absolute;top:5px;right:10px;cursor:pointer;font-size:18px;color:#fff}.modal-close:hover{color:red}.modal-table{width:100%;border-collapse:collapse;margin-top:10px}.modal-table th,.modal-table td{border:1px solid #444;padding:8px;text-align:left}.modal-table th{background:#333}.modal-table button{background:#555;color:#fff;border:none;padding:5px 10px;cursor:pointer;border-radius:3px}.modal-table button:hover{background:#777}
`;
        document.head.appendChild(styleToInject);
})();