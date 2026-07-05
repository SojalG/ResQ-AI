import 'dotenv/config';
import mongoose from 'mongoose';
import Incident from '../server/models/Incident.js';
import Alert from '../server/models/Alert.js';
import ChatSession from '../server/models/ChatSession.js';
import { demoIncidents, demoAlerts } from '../server/data/demo.js';

if(!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI before seeding.');
await mongoose.connect(process.env.MONGODB_URI);
await Promise.all([Incident.deleteMany({}),Alert.deleteMany({}),ChatSession.deleteMany({})]);
await Incident.insertMany(demoIncidents.map(({_id,...x})=>x));
await Alert.insertMany(demoAlerts.map(({_id,...x})=>x));
await ChatSession.insertMany(Array.from({length:5},(_,i)=>({sessionId:`seed-${i+1}`,title:['Flood readiness','Family emergency plan','Heat safety','Nearest shelters','Storm checklist'][i],lang:'en',messages:[{role:'user',content:'How should I prepare?',timestamp:new Date()},{role:'assistant',content:'Start with a family plan, emergency kit, and local alerts.',timestamp:new Date()}]})));
console.log('Seeded 10 incidents, 3 alerts, and 5 chat sessions.');
await mongoose.disconnect();

