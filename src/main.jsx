import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const baseProducts = [
  ["Burgundy velvet throw pillow","https://www.amazon.com/"],
  ["Cream boucle throw blanket","https://www.amazon.com/"],
  ["Brass table lamp","https://www.amazon.com/"],
  ["Arched full-length mirror","https://www.amazon.com/"],
  ["Textured ceramic vase","https://www.amazon.com/"],
  ["Neutral woven basket","https://www.amazon.com/"]
];

const concepts = [
  {title:"Burgundy & Cream Cozy Bedroom",trend:"Burgundy + cream",board:"Cozy Bedroom Ideas",time:"7:15 PM EST",score:94},
  {title:"Hobo-Inspired Layered Corner",trend:"Hobo / eclectic",board:"Cozy Home Inspiration",time:"8:05 PM EST",score:92},
  {title:"Warm Editorial Reading Nook",trend:"Warm minimalism",board:"Reading Nook Ideas",time:"6:45 PM EST",score:91},
  {title:"Burgundy Accent Living Room",trend:"Burgundy accents",board:"Living Room Inspiration",time:"8:20 PM EST",score:90},
  {title:"Collected Neutral Bedroom",trend:"Collected neutrals",board:"Bedroom Inspiration",time:"7:40 PM EST",score:89},
  {title:"Vintage-Modern Cozy Home",trend:"Vintage modern",board:"Home Decor Ideas",time:"6:55 PM EST",score:88},
  {title:"Cream, Wood & Burgundy Styling",trend:"Earthy contrast",board:"Home Styling Ideas",time:"8:35 PM EST",score:87},
  {title:"Layered Texture Bedroom",trend:"Layered textures",board:"Cozy Bedroom Ideas",time:"7:05 PM EST",score:86},
  {title:"Moody Cozy Apartment Corner",trend:"Moody cozy",board:"Apartment Decor",time:"9:00 PM EST",score:85},
  {title:"Small Space Luxury on a Budget",trend:"Affordable luxury",board:"Small Space Decor",time:"8:50 PM EST",score:84}
];

function makePins(prompt){
  return concepts.map((c,i)=>({
    ...c,id:Date.now()+i,prompt:prompt.trim(),imageStatus:"not-generated",
    products:baseProducts,
    seoTitle:c.title+" | Cozy Home Decor Ideas",
    description:"Create a warm, layered home look with burgundy, cream and natural textures. Shop the individual pieces and recreate this cozy editorial aesthetic.",
    alt:"Burgundy and cream cozy home interior with layered textures and warm lighting",
    keywords:"burgundy home decor, cream home decor, cozy bedroom, cozy living room, warm neutral decor, eclectic home decor, affordable home decor",
    disclosure:"As an Amazon Associate I earn from qualifying purchases."
  }));
}

function App(){
 const [prompt,setPrompt]=useState(""),[pins,setPins]=useState([]),[tab,setTab]=useState("generate");
 const [selected,setSelected]=useState({}),[open,setOpen]=useState({}),[status,setStatus]=useState("Draft — nothing can publish automatically.");
 function generate(){const out=makePins(prompt);setPins(out);setSelected(Object.fromEntries(out.map(p=>[p.id,true])));setTab("review")}
 function toggle(id){setSelected(s=>({...s,[id]:!s[id]}))}
 function toggleOpen(id){setOpen(s=>({...s,[id]:!s[id]}))}
 function requestImage(id){setPins(ps=>ps.map(p=>p.id===id?{...p,imageStatus:"queued"}:p))}
 const chosen=pins.filter(p=>selected[p.id]);
 return <div className="app">
  <header><div><div className="logo">PIN<span>ORA</span></div><div className="sub">Pinterest affiliate campaign engine</div></div><div className="pill">● HUMAN APPROVAL REQUIRED</div></header>
  <main>
   <section className="hero"><div><p className="eyebrow">AMAZON US · PINTEREST · USA</p><h1>Turn one prompt into<br/><em>10 ready-to-publish Pins.</em></h1><p className="muted">Research, create, inspect and schedule. PINORA never publishes without your explicit approval.</p></div><div className="stat"><b>{pins.length||"—"}</b><span>PINS IN CAMPAIGN</span></div></section>
   <nav><button className={tab==="generate"?"active":""} onClick={()=>setTab("generate")}>01 Generate</button><button className={tab==="review"?"active":""} onClick={()=>setTab("review")} disabled={!pins.length}>02 Review ({pins.length})</button><button className={tab==="queue"?"active":""} onClick={()=>setTab("queue")} disabled={!pins.length}>03 Schedule</button></nav>
   {tab==="generate"&&<section className="card generator"><label>PASTE TODAY'S MASTER PROMPT</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Paste the exact master prompt generated for you here..."/><div className="checks"><span>✓ Highest-potential concepts</span><span>✓ SEO title + description</span><span>✓ 5–6 product candidates</span><span>✓ Affiliate disclosure</span><span>✓ Board + posting time</span><span>✓ Human review first</span></div><button className="primary" onClick={generate}>GENERATE 10-PIN CAMPAIGN →</button></section>}
   {tab==="review"&&<section><div className="notice"><b>Campaign review.</b> Each Pin can contain multiple products. Images are not being faked as finished assets; the connected AI image step will replace this state.</div><div className="grid">{pins.map((p,i)=><article className={"pin "+(!selected[p.id]?"off":"")} key={p.id}>
    <div className="visual"><div className="imageState"><span className="imageBadge">2:3 PIN</span>{p.imageStatus==="queued"?<><strong>IMAGE QUEUED</strong><small>Ready for the AI image generation connector.</small></>:<><strong>AI IMAGE</strong><small>Not generated yet</small><button className="imageBtn" onClick={()=>requestImage(p.id)}>GENERATE IMAGE</button></>}</div></div>
    <div className="pinbody"><div className="row"><b>PIN #{i+1}</b><label className="switch"><input type="checkbox" checked={!!selected[p.id]} onChange={()=>toggle(p.id)}/><i/></label></div><h2>{p.title}</h2><div className="meta"><span>📌 {p.board}</span><span>🕐 {p.time}</span><span>⚡ {p.score}/100</span></div>
    <div className="field"><b>HIGHEST-PRIORITY SEO TITLE</b><p>{p.seoTitle}</p></div><div className="field"><b>PINTEREST DESCRIPTION</b><p>{p.description}</p></div>
    <div className="field"><div className="fieldHead"><b>PRODUCTS TO TAG · {p.products.length}</b><span>Amazon US</span></div><div className="products">{p.products.map((prod,j)=><div className="product" key={j}><span><strong>{j+1}.</strong> {prod[0]}</span><code>{prod[1]}</code></div>)}</div></div>
    <button className="expand" onClick={()=>toggleOpen(p.id)}>{open[p.id]?"HIDE MORE DETAILS":"SHOW ALT TEXT · KEYWORDS · DISCLOSURE"} <span>{open[p.id]?"↑":"↓"}</span></button>
    {open[p.id]&&<div className="extra"><p><b>ALT TEXT</b>{p.alt}</p><p><b>KEYWORDS</b>{p.keywords}</p><p><b>AFFILIATE DISCLOSURE</b>{p.disclosure}</p></div>}
    </div></article>)}</div><div className="bottombar"><span>{chosen.length} Pins selected</span><button className="secondary" onClick={()=>setStatus("Draft saved locally.")}>SAVE DRAFT</button><button className="primary" onClick={()=>{setStatus("Review complete. No Pin has been published.");setTab("queue")}}>CONTINUE TO SCHEDULE →</button></div></section>}
   {tab==="queue"&&<section className="card queue"><div className="lock">✓</div><h2>Final approval gate</h2><p>{status}</p><div className="queueList">{chosen.map(p=><div key={p.id}><span>{p.title}</span><b>{p.time}</b></div>)}</div><button className="primary" onClick={()=>setStatus("READY — no Pin has been published. Pinterest publishing is not connected yet.")}>SCHEDULE / PUBLISH SELECTED</button><p className="tiny">Publishing stays disabled until a real Pinterest connector is configured. No background publishing or credential collection is enabled.</p></section>}
  </main>
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);