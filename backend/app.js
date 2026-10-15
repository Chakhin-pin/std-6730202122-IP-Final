const express=require('express');
const cors=require('cors');
const {salaryClusters}=require('./clustering');
function createApp(store){
 if(!store)throw new Error('Employee database store is required');
 const app=express();
 app.use(cors()); app.use(express.json({limit:'20kb'}));
 app.post('/api/login',(req,res)=>{
  const {username,password}=req.body||{};
  if(username==='admin'&&password==='password123') return res.json({success:true,token:'mock-jwt-token'});
  res.status(401).json({success:false,message:'Username or password is incorrect'});
 });
 app.use('/api/employees',(req,res,next)=>{
  if(req.get('Authorization')!=='Bearer mock-jwt-token') return res.status(401).json({success:false,message:'Please log in'});
  next();
 });
 app.get('/api/employees/salary-clusters',async(req,res)=>res.json({success:true,clusters:salaryClusters((await store.list()).map(e=>e.salary))}));
 app.get('/api/employees',async(req,res)=>res.json(await store.list()));
 app.post('/api/employees',async(req,res)=>{
  const {name,position,salary}=req.body||{};
  if(typeof name!=='string'||!name.trim()||[...name.trim()].length>100||typeof position!=='string'||!position.trim()||[...position.trim()].length>100||typeof salary!=='number'||!Number.isFinite(salary)||salary<0||salary>9999999999.99||Math.abs(salary*100-Math.round(salary*100))>0.0001)
   return res.status(400).json({success:false,message:'Name, position and a valid nonnegative numeric salary are required'});
  const employee=await store.add({name:name.trim(),position:position.trim(),salary});
  res.status(201).json(employee);
 });
 app.put('/api/employees/:id/status',async(req,res)=>{
  if(!/^[1-9]\d*$/.test(req.params.id))return res.status(404).json({success:false,message:'Employee not found'});
  const employee=await store.toggle(req.params.id);
  if(!employee)return res.status(404).json({success:false,message:'Employee not found'});
  res.json(employee);
 });
 app.delete('/api/employees/:id',async(req,res)=>{
  if(!/^[1-9]\d*$/.test(req.params.id)||!await store.remove(req.params.id))return res.status(404).json({success:false,message:'Employee not found'});
  res.json({success:true});
 });
 app.use((req,res)=>res.status(404).json({success:false,message:'Endpoint not found'}));
 app.use((err,req,res,next)=>{console.error('API failed:',err.code||err.status||'UNKNOWN');res.status(err.status||503).json({success:false,message:err.status===400?'Invalid JSON':'Database unavailable. Please retry.'});});
 return app;
}
module.exports={createApp};
