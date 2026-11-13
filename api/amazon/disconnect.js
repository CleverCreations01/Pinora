import { clearSessionCookie } from "./_session.js";
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store");res.setHeader("X-Content-Type-Options","nosniff");
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 res.setHeader("Set-Cookie",clearSessionCookie(req));
 return res.status(200).json({disconnected:true});
}
