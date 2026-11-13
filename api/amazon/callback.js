import { readCookie,makeSession,sessionCookie,safeEqual } from "./_session.js";
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store");res.setHeader("X-Content-Type-Options","nosniff");
 if(req.method!=="GET")return res.status(405).send("Method not allowed");
 const state=typeof req.query.state==="string"?req.query.state:"";
 const saved=readCookie(req,"pinvora_amazon_state");
 res.setHeader("Set-Cookie","pinvora_amazon_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"+(req.headers["x-forwarded-proto"]==="https"||!String(req.headers.host||"").includes("localhost")?"; Secure":""));
 if(req.query.error)return res.redirect(302,"/?amazon=denied");
 if(!safeEqual(state,saved))return res.status(400).send("Amazon sign-in state could not be verified. Please reconnect.");
 const {AMAZON_LWA_CLIENT_ID,AMAZON_LWA_CLIENT_SECRET,AMAZON_LWA_REDIRECT_URI}=process.env;
 if(!AMAZON_LWA_CLIENT_ID||!AMAZON_LWA_CLIENT_SECRET||!AMAZON_LWA_REDIRECT_URI)return res.status(503).send("Amazon sign-in configuration is incomplete.");
 try{
  const tokenResponse=await fetch("https://api.amazon.com/auth/o2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Accept":"application/json"},body:new URLSearchParams({grant_type:"authorization_code",code:String(req.query.code||""),client_id:AMAZON_LWA_CLIENT_ID,client_secret:AMAZON_LWA_CLIENT_SECRET,redirect_uri:AMAZON_LWA_REDIRECT_URI})});
  const token=await tokenResponse.json();
  if(!tokenResponse.ok||!token.access_token)return res.status(502).send("Amazon did not complete sign-in. Check the Login with Amazon app settings and redirect URL.");
  const profileResponse=await fetch("https://api.amazon.com/user/profile",{headers:{Authorization:"Bearer "+token.access_token,Accept:"application/json"}});
  const profile=await profileResponse.json();
  if(!profileResponse.ok||!profile.user_id)return res.status(502).send("Amazon identity could not be verified.");
  const session=makeSession({user_id:profile.user_id,name:profile.name,email:profile.email});
  res.setHeader("Set-Cookie",sessionCookie(session,req));
  return res.redirect(302,"/?amazon=connected");
 }catch{return res.status(502).send("Could not complete Amazon sign-in. Please try again.");}
}
