const {createApp}=require('./app');
const {createPool,employeeStore}=require('./database');
async function start(){
 const pool=createPool();
 try{
  await pool.execute('SELECT id,name,position,status,salary FROM employees LIMIT 1');
  const port=Number(process.env.PORT||3014);
  const server=createApp(employeeStore(pool)).listen(port,'0.0.0.0',()=>console.log(`Chakhin Pinyo HR API: http://localhost:${port} (MySQL employees)`));
  server.on('error',async error=>{console.error('Server failed:',error.code);await pool.end();process.exitCode=1;});
 }catch(error){console.error('MySQL connection failed:',error.code||error.message);await pool.end();process.exitCode=1;}
}
start();
