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
const mixGenres=["home decor","beauty","fashion","kitchen","study","travel"];
const roomIdeas=["living room","bedroom","entryway","small bathroom","rental apartment"];
const topicDetails={
 "home decor":{moods:["collected vintage","warm minimal","English cottage","earthy contemporary","soft romantic"],angles:["layered lighting","art and frame arrangements","textile combinations","small-space storage","furniture layout"],products:["linen cushion covers","ceramic table lamps","vintage-style wall art","woven storage baskets","arched mirrors"]},
 beauty:{moods:["fresh everyday","soft glam","skin-first","minimal routine","polished natural"],angles:["a five-minute routine","vanity organisation","everyday makeup combinations","travel-ready essentials","brush and tool care"],products:["makeup organisers","vanity mirrors","brush holders","travel makeup bags","makeup brushes"]},
 fashion:{moods:["relaxed tailoring","modern feminine","quiet luxury","weekend casual","minimal wardrobe"],angles:["three ways to style one piece","a wearable colour palette","capsule wardrobe building","day-to-night outfit formulas","accessory pairings"],products:["structured handbags","simple gold jewellery","everyday flats","classic belts","wardrobe basics"]},
 kitchen:{moods:["warm farmhouse","modern rustic","colourful practical","calm minimal","collected kitchen"],angles:["countertop zones","drawer organisation","open-shelf styling","small-kitchen storage","weeknight prep setup"],products:["glass pantry jars","drawer dividers","wooden utensil holders","countertop organisers","stackable containers"]},
 study:{moods:["soft academia","focused minimal","warm practical","colour-coded calm","creative desk"],angles:["a compact desk layout","cable-free organisation","study zone lighting","notebook and stationery setup","small-room workspace ideas"],products:["adjustable desk lamps","desk organisers","laptop stands","weekly planners","pen cups"]},
 travel:{moods:["slow weekend","coastal light","city-break practical","carry-on minimal","heritage escape"],angles:["a carry-on packing list","a weekend outfit plan","personal-item organisation","a compact travel kit","a simple two-day itinerary"],products:["packing cubes","weekender bags","travel pouches","luggage organisers","refillable travel bottles"]}
};
function pick(arr,seed){return arr[Math.abs(seed)%arr.length]}
function titleCase(s){return s.replace(/\\b\\w/g,c=>c.toUpperCase())}
function makePins(prompt,count,type,previous=[],genre=""){
 const focus=prompt.trim().replace(/[.!?]+$/,"");
 const now=Date.now();
 const priorTitles=new Set(previous.map(x=>typeof x==="string"?x:x.title).filter(Boolean));
 const room=focus.match(/living room|bedroom|entryway|bathroom|kitchen|dining room|home office|rental apartment|small apartment/i)?.[0]?.toLowerCase();
 const patterns={
  "home decor":[
   (r,a)=>`${titleCase(r)} Ideas That Feel Collected, Warm and Personal`,
   (r,a)=>`How to Style a ${titleCase(r)}: Lighting, Texture and Layout`,
   (r,a)=>`A More Beautiful ${titleCase(r)}: ${titleCase(a)} That Actually Work`,
   (r,a)=>`The ${titleCase(r)} Refresh: Five Details That Change the Whole Room`,
   (r,a)=>`Small ${titleCase(r)}? Smart Layouts and Storage Worth Stealing`,
   (r,a)=>`A Thoughtful ${titleCase(r)}: Colours, Textures and Finishing Touches`
  ],
  beauty:[(r,a)=>`The Everyday Beauty Edit: ${titleCase(a)} That Earn Their Place`,(r,a)=>`A Simple ${titleCase(r)} Routine for Busy Mornings`,(r,a)=>`Beauty Details That Make Your Daily Routine Feel Better`],
  fashion:[(r,a)=>`The ${titleCase(r)} Outfit Formula: Pieces That Work Together`,(r,a)=>`A Wearable Wardrobe: ${titleCase(a)} for Real Life`,(r,a)=>`How to Make Everyday Outfits Look More Considered`],
  kitchen:[(r,a)=>`A Better-Organised Kitchen: ${titleCase(a)} for Everyday Cooking`,(r,a)=>`Kitchen Details That Make Small Spaces Work Harder`,(r,a)=>`The Practical Kitchen Edit: Storage That Looks Good, Too`],
  study:[(r,a)=>`A Study Desk That Helps You Settle In and Focus`,(r,a)=>`The Small Desk Setup: ${titleCase(a)} That Save Space`,(r,a)=>`A Calm, Useful Study Corner: Layout, Light and Storage`],
  travel:[(r,a)=>`The Weekend Travel Edit: ${titleCase(a)} Without Overpacking`,(r,a)=>`A More Thoughtful Carry-On: ${titleCase(a)} for a Short Trip`,(r,a)=>`Small Travel Details That Make the Whole Trip Easier`]
 };
 const out=[];
 for(let i=0;i<count;i++){
  const seed=now+i*37+focus.length*17;
  const actualGenre=genre==="mix"?(room?"home decor":mixGenres[(i+Math.floor(seed/13))%mixGenres.length]):(genre||"home decor");
  const data=topicDetails[actualGenre]||topicDetails["home decor"];
  let subject=focus||actualGenre;
  if(actualGenre==="home decor"&&!focus) subject=roomIdeas[(i+Math.floor(seed/7))%roomIdeas.length];
  if(actualGenre==="home decor"&&room) subject=room;
  const angle=pick(data.angles,seed+i);
  const focusNote=focus?` Creative direction: ${focus}.`:"";
  const mood=pick(data.moods,seed*3+i);
  const product=pick(data.products,seed*5+i);
  const template=pick(patterns[actualGenre]||patterns["home decor"],seed+i);
  const title=template(subject,angle);
  const uniqueTitle=priorTitles.has(title)||out.some(x=>x.title===title)?title.replace(/: /,": A Fresh Take on "):title;
  const finalTitle=uniqueTitle;
  const isProduct=type==="affiliate"||(type==="mix"&&i%4===3);
  const descriptions={
   "home decor":`Give your ${subject} a more finished feel without filling it with more stuff. Start with ${angle.toLowerCase()}, then bring in considered lighting, tactile fabrics and a few pieces with character. The goal is a room that feels lived-in, balanced and unmistakably yours. Save this guide while planning your next ${subject} refresh. Ideas include ${product.toLowerCase()} and other details that work beautifully together.`,
   beauty:`A useful, achievable beauty edit built around ${angle.toLowerCase()}. Keep the routine practical: choose products that suit the way you get ready, give everything a proper place and make the steps easy to repeat. Save this for your next everyday routine or vanity reset. Explore details such as ${product.toLowerCase()}.`,
   fashion:`A wearable style guide built around ${angle.toLowerCase()}. Focus on proportion, repeatable combinations and pieces you can reach for more than once. Use the ideas as a starting point, adapt the palette to your wardrobe and save the combinations you want to try. Consider finishing with ${product.toLowerCase()}.`,
   kitchen:`Make everyday cooking feel easier with ${angle.toLowerCase()}. Give frequently used items a clear home, keep work surfaces practical and choose storage that suits the way you actually cook. Save these ideas for your next kitchen reset, including useful pieces such as ${product.toLowerCase()}.`,
   study:`Create a study space that feels inviting and helps you get started. This guide focuses on ${angle.toLowerCase()}, with practical ways to improve light, clear visual clutter and keep essentials within reach. Save it before rearranging your desk; useful additions can include ${product.toLowerCase()}.`,
   travel:`Make a short trip simpler with ${angle.toLowerCase()}. Plan outfits around pieces that work together, keep essentials easy to reach and leave room for the things you find along the way. Save this checklist before your next getaway. Helpful options include ${product.toLowerCase()}.`
  }[actualGenre];
  const keywords=[subject,actualGenre,mood,angle,product,"Pinterest ideas"].join(", ");
  const tags=[subject,actualGenre,angle].map(x=>"#"+x.toLowerCase().replace(/[^a-z0-9]+/g,"")).join(" ");
  const description=descriptions+(focusNote?focusNote:"")+" "+tags;
  const imagePrompt=`Create a premium vertical 2:3 editorial Pinterest image about ${subject}. Specific subject: ${finalTitle}. Show a believable, detailed ${actualGenre} scene with a clear focal subject, real-world composition, natural light, rich tactile materials and refined magazine art direction. Mood: ${mood}. Supporting angle: ${angle}.${focusNote} Avoid generic collages, icons, clip-art, flowers as decoration, fake packaging, logos, watermarks and illegible text. The scene must visibly communicate the subject, not just a mood word.`;
  out.push({id:now+i,title:finalTitle,trend:mood,genre:actualGenre,board:titleCase(subject)+" Ideas",time:"Not scheduled",score:null,description,seoTitle:finalTitle,alt:finalTitle+" — "+subject+" "+actualGenre+" editorial",keywords,imagePrompt,disclosure:"As an Amazon Associate I earn from qualifying purchases.",pinType:isProduct?"product-led":"inspiration",productName:product,productUrl:"",imageStatus:"graphic-generated",imageUrl:makeGraphic({title:finalTitle,genre:actualGenre,trend:mood,subject}),imageName:"",products:[]});
 }
 return out;
}
function makeGraphic(pin){
 const esc=v=>String(v||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 const colors={"home decor":["#e8d8c2","#64232d","#725b4a"],beauty:["#ead8d1","#783e49","#72535a"],fashion:["#e7d9c7","#54232c","#655044"],kitchen:["#e8dfca","#4d5946","#665d48"],study:["#e8ddca","#514238","#5c4c3e"],travel:["#e9dfcf","#58665f","#665648"]};
 const [paper,wine,ink]=colors[String(pin.genre||"").toLowerCase()]||colors["home decor"];
 const words=String(pin.title||"A considered edit").split(/\\s+/);let lines=[],line="";
 words.forEach(w=>{if((line+" "+w).trim().length>22&&line){lines.push(line);line=w}else line=(line+" "+w).trim()});if(line)lines.push(line);
 const title=lines.slice(0,5).map((t,i)=>`<text x="88" y="${600+i*65}" class="title">${esc(t)}</text>`).join("");
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500">
 <defs>
  <filter id="paperEdge" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".018 .11" numOctaves="2" seed="19" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="17" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id="fiber"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .46 0 0 0 0 .34 0 0 0 0 .23 0 0 0 .10 0"/></filter>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="16"/><feOffset dy="16"/><feComponentTransfer><feFuncA type="linear" slope=".2"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <style>.title{font-family:Georgia,serif;font-size:52px;font-weight:bold;fill:#f8ecdc;letter-spacing:-1px}.small{font:22px Georgia,serif;letter-spacing:4px;fill:#f2dfca}.note{font:italic 28px Georgia,serif;fill:${wine}}</style>
 </defs>
 <rect width="1000" height="1500" fill="#d8c2a8"/>
 <path d="M38 105L960 82 940 1384 60 1407Z" fill="#b99c7d" opacity=".48" filter="url(#shadow)"/>
 <path d="M55 90L946 112 920 1390 72 1368Z" fill="${paper}" filter="url(#paperEdge)"/>
 <path d="M55 90L946 112 920 1390 72 1368Z" fill="${paper}" filter="url(#fiber)" opacity=".18"/>
 <path d="M72 210Q118 193 162 207T252 205T344 209T436 204T528 210T620 204T712 208T804 204T920 210L910 242Q860 231 812 241T716 239T620 244T524 239T428 244T332 240T236 244T140 240T76 248Z" fill="${wine}" filter="url(#paperEdge)"/>
 <g transform="rotate(-2 500 710)" filter="url(#shadow)">
  <path d="M92 370Q150 355 210 365T330 360T450 366T570 360T690 367T810 360T912 370L900 1110Q840 1100 780 1110T660 1106T540 1112T420 1107T300 1112T180 1106T100 1115Z" fill="${wine}" filter="url(#paperEdge)"/>
  <text x="90" y="470" class="small">A ROOM-BY-ROOM EDIT</text>
  ${title}
  <text x="90" y="1010" class="note" fill="#f5e6d5">${esc(pin.trend||"considered details")}</text>
 </g>
 <path d="M130 330L360 330 350 385 120 385Z" fill="#e4cba8" opacity=".85" transform="rotate(-4 240 350)"/>
 <g transform="translate(630 1140) rotate(3)" filter="url(#shadow)"><path d="M0 0L230 8 215 220 8 210Z" fill="#fff8ed"/><path d="M16 18L212 26 198 194 20 188Z" fill="#dfcbb2"/><path d="M30 150L85 92 124 132 162 76 190 154Z" fill="#a98d72"/><path d="M30 150L85 92 124 132 162 76 190 154Z" fill="${ink}" opacity=".35"/><text x="27" y="178" font-family="Georgia" font-size="16" fill="${wine}">FIELD NOTES</text></g>
 <path d="M110 1285Q220 1275 330 1288T550 1285T770 1290T900 1282L895 1350Q790 1340 680 1350T460 1344T240 1350T105 1342Z" fill="${paper}" filter="url(#paperEdge)"/>
 <text x="130" y="1330" font-family="Georgia,serif" font-size="25" letter-spacing="7" fill="${wine}">PINVORA  /  SAVE FOR LATER</text>
 </svg>`;
 return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}
function addAmazonTag(url,tag){try{const u=new URL(url);if(!/amazon\.com$/i.test(u.hostname.replace(/^www\./,""))&&!/amazon\.com$/i.test(u.hostname))return url;if(tag)u.searchParams.set("tag",tag);return u.toString()}catch{return url}}
function readSavedState(){try{return JSON.parse(localStorage.getItem("pinvora_workspace_v1")||"{}")}catch{return {}}}
function App(){
 const [initial]=useState(readSavedState);
 const [prompt,setPrompt]=useState(initial.prompt||""),[pins,setPins]=useState(Array.isArray(initial.pins)?initial.pins:[]),[tab,setTab]=useState("home"),[count,setCount]=useState(10),[campaignType,setCampaignType]=useState("mix"),[genre,setGenre]=useState(initial.genre||"home decor"),[associateTag,setAssociateTag]=useState(initial.associateTag||"");
 const [selected,setSelected]=useState(initial.selected||{}),[open,setOpen]=useState({}),[status,setStatus]=useState("Your ideas are saved on this device."),[recentTitles,setRecentTitles]=useState(Array.isArray(initial.recentTitles)?initial.recentTitles:[]);
 const [pinterestBoards,setPinterestBoards]=useState([]),[pinterestStatus,setPinterestStatus]=useState("Checking connection…"),[pinterestConnected,setPinterestConnected]=useState(false);
 useEffect(()=>{let active=true;fetch("/api/pinterest/status").then(r=>r.json()).then(d=>{if(!active)return;setPinterestConnected(Boolean(d.connected));setPinterestStatus(d.connected?"Pinterest is connected. Load your boards below.":"Pinterest is not connected yet.");}).catch(()=>{if(active)setPinterestStatus("Could not verify Pinterest connection.");});return()=>{active=false}},[]);
 useEffect(()=>{try{localStorage.setItem("pinvora_workspace_v1",JSON.stringify({prompt,pins,selected,recentTitles,associateTag,genre}))}catch{setStatus("Storage is full. Remove a large uploaded image to continue saving.")}},[prompt,pins,selected,recentTitles,associateTag,genre]);
 const chosen=pins.filter(p=>selected[p.id]);
 function generate(){const selectedGenre=genre==="mix"?"mix":genre;if(!prompt.trim()&&!selectedGenre){setStatus("Choose a genre first.");return}const campaignTopic=prompt.trim()||selectedGenre;const out=makePins(campaignTopic,count,campaignType,recentTitles.concat(pins.map(p=>({title:p.title,genre:p.genre,pinType:p.pinType}))),selectedGenre);setRecentTitles(prev=>[...out.map(p=>p.title),...prev].slice(0,80));setPins(out);setSelected(Object.fromEntries(out.map(p=>[p.id,true])));setTab("review");setStatus("Your campaign drafts are ready. Review titles, descriptions and product links.");}
 function toggle(id){setSelected(s=>({...s,[id]:!s[id]}))}
 function uploadImage(id,file){if(!file)return;if(!file.type.startsWith("image/")){setStatus("Please choose an image file.");return}if(file.size>8*1024*1024){setStatus("Choose an image under 8 MB.");return}const reader=new FileReader();reader.onload=()=>setPins(ps=>ps.map(p=>p.id===id?{...p,imageUrl:String(reader.result),imageName:file.name,imageStatus:"uploaded"}:p));reader.onerror=()=>setStatus("Image could not be read. Please try another file.");reader.readAsDataURL(file)}
 const goCreate=()=>setTab("create");
 return <div className="app">
  <header className="topbar refHeader">
   <button className="refBrand" onClick={()=>setTab("home")} aria-label="PINVORA home"><svg className="cherryMark" viewBox="0 0 76 76" aria-hidden="true"><path d="M34 54C35 34 47 19 61 12M38 43C27 32 17 26 11 20" fill="none" stroke="#d7b78e" strokeWidth="2.2" strokeLinecap="round"/><path d="M50 22C53 12 64 9 68 12C66 22 58 26 50 22ZM23 34C11 34 6 26 8 20C19 20 25 25 23 34Z" fill="#9b6d50"/><path d="M15 19C5 10 12 1 21 6C30 10 25 20 15 19ZM27 30C17 22 24 12 33 17C42 22 37 32 27 30ZM56 13C49 3 58 -2 66 4C73 10 65 17 56 13Z" fill="#a9434b"/></svg><span><b>PINVORA</b><i>Plan · Create · Post · Grow</i></span></button>
   <nav className="refTopNav">{[["home","⌂","Home"],["create","✧","Create"],["schedule","▦","Schedule"],["analytics","▥","Insights"]].map(([id,ic,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><span>{ic}</span>{label}</button>)}</nav>
   <div className="refHeaderActions"><button aria-label="Notifications" onClick={()=>setStatus("You’re all caught up.")}>♧</button><div className="refAvatar">R</div></div>
  </header>
  <main>
   {tab==="home"&&<section className="homeScreen refHome">
    <div className="refHero"><div className="refHeroTorn"><div className="refClip"></div><div className="refHeroCopy"><h1>Small Pins,<br/><em>Big Dreams ♡</em></h1><div className="refHeroRibbon">✧ Your Pinterest Studio ✧</div></div><div className="refPressedFlowers" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="refTape"/></div>
     <aside className="refMonthNote"><span>This Month</span><strong>{pins.length||10}</strong><b>Pins in Progress</b><i>✧</i></aside></div>
    <div className="refActionCards"><button className="refActionPrimary" onClick={goCreate}><span className="refActionIcon">＋</span><span><b>Create a Campaign</b><small>Turn an idea into a Pin</small></span><i>⌁</i></button><button onClick={()=>setTab("review")}><span className="refActionIcon">▧</span><span><b>Pin Library</b><small>Your saved images &amp; drafts</small></span></button><button onClick={()=>setTab("schedule")}><span className="refActionIcon">▦</span><span><b>Posting Plan</b><small>Schedule &amp; stay consistent</small></span></button></div>
    <div className="refWorkspaceTabs"><button className="selected" onClick={goCreate}>✧ &nbsp;Generate</button><button onClick={()=>setTab("review")}>／ &nbsp;Review ({pins.length})</button><button onClick={()=>setTab("schedule")}>▦ &nbsp;Schedule</button></div>
    <section className="refApproval"><div className="refApprovalSeal">⌖</div><div className="refApprovalPaper"><h2>Final Approval Gate</h2><p>Every Pin deserves a final look before it goes out into the world.</p><div className="refApprovalStats"><span><b>{pins.length}</b> Drafts created</span><span><b>{chosen.length}</b> Selected for posting</span></div><button onClick={()=>setTab(pins.length?"review":"create")}>{pins.length?"Review your Pins":"Create your first campaign"} →</button></div></section>
    {pins.length>0&&<button className="resumeBtn" onClick={()=>setTab("review")}>Continue your campaign · {pins.length} pins →</button>}
   </section>}
   {tab==="create"&&<section className="workScreen">
    <div className="sectionHeading"><h1>Make your Pins</h1><p>Start with one topic. Get fresh draft ideas to edit and make your own.</p></div>
    <div className="paperCard createCard"><label className="fieldLabel">Choose a genre</label><div className="genreChoices">{[["home decor","Home decor"],["beauty","Beauty"],["fashion","Fashion"],["kitchen","Kitchen"],["study","Study"],["travel","Travel"],["mix","Mix — choose the best fit"]].map(([id,label])=><button type="button" key={id} className={genre===id?"chosenGenre":""} onClick={()=>setGenre(id)}>{label}</button>)}</div><label className="fieldLabel">Optional campaign focus</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Add a specific angle, audience, season or style (optional)" maxLength={200}/><div className="counter">{prompt.length} / 200</div>
     <label className="fieldLabel">Campaign format</label><div className="typeChoices">{[["mix","Smart mix"],["inspiration","Inspiration"],["affiliate","Product-led"]].map(([id,label])=><button type="button" className={campaignType===id?"chosenCount":""} onClick={()=>setCampaignType(id)} key={id}>{label}</button>)}</div><label className="fieldLabel">Number of Pins</label><div className="countChoices">{[5,10,15].map(n=><button className={count===n?"chosenCount":""} onClick={()=>setCount(n)} key={n}>{n}</button>)}</div>
     <button className="wineBtn generateBtn" onClick={generate}>Make my Pins</button><p className="helperText">{status} Graphics are generated as editable starter artwork. Product photography and live trend/product research are not connected yet.</p>
    </div>
   </section>}
   {tab==="review"&&<section className="workScreen"><div className="sectionHeading"><h1>Your Pin Library</h1><p>Review each idea, add your image and approve what you love.</p></div>
    {!pins.length?<div className="paperCard emptyState"><h2>Your scrapbook is waiting</h2><p>Create your first campaign to see your Pins here.</p><button className="wineBtn" onClick={goCreate}>Create Pins →</button></div>:<><div className="reviewBar"><span>{chosen.length} of {pins.length} selected</span><button onClick={()=>setTab("schedule")}>Next: Schedule →</button></div><div className="pinGrid">{pins.map((p,i)=><article className="pinCard" key={p.id}><div className="pinVisual">{p.imageUrl?<img src={p.imageUrl} alt={p.alt}/>:<div className="imagePlaceholder"><span>2:3 PIN</span><b>{p.title}</b><small>Artwork preview unavailable</small></div>}<label className="uploadBtn">{p.imageUrl?"Replace image":"Upload image"}<input type="file" accept="image/*" onChange={e=>{uploadImage(p.id,e.target.files?.[0]);e.target.value=""}}/></label></div><div className="pinInfo"><div className="pinMeta"><span>PIN {String(i+1).padStart(2,"0")}</span><label><input type="checkbox" checked={!!selected[p.id]} onChange={()=>toggle(p.id)}/> Select</label></div><label className="fieldLabel">Title</label><input className="editField" value={p.title} maxLength={100} onChange={e=>setPins(ps=>ps.map(x=>x.id===p.id?{...x,title:e.target.value,seoTitle:e.target.value}:x))}/><label className="fieldLabel">Description</label><textarea className="editField editDescription" value={p.description} maxLength={500} onChange={e=>setPins(ps=>ps.map(x=>x.id===p.id?{...x,description:e.target.value}:x))}/><div className="pinBoard">{p.pinType==="affiliate"?"Affiliate":p.pinType==="product-led"?"Product-led · link needed":"Inspiration"} · {p.trend}</div><label className="fieldLabel">Image prompt</label><textarea className="editField editDescription" value={p.imagePrompt||""} onChange={e=>setPins(ps=>ps.map(x=>x.id===p.id?{...x,imagePrompt:e.target.value}:x))}/><button className="wineBtn" type="button" onClick={()=>setPins(ps=>ps.map(x=>x.id===p.id?{...x,imageUrl:makeGraphic(x),imageStatus:"graphic-generated"}:x))}>Create pin graphic</button><label className="fieldLabel">Product idea</label><p className="productHint">{p.productName}</p><label className="fieldLabel">Amazon product link (US)</label><input className="editField" placeholder="Paste your Amazon.com product URL" value={p.productUrl||""} onChange={e=>setPins(ps=>ps.map(x=>x.id===p.id?{...x,productUrl:e.target.value}:x))} onBlur={()=>setPins(ps=>ps.map(x=>x.id===p.id?{...x,productUrl:addAmazonTag(x.productUrl,associateTag),pinType:x.productUrl?"affiliate":x.pinType}:x))}/><p className="affiliateDisclosure">{p.productUrl?p.disclosure:"Disclosure appears automatically when an affiliate product link is added."}</p></div></article>)}</div></>}
   </section>}
   {tab==="schedule"&&<section className="workScreen"><div className="sectionHeading"><h1>Schedule Pins</h1><p>Plan and organise your Pinterest content.</p></div><div className="scheduleTabs"><span className="selected">Draft queue</span></div><div className="paperCard queueCard"><div className="queueTitle"><h2>Upcoming Pins</h2><span>{chosen.length}</span></div>{chosen.length?chosen.map((p,i)=><div className="queueItem" key={p.id}><div className="queueThumb">{p.imageUrl?<img src={p.imageUrl} alt=""/> :""}</div><div><b>{p.title}</b><small>▦ {p.time} · Draft</small></div><button onClick={()=>setTab("review")} aria-label="Edit pin">⋮</button></div>):<div className="emptyState"><p>Your schedule is empty. Create and select Pins to see them here.</p><button className="wineBtn" onClick={goCreate}>Create Pins →</button></div>}<button className="wineBtn scheduleAction" onClick={()=>setStatus("Your selected Pins are saved as local drafts on this device.")}>Save schedule draft</button><p className="helperText">{status} Publishing is not connected, so nothing is posted automatically.</p></div></section>}
   {tab==="analytics"&&<section className="workScreen"><div className="sectionHeading"><h1>Campaign overview</h1><p>See what you have prepared so far.</p></div><div className="paperCard settingsCard"><h2>Pinterest account</h2><p>Connect your Pinterest account to load your boards. Pins will only publish after you choose a board and approve the content.</p>{!pinterestConnected&&<a className="wineBtn" href="/api/pinterest/auth">Connect Pinterest</a>}{pinterestConnected&&<p className="helperText">✓ Pinterest account connected</p>}<button className="wineBtn" type="button" onClick={async()=>{setPinterestStatus("Checking connection and loading boards…");try{const r=await fetch("/api/pinterest/boards");const d=await r.json();if(!r.ok)throw new Error(d.error||"Connection check failed");setPinterestConnected(true);setPinterestBoards(d.items||[]);setPinterestStatus("Connected · "+(d.items||[]).length+" boards loaded.");}catch(e){setPinterestConnected(false);setPinterestStatus(e.message||"Pinterest is not connected yet.");}}}>Check connection &amp; load boards</button><p className="helperText">{pinterestStatus}</p>{pinterestBoards.length>0&&<label className="fieldLabel">Your boards: {pinterestBoards.map(b=>b.name).join(" · ")}</label>}</div><div className="paperCard settingsCard"><h2>Amazon Associates (United States)</h2><p>Add your Amazon.com tracking ID. Pinvora will append it to Amazon product links you provide.</p><label className="fieldLabel">Tracking ID</label><input className="editField" placeholder="yourstore-20" value={associateTag} onChange={e=>setAssociateTag(e.target.value.trim())}/><p className="helperText">Your tracking ID is saved only in this browser. When you paste an Amazon.com product URL into a Pin, Pinvora can add this tag. Automatic product search is not connected.</p><button className="wineBtn" onClick={()=>setStatus("Amazon Associates tracking ID saved on this device.")}>Save tracking ID</button><p className="helperText">{status}</p></div></section>}
   {tab==="saved"&&<section className="workScreen"><div className="sectionHeading"><h1>Saved Pins</h1><p>Your selected draft ideas.</p></div>{chosen.length?<div className="pinGrid">{chosen.map(p=><article className="pinCard savedCard" key={p.id}><div className="pinVisual">{p.imageUrl?<img src={p.imageUrl} alt={p.alt}/>:<div className="imagePlaceholder"></div>}</div><div className="pinInfo"><h2>{p.title}</h2><p>{p.board}</p></div></article>)}</div>:<div className="paperCard emptyState"><h2>Nothing saved just yet</h2><p>Select your favourite Pins in the library and they’ll appear here.</p><button className="wineBtn" onClick={()=>setTab("review")}>Open Pin Library →</button></div>}</section>}
  </main>
  <nav className="bottomNav">{[["home","⌂","Home"],["create","+","Create"],["schedule","▦","Schedule"],["review","▤","Library"],["analytics","○","Profile"]].map(([id,icon,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><span>{icon}</span><small>{label}</small></button>)}</nav>
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);
if("serviceWorker" in navigator&&import.meta.env.PROD){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}))}
