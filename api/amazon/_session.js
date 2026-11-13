import { createHmac, timingSafeEqual } from "node:crypto";
const cookieName = "pinvora_amazon_identity";
function secret(){const value=process.env.AMAZON_SESSION_SECRET||"";if(value.length<32)throw new Error("AMAZON_SESSION_SECRET must contain at least 32 characters");return value}
export function readCookie(req,name){const raw=req.headers.cookie||"";const match=raw.match(new RegExp("(?:^|;\\s*)"+name+"=([^;]*)"));return match?decodeURIComponent(match[1]):null}
function sign(value){return createHmac("sha256",secret()).update(value).digest("base64url")}
export function makeSession(profile){const payload=Buffer.from(JSON.stringify({sub:profile.user_id,name:profile.name||"",email:profile.email||"",exp:Date.now()+30*24*60*60*1000})).toString("base64url");return payload+"."+sign(payload)}
export function getSession(req){try{const token=readCookie(req,cookieName);if(!token)return null;const [payload,signature]=token.split(".");if(!payload||!signature)return null;const expected=sign(payload);const a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return null;const data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));if(!data.sub||!Number.isFinite(data.exp)||data.exp<Date.now())return null;return {userId:data.sub,name:data.name||"",email:data.email||""}}catch{return null}}
export function sessionCookie(value,req,maxAge=2592000){const secure=req.headers["x-forwarded-proto"]==="https"||!String(req.headers.host||"").includes("localhost");return cookieName+"="+encodeURIComponent(value)+"; HttpOnly; SameSite=Lax; Path=/; Max-Age="+maxAge+(secure?"; Secure":"")}
export function clearSessionCookie(req){return sessionCookie("",req,0)}
export function randomState(){return createHmac("sha256",secret()).update(String(Date.now())+Math.random()).digest("hex")}
export function safeEqual(a,b){if(typeof a!=="string"||typeof b!=="string")return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
