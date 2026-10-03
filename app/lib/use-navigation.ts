import {useEffect,useState} from 'react';
import type {GridexApiClient} from './gridex-api';
type Result=Awaited<ReturnType<GridexApiClient['navigation']>>;
export function useNavigation(api:GridexApiClient,realm:string,subject:string,enabled:boolean){
  const key=realm+':'+subject;
  const [state,setState]=useState<{key:string;result:Result|null;error:boolean}>({key:'',result:null,error:false});
  useEffect(()=>{
    if(!enabled)return;
    const abort=new AbortController();
    let inFlight=false;
    async function refresh(){
      if(inFlight)return;
      inFlight=true;
      try{
        const result=await api.navigation(abort.signal);
        if(result.realm!==realm||result.subject!==subject)throw new Error('identity mismatch');
        if(!abort.signal.aborted)setState({key,result,error:false});
      }catch{if(!abort.signal.aborted)setState({key,result:null,error:true});}
      finally{inFlight=false;}
    }
    void refresh();
    const timer=window.setInterval(()=>void refresh(),30000);
    return()=>{abort.abort();window.clearInterval(timer);};
  },[api,realm,subject,key,enabled]);
  return enabled&&state.key===key?state:{key,result:null,error:false};
}
