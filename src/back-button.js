const style=document.createElement("style");
style.textContent=".pinvoraBackWrap{width:min(1100px,100% - 44px);margin:0 auto;padding:0 0 12px}.pinvoraBack{display:inline-flex;align-items:center;gap:9px;border:1px solid #dfcbb7;border-radius:24px;background:#fbf3e8;color:#641d29;padding:10px 18px;font:600 14px 'DM Sans',Arial,sans-serif;box-shadow:0 3px 10px rgba(86,55,38,.07);cursor:pointer;transition:background .18s,transform .18s}.pinvoraBack:hover{background:#efe1d0;transform:translateX(-2px)}.pinvoraBack:focus-visible{outline:3px solid #a9434b;outline-offset:3px}@media(max-width:640px){.pinvoraBackWrap{padding-bottom:8px}.pinvoraBack{padding:9px 15px}}";
document.head.append(style);
let lastTab="home",previousTab="home",lastActive="";
function activeTab(){return document.querySelector(".refTopNav button.active")?.textContent?.trim()||document.querySelector(".bottomNav button.active")?.textContent?.trim()||""}
function tabKey(label){if(/Create/i.test(label))return "create";if(/Library/i.test(label))return "review";if(/Connect/i.test(label))return "analytics";return "home"}
function sync(){
 const main=document.querySelector("main");if(!main)return;
 const active=activeTab(),key=tabKey(active);
 if(active&&active!==lastActive){previousTab=lastTab;lastTab=key;lastActive=active}
 let wrap=document.querySelector(".pinvoraBackWrap");
 if(key==="home"){if(wrap)wrap.remove();return}
 if(!wrap){wrap=document.createElement("div");wrap.className="pinvoraBackWrap";const button=document.createElement("button");button.className="pinvoraBack";button.type="button";button.innerHTML="<span aria-hidden='true'>←</span><span>Back</span>";button.addEventListener("click",()=>{const target=previousTab===key?"home":previousTab;const nav=document.querySelector(".refTopNav");const labels={home:"Home",create:"Create",review:"Library",analytics:"Connections"};const item=[...(nav?.querySelectorAll("button")||[])].find(x=>x.textContent.includes(labels[target]));if(item)item.click();else document.querySelector(".refBrand")?.click();});wrap.append(button);main.parentNode.insertBefore(wrap,main)}
}
new MutationObserver(sync).observe(document.getElementById("root")||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
sync();