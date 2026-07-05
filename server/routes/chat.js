import { Router } from 'express';
import { nanoid } from 'nanoid';
import { chatWithGemini } from '../services/gemini.js';
import { store } from '../services/store.js';
const router=Router();
router.get('/sessions',async(_req,res,next)=>{try{res.json(await store.chats());}catch(e){next(e);}});
router.post('/',async(req,res,next)=>{try{const {messages=[],lang='en',contextData={},sessionId=nanoid()}=req.body;if(!messages.length)return res.status(400).json({error:'At least one message is required'});const reply=await chatWithGemini(messages,lang,contextData);const full=[...messages,{role:'assistant',content:reply,timestamp:new Date().toISOString()}];await store.saveChat(sessionId,full,lang);res.json({reply,sessionId});}catch(e){next(e);}});
export default router;

