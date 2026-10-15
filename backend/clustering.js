// Deterministic Lloyd K-Means, k=3. Empty groups have null means.
function salaryClusters(salaries) {
  const unique = [...new Set(salaries)].sort((a,b)=>a-b);
  const k = Math.min(3, unique.length);
  if (!k) return [1,2,3].map(i=>({group:`Tier ${i}`,centroid:null,count:0}));
  let centers=Array.from({length:k},(_,i)=>unique[Math.floor(i*(unique.length-1)/Math.max(1,k-1))]);
  let groups;
  for(let step=0;step<100;step++) {
    groups=centers.map(()=>[]);
    for(const salary of salaries) {
      let nearest=0;
      for(let i=1;i<k;i++) if(Math.abs(salary-centers[i])<Math.abs(salary-centers[nearest])) nearest=i;
      groups[nearest].push(salary);
    }
    const next=groups.map((g,i)=>g.length?g.reduce((sum,v)=>sum+v/g.length,0):centers[i]);
    if(next.every((v,i)=>Math.abs(v-centers[i])<1e-8)) break;
    centers=next;
  }
  const result=groups.map(g=>({centroid:g.length?g.reduce((sum,v)=>sum+v/g.length,0):null,count:g.length}));
  result.sort((a,b)=>(a.centroid??Infinity)-(b.centroid??Infinity));
  while(result.length<3) result.push({centroid:null,count:0});
  return result.map((g,i)=>({group:`Tier ${i+1}`,centroid:g.centroid===null?null:Math.round(g.centroid*100)/100,count:g.count}));
}
module.exports={salaryClusters};
