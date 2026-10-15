const mysql=require('mysql2/promise');
const path=require('node:path');
require('dotenv').config({path:path.join(__dirname,'.env'),quiet:true});
function createPool(){
 for(const key of ['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME'])if(!process.env[key])throw new Error(`Missing environment variable: ${key}`);
 return mysql.createPool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,connectionLimit:5,connectTimeout:5000,decimalNumbers:true});
}
function employeeStore(pool){
 const normalize=e=>({...e,id:String(e.id),salary:Number(e.salary)});
 return {
  async list(){const [rows]=await pool.execute('SELECT id,name,position,status,salary FROM employees ORDER BY id');return rows.map(normalize);},
  async add({name,position,salary}){const [result]=await pool.execute('INSERT INTO employees (name,position,status,salary) VALUES (?,?,?,?)',[name,position,'Active',salary]);return {id:String(result.insertId),name,position,status:'Active',salary};},
  async toggle(id){
   const connection=await pool.getConnection();
   try{
    await connection.beginTransaction();
    const [result]=await connection.execute("UPDATE employees SET status=CASE WHEN status='Active' THEN 'On Leave' ELSE 'Active' END WHERE id=?",[id]);
    if(!result.affectedRows){await connection.rollback();return null;}
    const [rows]=await connection.execute('SELECT id,name,position,status,salary FROM employees WHERE id=?',[id]);
    await connection.commit();return normalize(rows[0]);
   }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  },
  async remove(id){const [result]=await pool.execute('DELETE FROM employees WHERE id=?',[id]);return result.affectedRows>0;}
 };
}
module.exports={createPool,employeeStore};
