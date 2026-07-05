import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { store } from '../services/store.js';
import { analyzeImage } from '../services/gemini.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits:{fileSize:5*1024*1024}, fileFilter:(_req,file,cb)=>cb(null,['image/jpeg','image/png'].includes(file.mimetype)) });

router.get('/', async (req,res,next)=>{ try {
  const filter={}; if(req.query.type)filter.type=req.query.type;if(req.query.severity)filter['aiAnalysis.severity']=req.query.severity;
  res.json(await store.incidents(filter,Math.min(Number(req.query.limit)||50,200)));
} catch(e){next(e);} });

router.post('/', upload.single('image'), async (req,res,next)=>{ try {
  const body = req.body || {};
  const location = typeof body.location==='string' ? JSON.parse(body.location) : {lat:Number(body.lat)||26.8467,lng:Number(body.lng)||80.9462,address:body.address};
  let aiAnalysis = body.aiAnalysis ? JSON.parse(body.aiAnalysis) : {detected:body.type||'SOS',severity:body.severity||'Medium',suggested_action:'Avoid the area and follow authority guidance.'};
  let imageUrl='';
  if(req.file){
    aiAnalysis=await analyzeImage(req.file.buffer,req.file.mimetype,body.type);
    fs.mkdirSync(path.resolve('uploads'),{recursive:true});
    const ext=req.file.mimetype==='image/png'?'.png':'.jpg'; const name=`${Date.now()}${ext}`;
    fs.writeFileSync(path.resolve('uploads',name),req.file.buffer); imageUrl=`/uploads/${name}`;
  }
  const item=await store.createIncident({type:body.type||'SOS',description:body.description||'Emergency SOS triggered by user',location,imageUrl,aiAnalysis,contactNumber:body.contactNumber,status:'Pending'});
  res.status(201).json(item);
} catch(e){next(e);} });

router.patch('/:id/status', async(req,res,next)=>{try{const item=await store.updateIncident(req.params.id,req.body.status);if(!item)return res.status(404).json({error:'Incident not found'});res.json(item);}catch(e){next(e);}});
router.delete('/:id', async(req,res,next)=>{try{await store.deleteIncident(req.params.id);res.status(204).end();}catch(e){next(e);}});
export default router;

