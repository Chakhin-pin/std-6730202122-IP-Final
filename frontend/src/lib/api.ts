import {Platform} from 'react-native';
import Constants from 'expo-constants';
export type Employee={id:string;name:string;position:string;status:'Active'|'On Leave';salary:number};
export type Cluster={group:string;centroid:number|null;count:number};
const host=Constants.expoConfig?.hostUri?.split(':')[0];
export const API_URL=(process.env.EXPO_PUBLIC_API_URL||(Platform.OS==='web'?`http://${window.location.hostname}:3014/api`:`http://${host||'10.0.2.2'}:3014/api`)).replace(/\/$/,'');
export async function request<T>(path:string,token:string|null,method='GET',body?:unknown):Promise<T>{
 const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(`${API_URL}${path}`,{method,signal:controller.signal,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const data=await response.json();
  if(!response.ok)throw new Error(data.message||`Request failed (${response.status})`);
  return data;
 }catch(e){if(e instanceof Error&&e.name==='AbortError')throw new Error('เชื่อมต่อหมดเวลา กรุณาลองใหม่');throw e;}
 finally{clearTimeout(timer);}
}
