import { Router } from 'express';
import axios from 'axios';
import { demoRisks } from '../data/demo.js';
import { getRecommendation } from '../services/gemini.js';
const router=Router();

const localPredict=({rainfall=65,temperature=34,aqi=98,waterLevel=2.7})=>({
  floodRisk:Math.min(100,Math.max(2,rainfall*.65+waterLevel*10)),
  heatwaveRisk:Math.min(100,Math.max(3,(temperature-20)*4.2)),
  stormRisk:Math.min(100,Math.max(4,rainfall*.48+waterLevel*5)),
  airQualityRisk:Math.min(100,Math.max(2,aqi*.55))
});
async function predict(input){try{return (await axios.post(`${process.env.ML_SERVICE_URL||'http://localhost:5001'}/predict`,input,{timeout:2500})).data;}catch{return localPredict(input);}}
router.get('/current',async(_req,res)=>{const weather={rainfall:72,temperature:35,aqi:64,waterLevel:2.5};res.json({...demoRisks,...await predict(weather),updatedAt:new Date().toISOString()});});
router.post('/predict',async(req,res,next)=>{try{const risks=await predict(req.body);res.json({...risks,recommendation:await getRecommendation(risks)});}catch(e){next(e);}});
export default router;

