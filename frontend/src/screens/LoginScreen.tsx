import React,{useState,useRef} from 'react';
import {ScrollView,View,Text,KeyboardAvoidingView,Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Redirect,router} from 'expo-router';
import {useAuth} from '../context/AuthContext';
import {request} from '../lib/api';
import {notify} from '../lib/alerts';
import {Button,Field,s} from '../components/UI';
export default function LoginScreen(){
 const {token,setToken}=useAuth();
 const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false);
 const pending=useRef(false);
 if(token)return <Redirect href="/"/>;
 async function login(){
  if(pending.current)return;
  if(!username.trim()||!password){notify('กรอกข้อมูลไม่ครบ','กรุณากรอก username และ password');return;}
  pending.current=true;setBusy(true);
  try{const result=await request<{token:string}>('/login',null,'POST',{username:username.trim(),password});setToken(result.token);router.replace('/');}
  catch(e){notify('เข้าสู่ระบบไม่สำเร็จ',(e as Error).message);}
  finally{pending.current=false;setBusy(false);}
 }
 return <SafeAreaView style={s.page}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',padding:24}} keyboardShouldPersistTaps="handled"><View style={[s.card,{width:'100%',maxWidth:440,alignSelf:'center',gap:22}]}>
 <Text style={{color:'#DA3743',fontWeight:'800',letterSpacing:3}}>HR MANAGER</Text><Text style={s.title}>ยินดีต้อนรับกลับมา</Text><Text style={s.muted}>จัดการพนักงานและวิเคราะห์โครงสร้างเงินเดือน</Text>
 <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false}/><Field label="Password" value={password} onChangeText={setPassword} secureTextEntry onSubmitEditing={login}/>
 <Button title="เข้าสู่ระบบ" onPress={login} busy={busy}/><Text style={s.muted}>บัญชีทดสอบ: admin / password123</Text><Text style={s.muted}>Chakhin Pinyo · 6730202122</Text>
 </View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
