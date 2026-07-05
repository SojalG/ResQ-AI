import axios from 'axios';
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'/api',timeout:15000});
export const getPosition=()=>new Promise(resolve=>{if(!navigator.geolocation)return resolve({lat:26.8467,lng:80.9462});navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lng:p.coords.longitude}),()=>resolve({lat:26.8467,lng:80.9462}),{timeout:6000});});
export const formatAgo=(date)=>{const mins=Math.max(1,Math.round((Date.now()-new Date(date))/60000));if(mins<60)return `${mins}m ago`;if(mins<1440)return `${Math.floor(mins/60)}h ago`;return `${Math.floor(mins/1440)}d ago`;};

