import { useMemo,useState } from 'react';
import { GoogleMap,HeatmapLayerF,InfoWindowF,MarkerF,useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
const center={lat:26.8467,lng:80.9462};
const mapLibraries=['visualization'];
export default function MapPanel({incidents=[],height=390,pickable=false,position,onPick}){
 const key=import.meta.env.VITE_GOOGLE_MAPS_KEY;const {isLoaded}=useJsApiLoader({id:'resq-map',googleMapsApiKey:key||'none',libraries:mapLibraries});const [active,setActive]=useState(null);
 const points=useMemo(()=>isLoaded&&key?incidents.map(i=>new google.maps.LatLng(i.location.lat,i.location.lng)):[],[isLoaded,key,incidents]);
 if(key&&isLoaded)return <GoogleMap mapContainerStyle={{width:'100%',height}} center={position||center} zoom={12} options={{disableDefaultUI:true,zoomControl:true,styles:[{featureType:'poi',stylers:[{visibility:'off'}]}]}} onClick={e=>pickable&&onPick?.({lat:e.latLng.lat(),lng:e.latLng.lng()})}>
   {!!points.length&&<HeatmapLayerF data={points} options={{radius:32,opacity:.55}}/>}{incidents.map(i=><MarkerF key={i._id} position={i.location} onClick={()=>setActive(i)}/>)}{position&&pickable&&<MarkerF position={position}/>} {active&&<InfoWindowF position={active.location} onCloseClick={()=>setActive(null)}><div className="max-w-[220px] p-1"><b>{active.type}</b><p className="mt-1 text-xs">{active.description}</p></div></InfoWindowF>}
 </GoogleMap>;
 const pins=incidents.slice(0,10);return <div className="map-grid relative overflow-hidden" style={{height}} onClick={e=>{if(!pickable)return;const r=e.currentTarget.getBoundingClientRect();onPick?.({lat:26.9-(e.clientY-r.top)/r.height*.12,lng:80.88+(e.clientX-r.left)/r.width*.15})}}>
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,rgba(255,255,255,.65),transparent_38%)]"/><div className="absolute left-[12%] top-0 h-full w-3 rotate-12 bg-white/70"/><div className="absolute left-0 top-[52%] h-3 w-full -rotate-3 bg-white/80"/>
  {pins.map((i,n)=><button key={i._id} title={i.description} className="absolute -translate-x-1/2 -translate-y-1/2" style={{left:`${16+(n*29)%72}%`,top:`${20+(n*37)%65}%`}} onClick={e=>{e.stopPropagation();setActive(i)}}><span className={`block rounded-full p-2 shadow-lg ${i.aiAnalysis?.severity==='High'?'bg-red-500':'bg-teal-700'} text-white`}><MapPin size={14}/></span></button>)}
  {pickable&&position&&<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-red-500"><MapPin size={34} fill="currentColor"/></div>}
  <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-[11px] font-bold text-slate-600 shadow">{key?'Loading map…':'Interactive demo map · add a Maps key for live tiles'}</span>{active&&<div className="absolute right-3 top-3 max-w-[240px] rounded-xl bg-white p-3 text-xs shadow-xl"><b>{active.type}</b><p className="mt-1 text-slate-600">{active.description}</p><button className="mt-2 font-bold text-teal-700" onClick={()=>setActive(null)}>Close</button></div>}
 </div>
}
