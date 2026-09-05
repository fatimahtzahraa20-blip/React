import RecordActions from './RecordActions';
import { useEffect, useState } from 'react';
import * as api from '../lib/queries';
import RecordForm from './RecordForm';
export default function Students({action,busy,revision,role}){
 const [rows,setRows]=useState([]),[error,setError]=useState(''),[search,setSearch]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{let alive=true;setLoading(true);api.getStudents().then(data=>{if(alive){setRows(data);setError('');}}).catch(e=>{if(alive)setError(e.message);}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[revision]);
 const filtered=rows.filter(s=>`${s.full_name} ${s.student_no}`.toLowerCase().includes(search.toLowerCase()));
 return <><div className="page-intro"><h2>Student directory</h2><p>Registered students and their academic programmes.</p></div><RecordForm kind="student" action={action} busy={busy}/><div className="toolbar"><input aria-label="Search students" placeholder="Search name or student number" value={search} onChange={e=>setSearch(e.target.value)}/></div>{error&&<p role="alert" className="red">{error}</p>}{loading?<p>Loading students…</p>:<><p>{filtered.length} students</p><div className="list">{filtered.map(s=><article className="work" key={s.id}><div><code>{s.student_no}</code><h3>{s.full_name}</h3><p>{s.programmes?.code||'Programme not recorded'}</p></div><RecordActions kind="student" row={s} role={role} action={action} busy={busy}/></article>)}</div>{!filtered.length&&!error&&<p>Add a student above to build your department roster.</p>}</>}</>;
}
