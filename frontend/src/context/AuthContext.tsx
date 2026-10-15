import React,{createContext,useContext,useState} from 'react';
const AuthContext=createContext<{token:string|null;setToken:(value:string|null)=>void}>({token:null,setToken:()=>{}});
export function AuthProvider({children}:{children:React.ReactNode}){const [token,setToken]=useState<string|null>(null);return <AuthContext.Provider value={{token,setToken}}>{children}</AuthContext.Provider>;}
export const useAuth=()=>useContext(AuthContext);
