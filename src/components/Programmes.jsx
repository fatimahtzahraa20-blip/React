import { useEffect,useState } from 'react';
import * as api from '../lib/queries';
import RecordActions from './RecordActions';
export default function Programmes({role,action,busy,revision}){
 const [rows,setRows]=useState([]),[error,setError]=useState('');
 useEffect(()=>{let alive=true;api.getProgrammes().then(data=>{if(alive){setRows(data);setError('');}}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[revision]);
 return <div className="panel"><h3>Programmes</h3>{error&&<p className="red" role="alert">{error}</p>}{rows.map(p=><article className="panel" key={p.id}><code>{p.code}</code><h3>{p.name}</h3><RecordActions kind="programme" row={p} role={role} action={action} busy={busy}/></article>)}{!rows.length&&!error&&<p>Add a programme using the form above.</p>}</div>;
}
