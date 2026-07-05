export const demoIncidents = [
  ['Flooding','Water rising near Gomti Nagar underpass',26.8467,80.9462,'High','In Progress'],
  ['Road Blockage','Debris blocking one lane on Hazratganj Road',26.8526,80.9466,'Medium','Pending'],
  ['Power Outage','Local transformer failure reported',26.8756,80.9115,'Low','Resolved'],
  ['Fallen Tree','Large tree obstructing residential lane',26.8282,80.9220,'Medium','Pending'],
  ['Fire','Smoke visible from warehouse roof',26.8890,80.9930,'High','In Progress'],
  ['Flooding','Knee-deep water after heavy rainfall',26.7950,80.9400,'High','Pending'],
  ['Road Blockage','Waterlogging slowing traffic',26.8700,80.9700,'Medium','Resolved'],
  ['Power Outage','Multiple blocks without electricity',26.9100,80.9500,'Low','Pending'],
  ['Other','Damaged streetlight leaning over road',26.8400,80.8800,'Low','Resolved'],
  ['Fallen Tree','Branches down after strong winds',26.8200,80.9900,'Medium','Pending']
].map(([type,description,lat,lng,severity,status],i)=>({
  _id:`demo-${i+1}`, type, description, location:{lat,lng,address:`Ward ${i%5+1}, Lucknow`},
  aiAnalysis:{detected:type,severity,suggested_action:'Avoid the affected area and follow local authority guidance.'},
  status, createdAt:new Date(Date.now()-i*37*60*1000).toISOString()
}));

export const demoAlerts = [
  { _id:'alert-1', title:'Flood watch: Gomti basin', message:'Heavy rainfall may cause waterlogging in low-lying areas this evening.', severity:'High', recommendations:['Avoid underpasses','Move valuables above ground level','Keep emergency contacts ready'], createdAt:new Date().toISOString() },
  { _id:'alert-2', title:'Heat advisory', message:'High afternoon temperatures expected through tomorrow.', severity:'Medium', recommendations:['Hydrate frequently','Avoid outdoor work from 12–4 PM'], createdAt:new Date(Date.now()-3600000).toISOString() },
  { _id:'alert-3', title:'Air quality update', message:'Air quality is moderate. Sensitive groups should limit prolonged exertion.', severity:'Low', recommendations:['Wear a mask near traffic','Keep windows closed during peak hours'], createdAt:new Date(Date.now()-7200000).toISOString() }
];

export const demoRisks = { floodRisk:72, heatwaveRisk:46, stormRisk:38, airQualityRisk:29, updatedAt:new Date().toISOString() };

