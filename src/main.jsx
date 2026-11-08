import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const trendThemes=[
 {topic:"home decor",moods:["warm minimalism","vintage cottage","earthy modern","soft romantic","small-space styling"],angles:["room refresh ideas","decorating mistakes to avoid","budget-friendly upgrades","colour combinations","space-saving finds"],products:["table lamps","throw pillows","storage baskets","wall art","decorative mirrors"]},
 {topic:"beauty",moods:["clean girl","soft glam","everyday natural","minimal routine","self-care"],angles:["everyday essentials","routine ideas","budget beauty finds","giftable favourites","beginner tips"],products:["makeup organizers","beauty tools","vanity mirrors","travel cases","skincare storage"]},
 {topic:"fashion",moods:["quiet luxury","casual chic","minimal wardrobe","romantic feminine","street style"],angles:["outfit formulas","wardrobe staples","seasonal finds","ways to style","capsule wardrobe"],products:["handbags","jewellery","shoes","basic tops","accessories"]},
 {topic:"kitchen",moods:["warm farmhouse","clean minimal","colourful playful","organized home","modern rustic"],angles:["organization ideas","useful kitchen finds","small kitchen solutions","meal prep essentials","countertop styling"],products:["storage jars","drawer organizers","kitchen tools","shelving","cookware"]},
 {topic:"study",moods:["soft academia","clean desk","cozy focus","minimal setup","colour-coded"],angles:["desk setup ideas","study essentials","organization tips","small-space setup","productivity finds"],products:["desk lamps","planners","pen organizers","laptop stands","storage"]},
 {topic:"travel",moods:["slow travel","coastal escape","city break","minimal packing","weekend getaway"],angles:["packing essentials","travel outfit ideas","weekend itineraries","travel organization","useful travel finds"],products:["packing cubes","travel bags","organizers","accessories","travel bottles"]}
];
const mixMoods=["warm minimalism","vintage-inspired","soft romantic","earthy modern","playful colour","quiet luxury","cozy neutral","editorial"];
const mixAngles=["fresh ideas","practical tips","budget-friendly finds","styling inspiration","things worth saving","simple upgrades","gift ideas","beginner-friendly guide"];
function pick(arr,seed){return arr[Math.abs(seed)%arr.length]}
function topicGroup(topic){
 const t=topic.toLowerCase();
 return trendThemes.find(x=>t.includes(x.topic)||x.topic.split(" ").some(w=>w.length>4&&t.includes(w)))||{topic,moods:mixMoods,angles:mixAngles,products:["useful essentials","accessories","organizers","decor pieces","everyday finds"]};
}
function titleCase(s){return s.replace(/\b\w/g,c=>c.toUpperCase())}
function makePins(prompt,count,type,previous=[]){
 const topic=prompt.trim().replace(/[.!?]+$/,"");
 const group=topicGroup(topic),recent=new Set(previous),now=Date.now();
 const structures=[
  (m,a,n)=>`${n} ${titleCase(topic)} Ideas for a ${titleCase(m)} Look`,
  (m,a)=>`The ${titleCase(m)} Guide to ${titleCase(topic)}`,
  (m,a)=>`Save These ${titleCase(topic)} ${titleCase(a)}`,
  (m,a)=>`Easy ${titleCase(topic)} ${titleCase(a)} to Try`,
  (m,a)=>`A Fresh Take on ${titleCase(topic)}: ${titleCase(m)} Ideas`,
  (m,a)=>`How to Make ${titleCase(topic)} Feel More ${titleCase(m)}`,
  (m,a)=>`Little ${titleCase(topic)} Upgrades That Make a Difference`,
  (m,a)=>`The ${titleCase(topic)} Finds Worth Saving`,
  (m,a)=>`Your Guide to ${titleCase(topic)}: ${titleCase(a)}`,
  (m,a)=>`Beautiful and Practical ${titleCase(topic)} Ideas`
 ];
 const candidates=[];
 for(let i=0;i<Math.max(count*4,20);i++){
  const seed=(now+i*7+topic.length*13);
  const mood=type==="mix"?pick(mixMoods,seed):pick(group.moods,seed);
  const angle=pick(group.angles,seed*3+i);
  const title=structures[i%structures.length](mood,angle,i%2?10:7);
  if(!recent.has(title)&&!candidates.some(x=>x.title===title))candidates.push({title,mood,angle,seed});
 }
 return candidates.slice(0,count).map((c,i)=>{
  const affiliate=type==="affiliate"||(type==="mix"&&i<Math.max(1,Math.round(count*0.3)));
  const product=pick(group.products,c.seed+i);
  const title=c.title;
  const description=`Explore ${topic.toLowerCase()} with ${c.mood} inspiration. Discover ${c.angle.toLowerCase()}, thoughtful details and ${product.toLowerCase()} worth considering. Save this idea for your next ${topic.toLowerCase()} refresh. #${topic.replace(/[^a-z0-9]/gi,"")} #PinterestIdeas #Inspiration`;
  return {id:now+i,title,trend:c.mood,board:titleCase(topic)+" Ideas",time:"Not scheduled",score:null,description,seoTitle:title,alt:title+" — "+c.mood+" inspiration",keywords:[topic,c.mood,c.angle,product].join(", "),disclosure:"As an Amazon Associate I earn from qualifying purchases.",pinType:affiliate?"affiliate":"inspiration",productName:product,productUrl:"",imageStatus:"not-generated",imageUrl:"",imageName:"",products:[]};
 });
}
function addAmazonTag(url,tag){try{const u=new URL(url);if(!/amazon\.com$/i.test(u.hostname.replace(/^www\./,""))&&!/amazon\.com$/i.test(u.hostname))return url;if(tag)u.searchParams.set("tag",tag);return u.toString()}catch{return url}}
function readSavedState(){try{return JSON.parse(localStorage.getItem("pinvora_workspace_v1")||"{}")}catch{return {}}}
function App(){
 const [initial]=useState(readSavedState);
 const [prompt,setPrompt]=useState(initial.prompt||""),[pins,setPins]=useState(Array.isArray(initial.pins)?initial.pins:[]),[tab,setTab]=useState("home"),[count,setCount]=useState(10),[campaignType,setCampaignType]=useState("mix"),[associateTag,setAssociateTag]=useState(initial.associateTag||"");
 const [selected,setSelected]=useState(initial.selected||{}),[open,setOpen]=useState({}),[status,setStatus]=useState("Your ideas are saved on this device."),[recentTitles,setRecentTitles]=useState(Array.isArray(initial.recentTitles)?initial.recentTitles:[]);
 useEffect(()=>{try{localStorage.setItem("pinvora_workspace_v1",JSON.stringify({prompt,pins,selected,recentTitles,associateTag}))}catch{setStatus("Storage is full. Remove a large uploaded image to continue saving.")}},[prompt,pins,selected]);
 const chosen=pins.filter(p=>selected[p.id]);
 function generate(){if(!prompt.trim()){setStatus("Write a campaign topic first.");return}const out=makePins(prompt,count,campaignType,recentTitles);setRecentTitles(prev=>[...out.map(p=>p.title),...prev].slice(0,40));setPins(out);setSelected(Object.fromEntries(out.map(p=>[p.id,true])));setTab("review");setStatus("Your campaign drafts are ready. Review titles, descriptions and product links.");}
 function toggle(id){setSelected(s=>({...s,[id]:!s[id]}))}
 function uploadImage(id,file){if(!file)return;if(!file.type.startsWith("image/")){setStatus("Please choose an image file.");return}if(file.size>8*1024*1024){setStatus("Choose an image under 8 MB.");return}const reader=new FileReader();reader.onload=()=>setPins(ps=>ps.map(p=>p.id===id?{...p,imageUrl:String(reader.result),imageName:file.name,imageStatus:"uploaded"}:p));reader.onerror=()=>setStatus("Image could not be read. Please try another file.");reader.readAsDataURL(file)}
 const goCreate=()=>setTab("create");
 return <div className="app">
  <header className="topbar"><button className="menuBtn" aria-label="Go to Home" onClick={()=>setTab("home")}>← <span>Home</span></button><div className="brand"><div className="brandName">Pinvora <span>♡</span></div><div className="brandTag">Plan · Create · Pin · Grow</div></div><div className="topActions"><button aria-label="Notifications" onClick={()=>setStatus("You’re all caught up.")}>♧</button><div className="bow" aria-label="Pinvora profile">P</div></div></header>
  <main>
   {tab==="home"&&<section className="homeScreen">
    <div className="greeting"><div className="greetingPaper"><h1>Hi Rasika <span>♡</span></h1></div><p>Ready to create something beautiful today?</p></div>
    <section className="featurePaper"><div className="featurePhoto"><div className="photoArt" role="img" aria-label="Burgundy flowers in a ceramic vase"/><i>taped memory</i></div><div className="featureCopy"><h2>Create Pins</h2><p>Turn your ideas into<br/>scroll-stopping pins</p><button className="creamBtn" onClick={goCreate}>Generate Now <span>→</span></button></div><span className="tape tapeA"/><span className="tape tapeB"/></section>
    <div className="homeTiles"><button onClick={()=>setTab("review")}><span>▤</span><b>Your Pins</b><i/></button><button onClick={()=>setTab("schedule")}><span>▦</span><b>Schedule</b><i/></button><button onClick={()=>setTab("saved")}><span>◇</span><b>Saved</b><i/></button></div>

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
    {!pins.length?<div className="paperCard emptyState"><h2>Your scrapbook is waiting</h2><p>Create your first campaign to see your Pins here.</p><button className="wineBtn" onClick={goCreate}>Create Pins →</button></div>:<><div className="reviewBar"><span>{chosen.length} of {pins.length} selected</span><button onClick={()=>setTab("schedule")}>Next: Schedule →</button></div><div className="pinGrid">{pins.map((p,i)=><article className="pinCard" key={p.id}><div className="pinVisual">{p.imageUrl?<img src={p.imageUrl} alt={p.alt}/>:<div className="imagePlaceholder"><span>2:3 PIN</span><b>YOUR PIN IMAGE</b><small>Add your generated image here</small></div>}<label className="uploadBtn">{p.imageUrl?"Replace image":"Upload image"}<input type="file" accept="image/*" onChange={e=>{uploadImage(p.id,e.target.files?.[0]);e.target.value=""}}/></label></div><div className="pinInfo"><div className="pinMeta"><span>PIN {String(i+1).padStart(2,"0")}</span><label><input type="checkbox" checked={!!selected[p.id]} onChange={()=>toggle(p.id)}/> Select</label></div><label className="fieldLabel">Title</label><input className="editField" value={p.title} maxLength={100} onChange={e=>setPins(ps=>ps.map(x=>x.id===p.id?{...x,title:e.target.value,seoTitle:e.target.value}:x))}/><label className="fieldLabel">Description</label><textarea className="editField editDescription" value={p.description} maxLength={500} onChange={e=>setPins(ps=>ps.map(x=>x.id===p.id?{...x,description:e.target.value}:x))}/><div className="pinBoard">{p.pinType==="affiliate"?"Affiliate (30%)":"Inspiration (70%)"} · {p.trend}</div><label className="fieldLabel">Product idea</label><p className="productHint">{p.productName}</p><label className="fieldLabel">Amazon product link (US)</label><input className="editField" placeholder="Paste your Amazon.com product URL" value={p.productUrl||""} onChange={e=>setPins(ps=>ps.map(x=>x.id===p.id?{...x,productUrl:e.target.value}:x))} onBlur={()=>setPins(ps=>ps.map(x=>x.id===p.id?{...x,productUrl:addAmazonTag(x.productUrl,associateTag)}:x))}/><p className="affiliateDisclosure">{p.pinType==="affiliate"?p.disclosure:"Add affiliate disclosure when you attach a paid link."}</p></div></article>)}</div></>}
   </section>}
   {tab==="schedule"&&<section className="workScreen"><div className="sectionHeading"><h1>Schedule Pins</h1><p>Plan and organise your Pinterest content.</p></div><div className="scheduleTabs"><span className="selected">Draft queue</span></div><div className="paperCard queueCard"><div className="queueTitle"><h2>Upcoming Pins</h2><span>{chosen.length}</span></div>{chosen.length?chosen.map((p,i)=><div className="queueItem" key={p.id}><div className="queueThumb">{p.imageUrl?<img src={p.imageUrl} alt=""/> :""}</div><div><b>{p.title}</b><small>▦ {p.time} · Draft</small></div><button onClick={()=>setTab("review")} aria-label="Edit pin">⋮</button></div>):<div className="emptyState"><p>Your schedule is empty. Create and select Pins to see them here.</p><button className="wineBtn" onClick={goCreate}>Create Pins →</button></div>}<button className="wineBtn scheduleAction" onClick={()=>setStatus("Your selected Pins are saved as local drafts on this device.")}>Save schedule draft</button><p className="helperText">{status} Publishing is not connected, so nothing is posted automatically.</p></div></section>}
   {tab==="analytics"&&<section className="workScreen"><div className="sectionHeading"><h1>Campaign overview</h1><p>See what you have prepared so far.</p></div><div className="paperCard settingsCard"><h2>Amazon Associates (United States)</h2><p>Add your Amazon.com tracking ID. Pinvora will append it to Amazon product links you provide.</p><label className="fieldLabel">Tracking ID</label><input className="editField" placeholder="yourstore-20" value={associateTag} onChange={e=>setAssociateTag(e.target.value.trim())}/><p className="helperText">Your tracking ID is saved only in this browser. When you paste an Amazon.com product URL into a Pin, Pinvora can add this tag. Automatic product search is not connected.</p><button className="wineBtn" onClick={()=>setStatus("Amazon Associates tracking ID saved on this device.")}>Save tracking ID</button><p className="helperText">{status}</p></div></section>}
   {tab==="saved"&&<section className="workScreen"><div className="sectionHeading"><h1>Saved Pins</h1><p>Your selected draft ideas.</p></div>{chosen.length?<div className="pinGrid">{chosen.map(p=><article className="pinCard savedCard" key={p.id}><div className="pinVisual">{p.imageUrl?<img src={p.imageUrl} alt={p.alt}/>:<div className="imagePlaceholder"></div>}</div><div className="pinInfo"><h2>{p.title}</h2><p>{p.board}</p></div></article>)}</div>:<div className="paperCard emptyState"><h2>Nothing saved just yet</h2><p>Select your favourite Pins in the library and they’ll appear here.</p><button className="wineBtn" onClick={()=>setTab("review")}>Open Pin Library →</button></div>}</section>}
  </main>
  <nav className="bottomNav">{[...tabs,["analytics","⚙","Profile"]].filter(([id],i,a)=>a.findIndex(x=>x[0]===id)===i).map(([id,icon,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><span>{icon}</span><small>{label}</small></button>)}</nav>
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);
if("serviceWorker" in navigator&&import.meta.env.PROD){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}))}
