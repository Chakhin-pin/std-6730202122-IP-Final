import React,{useEffect,useState,useRef} from 'react';
import {ScrollView,View,Text,ActivityIndicator,KeyboardAvoidingView,Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Redirect} from 'expo-router';
import {useAuth} from '../context/AuthContext';
import {request,Employee,Cluster} from '../lib/api';
import {notify,confirmDelete} from '../lib/alerts';
import {Button,Field,s} from '../components/UI';
const chakhinPinyo='Chakhin Pinyo';
const money=(v:number)=>v.toLocaleString('th-TH',{maximumFractionDigits:2});
export default function DashboardScreen(){
 const {token,setToken}=useAuth();
 const [employees,setEmployees]=useState<Employee[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [name,setName]=useState(''),[position,setPosition]=useState(''),[salary,setSalary]=useState('');
 const [busy,setBusy]=useState(false),[analyzing,setAnalyzing]=useState(false),[clusters,setClusters]=useState<Cluster[]|null>(null);
 const mutation=useRef(false),analysis=useRef(false);
 useEffect(()=>{if(token)void load();},[token]);
 async function load(){setLoading(true);setError('');setClusters(null);try{setEmployees(await request<Employee[]>('/employees',token));}catch(e){setError((e as Error).message);}finally{setLoading(false);}}
 async function change(action:()=>Promise<void>){
  if(mutation.current||analysis.current)return;mutation.current=true;setBusy(true);
  try{await action();setClusters(null);}catch(e){notify('ดำเนินการไม่สำเร็จ',(e as Error).message);}finally{mutation.current=false;setBusy(false);}
 }
 function add(){
  const salaryText=salary.trim();
  const validFormat=/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(salaryText);
  const salaryValue=Number(salaryText.replace(/,/g,''));
  if(!name.trim()||!position.trim()||!validFormat||!Number.isFinite(salaryValue)||salaryValue>9999999999.99){notify('ข้อมูลไม่ถูกต้อง','กรอกชื่อ ตำแหน่ง และเงินเดือน 0–9,999,999,999.99 (ทศนิยมไม่เกิน 2 ตำแหน่ง) เช่น 50000 หรือ 50,000');return;}
  void change(async()=>{const employee=await request<Employee>('/employees',token,'POST',{name:name.trim(),position:position.trim(),salary:salaryValue});setEmployees(old=>[...old,employee]);setName('');setPosition('');setSalary('');});
 }
 async function analyze(){
  if(analysis.current||mutation.current)return;analysis.current=true;setAnalyzing(true);
  try{const result=await request<{clusters:Cluster[]}>('/employees/salary-clusters',token);setClusters(result.clusters);}catch(e){notify('วิเคราะห์ไม่สำเร็จ',(e as Error).message);}finally{analysis.current=false;setAnalyzing(false);}
 }
 if(!token)return <Redirect href="/login"/>;
 const blocked=busy||analyzing||loading||!!error;
 return <SafeAreaView style={s.page}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
 <View style={[s.row,{justifyContent:'space-between'}]}><View><Text style={{color:'#DA3743',fontWeight:'800',letterSpacing:3}}>HR MANAGER</Text><Text style={s.title}>ภาพรวมพนักงาน</Text><Text style={s.muted}>ดูแลทีมของคุณในที่เดียว</Text></View><Button title="ออกจากระบบ" secondary disabled={busy||analyzing} onPress={()=>setToken(null)}/></View>
 <View style={s.row}>{[['พนักงานทั้งหมด',employees.length+' คน'],['Active',employees.filter(e=>e.status==='Active').length+' คน'],['เงินเดือนรวม',money(employees.reduce((v,e)=>v+e.salary,0))+' บาท']].map(([label,value])=><View key={label} style={[s.card,{flexGrow:1,minWidth:160}]}><Text style={s.muted}>{label}</Text><Text style={s.heading}>{value}</Text></View>)}</View>
 <View style={s.card}><Text style={s.heading}>เพิ่มพนักงาน</Text><Field label="ชื่อพนักงาน" value={name} onChangeText={setName} maxLength={100} editable={!busy}/><Field label="ตำแหน่ง" value={position} onChangeText={setPosition} maxLength={100} editable={!busy}/><Field label="เงินเดือน (บาท)" value={salary} onChangeText={setSalary} keyboardType="decimal-pad" editable={!busy}/><Button title="Add Employee" onPress={add} disabled={blocked} busy={busy}/></View>
 <View style={s.card}><View style={[s.row,{justifyContent:'space-between'}]}><View><Text style={s.heading}>Salary Analytics</Text><Text style={s.muted}>K-Means · 3 ระดับเงินเดือน</Text></View><Button title="Analyze Salary Structure" onPress={analyze} disabled={blocked} busy={analyzing}/></View>
 {analyzing&&<View style={s.row}><ActivityIndicator color="#DA3743"/><Text style={s.muted}>กำลังวิเคราะห์เงินเดือน...</Text></View>}
 {clusters&&<View style={s.row}>{clusters.map((g,i)=><View key={g.group} style={[s.card,{flexGrow:1,minWidth:180,backgroundColor:['#FFF6F6','#F0FDFA','#FFFBEB'][i]}]}><Text style={s.heading}>{g.group}</Text><Text style={s.muted}>{g.count} คน</Text><Text style={s.heading}>{g.centroid===null?'ไม่มีข้อมูล':money(g.centroid)+' บาท'}</Text><Text style={s.muted}>เงินเดือนเฉลี่ย</Text></View>)}</View>}
 {clusters&&<Text style={s.muted}>เรียงจากเงินเดือนต่ำไปสูง กลุ่มที่ไม่มีสมาชิกจะแสดงไม่มีข้อมูล</Text>}
 </View>
 <View style={s.row}><Text style={s.heading}>รายชื่อพนักงาน</Text><Button title="รีเฟรช" secondary onPress={()=>void load()} disabled={loading||busy||analyzing}/></View>
 {loading?<ActivityIndicator color="#DA3743"/>:error?<Text accessibilityRole="alert" style={s.error}>{error} — ตรวจสอบว่า backend เปิดอยู่ แล้วกดรีเฟรช</Text>:employees.length===0?<Text style={s.muted}>ยังไม่มีพนักงาน เพิ่มคนแรกได้จากฟอร์มด้านบน</Text>:employees.map(e=><View key={e.id} style={s.card}><View style={[s.row,{justifyContent:'space-between'}]}><View><Text style={s.heading}>{e.name}</Text><Text style={s.muted}>{e.position}</Text></View><Text style={{color:e.status==='Active'?'#059669':'#B45309',fontWeight:'700'}}>{e.status}</Text></View><Text style={s.heading}>{money(e.salary)} บาท</Text><View style={s.row}><Button title="Toggle Status" secondary disabled={blocked} onPress={()=>void change(async()=>{const updated=await request<Employee>(`/employees/${e.id}/status`,token,'PUT');setEmployees(old=>old.map(v=>v.id===updated.id?updated:v));})}/><Button title="Delete" secondary disabled={blocked} onPress={()=>confirmDelete(e.name,()=>void change(async()=>{await request(`/employees/${e.id}`,token,'DELETE');setEmployees(old=>old.filter(v=>v.id!==e.id));}))}/></View></View>)}
 <Text style={[s.muted,{textAlign:'center'}]}>Internet Programming 2026 · {chakhinPinyo} · 6730202122</Text>
 </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
