import { getSession } from "./_session.js";
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store");res.setHeader("X-Content-Type-Options","nosniff");
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 const session=getSession(req);
 return res.status(200).json({connected:Boolean(session),profile:session?{name:session.name}:null,scope:"identity-only",associatesDashboardAccess:false});
}
