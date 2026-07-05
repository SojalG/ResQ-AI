import { Router } from 'express';
import { store } from '../services/store.js';
const router=Router();
router.get('/',async(_req,res,next)=>{try{res.json(await store.alerts());}catch(e){next(e);}});
router.post('/',async(req,res,next)=>{try{const {title,message,severity,recommendations=[]}=req.body;if(!title||!message)return res.status(400).json({error:'Title and message are required'});res.status(201).json(await store.createAlert({title,message,severity,recommendations}));}catch(e){next(e);}});
router.delete('/:id',async(req,res,next)=>{try{await store.deleteAlert(req.params.id);res.status(204).end();}catch(e){next(e);}});
export default router;

