const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createApp}=require('./app');
const {salaryClusters}=require('./clustering');
test('K-Means finds means and handles empty, duplicate and small datasets',()=>{
 assert.deepEqual(salaryClusters([18000,20000,45000,48000,85000,90000]),[
  {group:'Tier 1',centroid:19000,count:2},{group:'Tier 2',centroid:46500,count:2},{group:'Tier 3',centroid:87500,count:2}]);
 for(const values of [[],[0],[100,100,100],[10,20],[1,2,2,10,100,101]]){
  const result=salaryClusters(values);
  assert.equal(result.length,3);
  assert.equal(result.reduce((sum,g)=>sum+g.count,0),values.length);
  assert.ok(result.every(g=>g.centroid===null||Number.isFinite(g.centroid)));
  assert.ok(Math.abs(result.reduce((s,g)=>s+(g.centroid||0)*g.count,0)-values.reduce((s,v)=>s+v,0))<0.1);
 }
});
test('authenticated API supports CRUD, validation and analytics over current data',async t=>{
 const server=createApp((()=>{
 let employees=Array.from({length:6},(_,i)=>({id:String(i+1),name:i===0?'Chakhin Pinyo':'Employee '+i,position:'Developer',status:'Active',salary:20000+i*10000}));
 let nextId=7;
 return {
  async list(){return employees;},
  async add(data){const e={...data,id:String(nextId++),status:'Active'};employees.push(e);return e;},
  async toggle(id){const e=employees.find(e=>e.id===id);if(!e)return null;e.status=e.status==='Active'?'On Leave':'Active';return e;},
  async remove(id){const old=employees.length;employees=employees.filter(e=>e.id!==id);return employees.length!==old;}
 };
 })()).listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base=`http://127.0.0.1:${server.address().port}/api`;
 const call=(path,method='GET',body,auth=true)=>fetch(base+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer mock-jwt-token'}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 assert.equal((await call('/employees','GET',undefined,false)).status,401);
 assert.equal((await call('/employees/salary-clusters','GET',undefined,false)).status,401);
 assert.equal((await call('/login','POST',{username:'admin',password:'wrong'},false)).status,401);
 const login=await call('/login','POST',{username:'admin',password:'password123'},false);
 assert.equal(login.status,200);assert.deepEqual(await login.json(),{success:true,token:'mock-jwt-token'});
 let employees=await (await call('/employees')).json();assert.ok(employees.length>=5);
 assert.equal(employees[0].name,'Chakhin Pinyo');
 for(const payload of [{},{name:' ',position:'Dev',salary:5},{name:'A',position:'',salary:1},{name:'A',position:'Dev',salary:''},{name:'A',position:'Dev',salary:-1},{name:'A',position:'Dev',salary:null},{name:'A',position:'Dev',salary:'100'},{name:'A',position:'Dev',salary:1e30},{name:'A',position:'Dev',salary:1.234}])assert.equal((await call('/employees','POST',payload)).status,400);
 const created=await call('/employees','POST',{name:' Chakhin Pinyo ',position:' Developer ',salary:0});
 assert.equal(created.status,201);const employee=await created.json();assert.equal(employee.name,'Chakhin Pinyo');assert.equal(employee.salary,0);
 assert.equal((await (await call(`/employees/${employee.id}/status`,'PUT')).json()).status,'On Leave');
 assert.equal((await (await call(`/employees/${employee.id}/status`,'PUT')).json()).status,'Active');
 let summary=await(await call('/employees/salary-clusters')).json();assert.equal(summary.clusters.reduce((s,g)=>s+g.count,0),7);
 for(const path of ['/employees/missing/status','/employees/missing'])assert.equal((await call(path,path.endsWith('status')?'PUT':'DELETE')).status,404);
 employees=await(await call('/employees')).json();
 for(const e of employees)assert.equal((await call(`/employees/${e.id}`,'DELETE')).status,200);
 summary=await(await call('/employees/salary-clusters')).json();assert.ok(summary.clusters.every(g=>g.count===0&&g.centroid===null));
 const malformed=await fetch(base+'/employees',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer mock-jwt-token'},body:'{'});assert.equal(malformed.status,400);
});
