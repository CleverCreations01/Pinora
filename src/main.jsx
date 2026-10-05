import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const seed=[
{title:"Burgundy & Cream Cozy Bedroom Ideas",trend:"Burgundy + cream",board:"Cozy Bedroom Ideas",time:"7:15 PM EST",score:94,product:"Burgundy velvet throw pillow",url:"https://www.amazon.com/",desc:"Warm burgundy and cream bedroom styling with cozy textures and timeless details.",alt:"Cozy burgundy and cream bedroom with a velvet accent pillow",keywords:"burgundy bedroom, cozy bedroom, cream decor"},
{title:"Hobo-Inspired Cozy Corner",trend:"Hobo / eclectic",board:"Cozy Home Inspiration",time:"8:05 PM EST",score:91,product:"Textured neutral throw blanket",url:"https://www.amazon.com/",desc:"A relaxed layered corner using warm neutrals, texture and vintage-inspired styling.",alt:"Eclectic cozy reading corner with textured neutral throw blanket",keywords:"hobo decor, cozy corner, eclectic home"}
];

function App(){
 const [prompt,setPrompt]=useState("");
 const [pins,setPins]=useState([]);
 const [tab,setTab]=useState("generate");
 const [selected,setSelected]=useState({});
 const [status,setStatus]=useState("Draft — nothing can publish automatically.");
 function generate(){
  const out=Array.from({length:10},(_,i)=>({...seed[i%2],id:Date.now()+i,title:i<2?seed[i].title:"High-potential Pinterest concept "+(i+1),trend:prompt||"Today's requested aesthetic",score:90-i}));
  setPins(out);setSelected(Object.fromEntries(out.map(p=>[p.id,true])));setTab("review");
 }
 function toggle(id){setSelected(s=>({...s,[id]:!s[id]}))}
 return <div className="app">
  <header><div><div className="logo">PIN<span>ORA</span></div><div className="sub">Pinterest affiliate campaign engine</div></div><div className="pill">● HUMAN APPROVAL REQUIRED</div></header>
  <main>
   <section className="hero"><div><p className="eyebrow">AMAZON US · PINTEREST · USA</p><h1>Turn one prompt into<br/><em>10 ready-to-publish Pins.</em></h1><p className="muted">Generate, inspect, edit and schedule. PINORA never publishes without your explicit approval.</p></div><div className="stat"><b>{pins.length||"—"}</b><span>PINS IN CAMPAIGN</span></div></section>
   <nav><button className={tab==="generate"?"active":""} onClick={()=>setTab("generate")}>01 Generate</button><button className={tab==="review"?"active":""} onClick={()=>setTab("review")} disabled={!pins.length}>02 Review ({pins.length})</button><button className={tab==="queue"?"active":""} onClick={()=>setTab("queue")} disabled={!pins.length}>03 Schedule</button></nav>
   {tab==="generate"&&<section className="card generator"><label>PASTE TODAY'S MASTER PROMPT</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Paste the exact prompt generated for you here..."/><div className="checks"><span>✓ SEO metadata</span><span>✓ Affiliate disclosure</span><span>✓ Exact product link</span><span>✓ Board + posting time</span><span>✓ Review before publish</span></div><button className="primary" onClick={generate}>GENERATE 10-PIN CAMPAIGN →</button></section>}
   {tab==="review"&&<section><div className="notice">Review everything below. <b>Nothing is published from this screen.</b> Product tagging can remain manual if Pinterest requires it.</div><div className="grid">{pins.map((p,i)=><article className={"pin "+(!selected[p.id]?"off":"")} key={p.id}><div className="visual"><div className="visualText"><small>{p.trend}</small><strong>AI IMAGE<br/>PREVIEW</strong><span>2:3 Pinterest format</span></div></div><div className="pinbody"><div className="row"><b>#{i+1}</b><label className="switch"><input type="checkbox" checked={!!selected[p.id]} onChange={()=>toggle(p.id)}/><i/></label></div><h2>{p.title}</h2><div className="meta"><span>📌 {p.board}</span><span>🕐 {p.time}</span><span>⚡ {p.score}/100</span></div><div className="field"><b>PRODUCT TO TAG</b><p>{p.product}</p><code>{p.url}</code></div><div className="field"><b>SEO DESCRIPTION</b><p>{p.desc}</p></div><details><summary>Show all metadata</summary><p><b>Alt:</b> {p.alt}</p><p><b>Keywords:</b> {p.keywords}</p><p><b>Disclosure:</b> As an Amazon Associate I earn from qualifying purchases.</p></details></div></article>)}</div><div className="bottombar"><span>{Object.values(selected).filter(Boolean).length} Pins selected</span><button className="secondary" onClick={()=>setStatus("Draft saved locally.")}>SAVE DRAFT</button><button className="primary" onClick={()=>{setStatus("Approval recorded. Publishing connector is not active yet.");setTab("queue")}}>CONTINUE TO SCHEDULE →</button></div></section>}
   {tab==="queue"&&<section className="card queue"><div className="lock">✓</div><h2>Final approval gate</h2><p>{status}</p><div className="queueList">{pins.filter(p=>selected[p.id]).map(p=><div key={p.id}><span>{p.title}</span><b>{p.time}</b></div>)}</div><button className="primary" onClick={()=>setStatus("READY — no Pin has been published. Connect Pinterest publishing when ready.")}>SCHEDULE / PUBLISH SELECTED</button><p className="tiny">This MVP deliberately stops at the approval gate. No background publishing, scraping or credential collection is enabled.</p></section>}
  </main>
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);