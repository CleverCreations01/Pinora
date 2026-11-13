import { randomBytes } from "node:crypto";
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="GET")return res.status(405).send("Method not allowed");
 const {AMAZON_LWA_CLIENT_ID,AMAZON_LWA_REDIRECT_URI,AMAZON_SESSION_SECRET}=process.env;
 if(!AMAZON_LWA_CLIENT_ID||!AMAZON_LWA_REDIRECT_URI||!AMAZON_SESSION_SECRET||AMAZON_SESSION_SECRET.length<32)return res.status(503).send("Amazon sign-in is not configured. Add AMAZON_LWA_CLIENT_ID, AMAZON_LWA_CLIENT_SECRET, AMAZON_LWA_REDIRECT_URI and AMAZON_SESSION_SECRET in Vercel.");
 const state=randomBytes(32).toString("hex");
 const secure=req.headers["x-forwarded-proto"]==="https"||!String(req.headers.host||"").includes("localhost");
 res.setHeader("Set-Cookie","pinvora_amazon_state="+state+"; HttpOnly; SameSite=Lax; Path=/; Max-Age=600"+(secure?"; Secure":""));
 const url=new URL("https://www.amazon.com/ap/oa");
 url.searchParams.set("client_id",AMAZON_LWA_CLIENT_ID);
 url.searchParams.set("scope","profile");
 url.searchParams.set("response_type","code");
 url.searchParams.set("redirect_uri",AMAZON_LWA_REDIRECT_URI);
 url.searchParams.set("state",state);
 return res.redirect(302,url.toString());
}
