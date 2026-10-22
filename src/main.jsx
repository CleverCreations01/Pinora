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
  {title:"The Burgundy Bedroom Trick That Makes Cream Feel Luxe",trend:"Burgundy + cream",board:"Cozy Bedroom Ideas",time:"7:15 PM EST",score:94,description:"Want a bedroom that feels rich and restful without looking dark? The secret is balancing deep burgundy with soft cream, touchable fabrics and warm lighting. Save this palette for your next bedroom refresh, then explore the pieces that help bring the look together. #BedroomIdeas #BurgundyDecor #CozyBedroom #HomeDecorInspo #WarmNeutrals"},
  {title:"Make Your Cozy Corner Look Collected, Not Cluttered",trend:"Boho / eclectic",board:"Cozy Home Inspiration",time:"8:05 PM EST",score:92,description:"The coziest corners rarely look like they came straight from one store. Mix a tactile throw, a warm lamp, natural textures and one vintage-inspired accent for a space that feels personal. Save this idea for your next slow Sunday styling session. #CozyHome #EclecticDecor #HomeStyling #InteriorInspiration #SmallSpaceDecor"},
  {title:"A Reading Nook You’ll Want to Disappear Into",trend:"Warm minimalism",board:"Reading Nook Ideas",time:"6:45 PM EST",score:91,description:"Imagine closing the door on a busy day and sinking into this warm little reading nook. Soft neutrals, layered lighting and a few thoughtful textures can make even an unused corner feel intentional. Save this setup for your dream-home board. #ReadingNook #CozyCorners #WarmMinimalism #HomeInspiration #InteriorStyling"},
  {title:"Steal This Burgundy Accent Idea for a Warmer Living Room",trend:"Burgundy accents",board:"Living Room Inspiration",time:"8:20 PM EST",score:90,description:"If your living room feels a little flat, try one deep burgundy accent against creamy upholstery and natural wood. It adds depth without taking over the whole room. Pin this color combination now so you have it ready when you restyle. #LivingRoomDecor #BurgundyAccents #CozyLivingRoom #NeutralHome #DecorIdeas"},
  {title:"The Neutral Bedroom Formula That Never Feels Boring",trend:"Collected neutrals",board:"Bedroom Inspiration",time:"7:40 PM EST",score:89,description:"Neutral doesn’t have to mean plain. The trick is layering different textures—linen, boucle, woven details and warm wood—so the room feels calm but still full of character. Save this formula for a bedroom that feels thoughtfully finished. #NeutralBedroom #BedroomDecor #LayeredTextures #CozyHome #InteriorIdeas"},
  {title:"How to Mix Vintage Charm With a Clean Modern Home",trend:"Vintage modern",board:"Home Decor Ideas",time:"6:55 PM EST",score:88,description:"Love modern spaces but wish they felt less showroom-perfect? Add one vintage-inspired shape, warm lighting and natural materials to make the room feel collected over time. Save this blend of old-soul character and modern simplicity. #VintageModern #HomeDecorIdeas #CollectedHome #InteriorDesignInspo #WarmInteriors"},
  {title:"Burgundy, Cream and Wood: The Color Mix That Just Works",trend:"Earthy contrast",board:"Home Styling Ideas",time:"8:35 PM EST",score:87,description:"This palette works because every shade has a job: burgundy brings depth, cream keeps things light, and wood adds warmth. Use it in a bedroom, living room or reading corner for a cohesive look that still feels inviting. Save it before your next decor refresh. #ColorPalette #BurgundyDecor #CreamAesthetic #WoodAccents #HomeStyling"},
  {title:"The Layering Secret Behind a Pinterest-Worthy Bedroom",trend:"Layered textures",board:"Cozy Bedroom Ideas",time:"7:05 PM EST",score:86,description:"The difference between a basic bedroom and a beautifully layered one is often texture, not more stuff. Combine soft bedding, a tactile throw, natural fibers and gentle lighting for depth that looks effortless. Save this checklist for your next room reset. #BedroomInspo #CozyBedroom #LayeredBedding #TexturedDecor #PinterestHome"},
  {title:"Turn One Awkward Apartment Corner Into Your Favourite Spot",trend:"Moody cozy",board:"Apartment Decor",time:"9:00 PM EST",score:85,description:"That empty corner might be the most useful space in your apartment. Add a small lamp, a comfortable texture and one practical accent to create a cosy spot without crowding the room. Save this idea if you’re decorating a rental or small home. #ApartmentDecor #SmallSpaceLiving #CozyCorner #RentalFriendly #HomeIdeas"},
  {title:"Make a Small Room Feel Expensive Without Buying Everything",trend:"Affordable luxury",board:"Small Space Decor",time:"8:50 PM EST",score:84,description:"A polished room is more about a few deliberate choices than filling every corner. Repeat two or three colours, add varied textures and choose warm lighting to make a small space feel considered. Save these ideas before spending on your next home update. #AffordableDecor #SmallSpaceDecor #BudgetHomeDecor #CozyInteriors #HomeMakeover"}
];

function makePins(prompt){
  return concepts.map((c,i)=>({
    ...c,id:Date.now()+i,prompt:prompt.trim(),imageStatus:"not-generated",imageUrl:"",imageName:"",pinType:"affiliate",
    products:baseProducts,
    seoTitle:c.title.length>95?c.title.slice(0,92).trim()+"…":c.title,
    description:c.description+" (paid links) As an Amazon Associate I earn from qualifying purchases.",
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
 function uploadImage(id,file){
  if(!file)return;
  if(!file.type.startsWith("image/")){setStatus("Please choose an image file.");return;}
  if(file.size>8*1024*1024){setStatus("Choose an image under 8 MB.");return;}
  const reader=new FileReader();
  reader.onload=()=>setPins(ps=>ps.map(p=>p.id===id?{...p,imageUrl:String(reader.result),imageName:file.name,imageStatus:"uploaded"}:p));
  reader.onerror=()=>setStatus("Image could not be read. Please try another file.");
  reader.readAsDataURL(file);
 }
 const chosen=pins.filter(p=>selected[p.id]);
 return <div className="app">
  <header><div className="brandlock"><img src="/icon.svg" alt="PINVORA logo"/><div><div className="logo">PINVORA</div><div className="sub">Plan · Create · Post · Grow</div></div></div></header>
  <main>
   <section className="hero"><div className="heroCopy"><p className="eyebrow">YOUR PINTEREST STUDIO <span>✳</span></p><h1>Small Pins,<br/><em>big dreams.</em></h1><p className="muted">A little inspiration, ready to become your next beautiful Pin.</p><div className="heroNote">Made for your next good idea.</div></div><div className="stat"><span className="statLabel">CURRENT CAMPAIGN</span><b>{pins.length||"—"}</b><span>PINS IN YOUR WORKSPACE</span><div className="statDoodle">✳ &nbsp; ✿ &nbsp; ♡</div></div></section>
   <section className="quickActions"><button onClick={()=>setTab("generate")}><span>✳</span><b>Create a campaign</b><small>Turn one idea into a plan</small></button><button onClick={()=>setTab("review")} disabled={!pins.length}><span>▧</span><b>Pin library</b><small>Review images and copy</small></button><button onClick={()=>setTab("queue")} disabled={!pins.length}><span>◷</span><b>Posting plan</b><small>Prepare your queue</small></button></section>
   <nav><button className={tab==="generate"?"active":""} onClick={()=>setTab("generate")}>01 Generate</button><button className={tab==="review"?"active":""} onClick={()=>setTab("review")} disabled={!pins.length}>02 Review ({pins.length})</button><button className={tab==="queue"?"active":""} onClick={()=>setTab("queue")} disabled={!pins.length}>03 Schedule</button></nav>
   {tab==="generate"&&<section className="card generator"><label>WHAT ARE WE CREATING TODAY?</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Example: warm burgundy bedroom decor, small-space styling, cozy reading nooks…"/><div className="checks"><span>✓ Highest-potential concepts</span><span>✓ SEO title + description</span><span>✓ 5–6 product candidates</span><span>✓ Affiliate disclosure</span><span>✓ Board + posting time</span><span>✓ Human review first</span></div><button className="primary" onClick={generate}>CREATE MY PIN CAMPAIGN →</button></section>}
   {tab==="review"&&<section><div className="notice"><b>Campaign review.</b> Each Pin can contain multiple products. Images are not being faked as finished assets; the connected AI image step will replace this state.</div><div className="grid">{pins.map((p,i)=><article className={"pin "+(!selected[p.id]?"off":"")} key={p.id}>
    <div className="visual">
    {p.imageUrl?<div className="uploadedPreview"><img src={p.imageUrl} alt={p.alt}/><div className="uploadedLabel">✓ IMAGE ADDED · {p.imageName}</div></div>:<div className="imageState"><span className="imageBadge">2:3 PIN</span><strong>{p.imageStatus==="queued"?"IMAGE QUEUED":"ADD YOUR IMAGE"}</strong><small>{p.imageStatus==="queued"?"Automatic AI generation is not connected. Upload a ChatGPT image instead.":"Choose an image you generated in ChatGPT and saved to your phone."}</small></div>}
    <label className="uploadBtn">{p.imageUrl?"REPLACE IMAGE":"UPLOAD CHATGPT IMAGE"}<input type="file" accept="image/*" onChange={e=>{uploadImage(p.id,e.target.files?.[0]);e.target.value=""}}/></label>
   </div>
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
if ("serviceWorker" in navigator && import.meta.env.PROD) { window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {})); }
