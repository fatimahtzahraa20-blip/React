import { useTheme, THEMES } from "./ThemeContext.jsx";
const Icon=({type})=>type==="sun"?<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5M2 12h2m16 0h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5"/></svg>:type==="moon"?<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.1A8.5 8.5 0 0 1 8.9 3.5a8.5 8.5 0 1 0 11.6 11.6Z"/></svg>:<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-1.6a1.4 1.4 0 0 0-1.1 2.2c1 1.4 0 3.8-3.3 3.8Z"/><circle cx="7.5" cy="11" r=".8" fill="currentColor"/><circle cx="10" cy="7.5" r=".8" fill="currentColor"/><circle cx="15" cy="7.5" r=".8" fill="currentColor"/></svg>;
const choices=[
 {id:"linen",name:"Linen",note:"Warm & considered",icon:"sun",colors:["#f3f0e9","#fffdf8","#c55a36"]},
 {id:"midnight",name:"Midnight",note:"Quiet & focused",icon:"moon",colors:["#111512","#191e1a","#e27b55"]},
 {id:"forest",name:"Evergreen",note:"Natural & grounded",icon:"palette",colors:["#10251d","#183328","#8fc49c"]},
 {id:"ocean",name:"Tidal",note:"Cool & expansive",icon:"palette",colors:["#eaf4f5","#f8fcfc","#167d8d"]},
 {id:"plum",name:"Mulberry",note:"Rich & expressive",icon:"palette",colors:["#241521","#321c2d","#e399bd"]}
];
export default function App(){
 const {theme,setTheme}=useTheme();
 const next=()=>setTheme(THEMES[(THEMES.indexOf(theme)+1)%THEMES.length]);
 return <main className="page-shell">
  <nav className="nav"><a className="brand" href="#top"><span className="brand-mark">T</span>Themechanger</a><button className="nav-toggle" onClick={next} aria-label="Try the next color theme"><Icon type="sun"/><span className="toggle-track"><span/></span><Icon type="moon"/></button></nav>
  <section className="hero" id="top"><span className="eyebrow"><span/> Color studio</span><h1>Make it feel<br/><em>like yours.</em></h1><p>Choose a palette that suits your space. Your preference stays with you, even after you close the tab.</p></section>
  <section className="theme-panel" aria-labelledby="theme-title"><div className="panel-heading"><div><span className="step">01</span><h2 id="theme-title">Choose your palette</h2></div><span className="saved"><span/> Saved automatically</span></div><div className="theme-grid">
   {choices.map(choice=><button key={choice.id} className={`theme-card ${theme===choice.id?"selected":""}`} onClick={()=>setTheme(choice.id)} aria-pressed={theme===choice.id}>
    <span className="preview" style={{"--preview-bg":choice.colors[0],"--preview-surface":choice.colors[1],"--preview-accent":choice.colors[2]}}><span className="mini-nav"/><span className="mini-copy"><i/><i/><i/></span><span className="mini-card"/><span className="color-dots">{choice.colors.map(color=><i key={color} style={{background:color}}/>)}</span></span>
    <span className="card-meta"><span><Icon type={choice.icon}/><b>{choice.name}</b><small>{choice.note}</small></span><i className="radio"/></span>
   </button>)}
  </div></section><footer><span>Palette preference</span><span className="footer-line"/><span>Stored locally</span></footer>
 </main>
}