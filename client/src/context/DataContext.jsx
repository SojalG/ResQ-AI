import { createContext,useContext,useEffect,useState } from 'react';
import { api } from '../api';
const DataContext=createContext();
export function DataProvider({children}){
 const [risks,setRisks]=useState(null),[alerts,setAlerts]=useState([]),[incidents,setIncidents]=useState([]),[loading,setLoading]=useState(true);
 const refresh=async()=>{try{const [r,a,i]=await Promise.all([api.get('/risk/current'),api.get('/alerts'),api.get('/incidents?limit=50')]);setRisks(r.data);setAlerts(a.data);setIncidents(i.data);}finally{setLoading(false)}};
 useEffect(()=>{refresh();const timer=setInterval(async()=>{try{setAlerts((await api.get('/alerts')).data)}catch{}},60000);return()=>clearInterval(timer)},[]);
 return <DataContext.Provider value={{risks,alerts,incidents,loading,refresh,setAlerts,setIncidents}}>{children}</DataContext.Provider>
}
export const useData=()=>useContext(DataContext);

