import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const baseProducts=[
 ["Burgundy velvet throw pillow","https://www.amazon.com/"],
 ["Cream boucle throw blanket","https://www.amazon.com/"],
 ["Brass table lamp","https://www.amazon.com/"],
 ["Arched full-length mirror","https://www.amazon.com/"],
 ["Textured ceramic vase","https://www.amazon.com/"],
 ["Neutral woven basket","https://www.amazon.com/"]
];
const concepts=[
 {title:"The Burgundy Bedroom Trick That Makes Cream Feel Luxe",trend:"Burgundy + cream",board:"Cozy Bedroom Ideas",time:"7:15 PM",score:94,description:"Want a bedroom that feels rich and restful without looking dark? Balance deep burgundy with soft cream, touchable fabrics and warm lighting. Save this palette for your next bedroom refresh. #BedroomIdeas #BurgundyDecor #CozyBedroom #HomeDecorInspo"},
 {title:"Make Your Cozy Corner Look Collected, Not Cluttered",trend:"Boho / eclectic",board:"Cozy Home Inspiration",time:"8:05 PM",score:92,description:"Mix a tactile throw, a warm lamp, natural textures and one vintage-inspired accent for a space that feels personal. #CozyHome #EclecticDecor #HomeStyling"},
 {title:"A Reading Nook You’ll Want to Disappear Into",trend:"Warm minimalism",board:"Reading Nook Ideas",time:"6:45 PM",score:91,description:"Soft neutrals, layered lighting and thoughtful textures can make even an unused corner feel intentional. #ReadingNook #CozyCorners"},
 {title:"Steal This Burgundy Accent Idea for a Warmer Living Room",trend:"Burgundy accents",board:"Living Room Inspiration",time:"8:20 PM",score:90,description:"Try one deep burgundy accent against creamy upholstery and natural wood. It adds depth without taking over. #LivingRoomDecor #BurgundyAccents"},
 {title:"The Neutral Bedroom Formula That Never Feels Boring",trend:"Collected neutrals",board:"Bedroom Inspiration",time:"7:40 PM",score:89,description:"Layer linen, boucle, woven details and warm wood for a calm room full of character. #NeutralBedroom #LayeredTextures"},
 {title:"How to Mix Vintage Charm With a Clean Modern Home",trend:"Vintage modern",board:"Home Decor Ideas",time:"6:55 PM",score:88,description:"Add one vintage-inspired shape, warm lighting and natural materials to make a modern space feel collected. #VintageModern #WarmInteriors"},
 {title:"Burgundy, Cream and Wood: The Color Mix That Just Works",trend:"Earthy contrast",board:"Home Styling Ideas",time:"8:35 PM",score:87,description:"Burgundy brings depth, cream keeps things light, and wood adds warmth. #ColorPalette #BurgundyDecor"},
 {title:"The Layering Secret Behind a Pinterest-Worthy Bedroom",trend:"Layered textures",board:"Cozy Bedroom Ideas",time:"7:05 PM",score:86,description:"Combine soft bedding, a tactile throw, natural fibers and gentle lighting for effortless depth. #BedroomInspo #CozyBedroom"},
 {title:"Turn One Awkward Apartment Corner Into Your Favourite Spot",trend:"Moody cozy",board:"Apartment Decor",time:"9:00 PM",score:85,description:"Add a small lamp, a comfortable texture and one practical accent to create a cosy spot. #ApartmentDecor #CozyCorner"},
 {title:"Make a Small Room Feel Expensive Without Buying Everything",trend:"Affordable luxury",board:"Small Space Decor",time:"8:50 PM",score:84,description:"Repeat two or three colours, add varied textures and choose warm lighting for a considered space. #AffordableDecor #SmallSpaceDecor"}
];
const tabs=[["home","⌂","Home"],["create","＋","Create"],["schedule","▦","Schedule"],["analytics","▥","Analytics"],["saved","◇","Saved"]];
const ideaAngles=[
 ["The simple way to style","with a softer, more polished look"],
 ["A fresh take on","that feels warm, not cluttered"],
 ["Small details that make","feel thoughtfully put together"],
 ["A practical guide to","for a calmer everyday space"],
 ["How to bring more character to","without overspending"],
 ["The colour pairing that makes","feel inviting"],
 ["Easy updates to make","look more considered"],
 ["A cosy approach to","that still feels modern"],
 ["What to add (and what to skip) when styling",""],
 ["A collected, lived-in look for",""]
];
function makePins(prompt,count,previous=[]){
 const topic=prompt.trim().replace(/[.!?]+$/,"");
 const recent=new Set(previous);
 const pool=ideaAngles.map((a,i)=>({title:(a[0]+" "+topic+" "+a[1]).replace(/\\s+/g," ").trim(),angle:i}));
 const fresh=pool.filter(x=>!recent.has(x.title));
 const shuffled=[...fresh,...pool.filter(x=>recent.has(x.title))].sort(()=>Math.random()-.5);
 return shuffled.slice(0,count).map((idea,i)=>{
  const c=concepts[(idea.angle+i)%concepts.length];
  const title=idea.title;
  return {...c,title,id:Date.now()+i,prompt:topic,imageStatus:"not-generated",imageUrl:"",imageName:"",pinType:"affiliate",products:baseProducts,seoTitle:title.length>95?title.slice(0,92).trim()+"…":title,description:"A practical Pinterest idea for "+topic+". Use this as a starting point, then add your own images, product links and personal details. #PinterestIdeas #"+topic.replace(/[^a-z0-9]/gi,""),alt:"Pin image for "+topic,keywords:topic.toLowerCase()+", pinterest ideas, inspiration",disclosure:"Add the appropriate affiliate disclosure if you include paid links."};
 });
}
function readSavedState(){try{return JSON.parse(localStorage.getItem("pinvora_workspace_v1")||"{}")}catch{return {}}}
function App(){
 const [initial]=useState(readSavedState);
 const [prompt,setPrompt]=useState(initial.prompt||""),[pins,setPins]=useState(Array.isArray(initial.pins)?initial.pins:[]),[tab,setTab]=useState("home"),[count,setCount]=useState(5);
 const [selected,setSelected]=useState(initial.selected||{}),[open,setOpen]=useState({}),[status,setStatus]=useState("Your ideas are saved on this device."),[recentTitles,setRecentTitles]=useState(Array.isArray(initial.recentTitles)?initial.recentTitles:[]);
 useEffect(()=>{try{localStorage.setItem("pinvora_workspace_v1",JSON.stringify({prompt,pins,selected,recentTitles}))}catch{setStatus("Storage is full. Remove a large uploaded image to continue saving.")}},[prompt,pins,selected]);
 const chosen=pins.filter(p=>selected[p.id]);
 function generate(){if(!prompt.trim()){setStatus("Write a topic first.");return}const out=makePins(prompt,count,recentTitles);setRecentTitles(prev=>[...out.map(p=>p.title),...prev].slice(0,40));setPins(out);setSelected(Object.fromEntries(out.map(p=>[p.id,true])));setTab("review");setStatus("New draft ideas created. Add your own images before publishing.");}
 function toggle(id){setSelected(s=>({...s,[id]:!s[id]}))}
 function uploadImage(id,file){if(!file)return;if(!file.type.startsWith("image/")){setStatus("Please choose an image file.");return}if(file.size>8*1024*1024){setStatus("Choose an image under 8 MB.");return}const reader=new FileReader();reader.onload=()=>setPins(ps=>ps.map(p=>p.id===id?{...p,imageUrl:String(reader.result),imageName:file.name,imageStatus:"uploaded"}:p));reader.onerror=()=>setStatus("Image could not be read. Please try another file.");reader.readAsDataURL(file)}
 const goCreate=()=>setTab("create");
 return <div className="app">
  <header className="topbar"><button className="menuBtn" aria-label="Go to Home" onClick={()=>setTab("home")}>← <span>Home</span></button><div className="brand"><div className="brandName">Pinvora <span>♡</span></div><div className="brandTag">Plan · Create · Pin · Grow</div></div><div className="topActions"><button aria-label="Notifications" onClick={()=>setStatus("You’re all caught up.")}>♧</button><div className="bow" aria-label="Pinvora profile">P</div></div></header>
  <main>
   {tab==="home"&&<section className="homeScreen">
    <div className="greeting"><div className="greetingPaper"><h1>Hi Rasika <span>♡</span></h1></div><p>Ready to create something beautiful today?</p></div>
    <section className="featurePaper"><div className="featurePhoto"><div className="photoArt" role="img" aria-label="Burgundy flowers in a ceramic vase"/><i>taped memory</i></div><div className="featureCopy"><h2>Create Pins</h2><p>Turn your ideas into<br/>scroll-stopping pins</p><button className="creamBtn" onClick={goCreate}>Generate Now <span>→</span></button></div><span className="tape tapeA"/><span className="tape tapeB"/></section>
    <div className="homeTiles"><button onClick={()=>window.open("https://trends.pinterest.com/","_blank","noopener,noreferrer")}><span>⌕</span><b>Research</b><i/></button><button onClick={()=>setTab("schedule")}><span>▦</span><b>Schedule</b><i/></button><button onClick={()=>setTab("analytics")}><span>▥</span><b>Analytics</b><i/></button></div>

    {pins.length>0&&<button className="resumeBtn" onClick={()=>setTab("review")}>Continue your campaign · {pins.length} pins →</button>}
   </section>}
   {tab==="create"&&<section className="workScreen">
    <div className="sectionHeading"><h1>Make your Pins</h1><p>Start with one topic. Get fresh draft ideas to edit and make your own.</p></div>
    <div className="paperCard createCard"><label className="fieldLabel">Pin idea or topic</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="e.g., cozy home decor ideas, study setup, etc." maxLength={200}/><div className="counter">{prompt.length} / 200</div>
     <label className="fieldLabel">How many ideas?</label><div className="countChoices">{[5,10].map(n=><button className={count===n?"chosenCount":""} onClick={()=>setCount(n)} key={n}>{n}</button>)}</div>
     <button className="wineBtn generateBtn" onClick={generate}>Make my Pins</button><p className="helperText">{status} These are editable draft ideas, not finished images or AI-generated Pinterest content.</p>
    </div>
   </section>}
   {tab==="review"&&<section className="workScreen"><div className="sectionHeading"><h1>Your Pin Library</h1><p>Review each idea, add your image and approve what you love.</p></div>
    {!pins.length?<div className="paperCard emptyState"><h2>Your scrapbook is waiting</h2><p>Create your first campaign to see your Pins here.</p><button className="wineBtn" onClick={goCreate}>Create Pins →</button></div>:<><div className="reviewBar"><span>{chosen.length} of {pins.length} selected</span><button onClick={()=>setTab("schedule")}>Next: Schedule →</button></div><div className="pinGrid">{pins.map((p,i)=><article className="pinCard" key={p.id}><div className="pinVisual">{p.imageUrl?<img src={p.imageUrl} alt={p.alt}/>:<div className="imagePlaceholder"><span>2:3 PIN</span><b>YOUR PIN IMAGE</b><small>Add your generated image here</small></div>}<label className="uploadBtn">{p.imageUrl?"Replace image":"Upload image"}<input type="file" accept="image/*" onChange={e=>{uploadImage(p.id,e.target.files?.[0]);e.target.value=""}}/></label></div><div className="pinInfo"><div className="pinMeta"><span>PIN {String(i+1).padStart(2,"0")}</span><label><input type="checkbox" checked={!!selected[p.id]} onChange={()=>toggle(p.id)}/> Select</label></div><h2>{p.title}</h2><p className="pinBoard">♧ {p.board} · {p.time}</p><details><summary>SEO, description & products</summary><p><b>SEO title</b>{p.seoTitle}</p><p><b>Description</b>{p.description}</p><p><b>Products</b>{p.products.map(x=>x[0]).join(" · ")}</p><p><b>Disclosure</b>{p.disclosure}</p></details></div></article>)}</div></>}
   </section>}
   {tab==="schedule"&&<section className="workScreen"><div className="sectionHeading"><h1>Schedule Pins</h1><p>Plan and organise your Pinterest content.</p></div><div className="scheduleTabs"><span className="selected">Draft queue</span></div><div className="paperCard queueCard"><div className="queueTitle"><h2>Upcoming Pins</h2><span>{chosen.length}</span></div>{chosen.length?chosen.map((p,i)=><div className="queueItem" key={p.id}><div className="queueThumb">{p.imageUrl?<img src={p.imageUrl} alt=""/> :""}</div><div><b>{p.title}</b><small>▦ {p.time} · Draft</small></div><button onClick={()=>setTab("review")} aria-label="Edit pin">⋮</button></div>):<div className="emptyState"><p>Your schedule is empty. Create and select Pins to see them here.</p><button className="wineBtn" onClick={goCreate}>Create Pins →</button></div>}<button className="wineBtn scheduleAction" onClick={()=>setStatus("Your selected Pins are saved as local drafts on this device.")}>Save schedule draft</button><p className="helperText">{status} Publishing is not connected, so nothing is posted automatically.</p></div></section>}
   {tab==="analytics"&&<section className="workScreen"><div className="sectionHeading"><h1>Campaign overview</h1><p>See what you have prepared so far.</p></div><div className="metricGrid"><div><span>Campaign Pins</span><b>{pins.length}</b></div><div><span>Selected</span><b>{chosen.length}</b></div><div><span>Images Added</span><b>{pins.filter(p=>p.imageUrl).length}</b></div></div><div className="paperCard emptyState"><h2>Grow with intention</h2><p>Connect Pinterest analytics after the core creation and review flow is stable.</p></div></section>}
   {tab==="saved"&&<section className="workScreen"><div className="sectionHeading"><h1>Saved Pins</h1><p>Your selected draft ideas.</p></div>{chosen.length?<div className="pinGrid">{chosen.map(p=><article className="pinCard savedCard" key={p.id}><div className="pinVisual">{p.imageUrl?<img src={p.imageUrl} alt={p.alt}/>:<div className="imagePlaceholder"></div>}</div><div className="pinInfo"><h2>{p.title}</h2><p>{p.board}</p></div></article>)}</div>:<div className="paperCard emptyState"><h2>Nothing saved just yet</h2><p>Select your favourite Pins in the library and they’ll appear here.</p><button className="wineBtn" onClick={()=>setTab("review")}>Open Pin Library →</button></div>}</section>}
  </main>
  <nav className="bottomNav">{tabs.map(([id,icon,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><span>{icon}</span><small>{label}</small></button>)}</nav>
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);
if("serviceWorker" in navigator&&import.meta.env.PROD){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}))}
