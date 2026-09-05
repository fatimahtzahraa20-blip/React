import {useCallback,useEffect,useRef,useState} from"react";
import sheet from"./assets/aurelia-headphones-contact-sheet.png";
import accessories from"./assets/aurelia-accessories-contact-sheet.png";

const products=[
 {name:"Aurelia H1",price:420,detail:"Warm Ivory"},
 {name:"Ivory Tote",price:280,detail:"Grained leather"},
 {name:"Arc Crossbody",price:195,detail:"Camel leather"},
 {name:"No. 02 Sunglasses",price:160,detail:"Tortoiseshell"},
 {name:"Pocket Set",price:125,detail:"Warm Ivory"},
];
const views=[
 ["Headphones",0,0,sheet,0],["Side profile",1,0,sheet,0],["Material detail",0,1,sheet,0],["Travel case",1,1,sheet,0],
 ["Ivory tote",0,0,accessories,1],["Crossbody bag",1,0,accessories,2],["Sunglasses",0,1,accessories,3],["Leather goods",1,1,accessories,4],
];

function Image({view,zoom,origin}){return <img className={'sheet q'+view[1]+view[2]+(zoom?" zoom":"")} src={view[3]} alt={view[0]} style={{transformOrigin:origin}} draggable="false"/>}

export default function App(){
 const[active,setActive]=useState(0),[zoom,setZoom]=useState(false),[origin,setOrigin]=useState("25% 25%"),[cart,setCart]=useState([]),[bagOpen,setBagOpen]=useState(false);const stage=useRef(null);
 const move=useCallback(d=>{setActive(i=>(i+d+views.length)%views.length);setZoom(false)},[]);
 const product=products[views[active][4]];
 const count=cart.reduce((sum,item)=>sum+item.quantity,0);
 const total=cart.reduce((sum,item)=>sum+products[item.id].price*item.quantity,0);
 const addToBag=()=>{const id=views[active][4];setCart(items=>{const found=items.find(item=>item.id===id);return found?items.map(item=>item.id===id?{...item,quantity:item.quantity+1}:item):[...items,{id,quantity:1}]});setBagOpen(true)};
 const changeQuantity=(id,amount)=>setCart(items=>items.map(item=>item.id===id?{...item,quantity:item.quantity+amount}:item).filter(item=>item.quantity>0));
 useEffect(()=>{const key=e=>{if(e.key==="Escape"){setZoom(false);setBagOpen(false);return}if(bagOpen)return;if(e.key==="ArrowRight")move(1);if(e.key==="ArrowLeft")move(-1);if((e.key===" "||e.key==="Enter")&&document.activeElement===stage.current){e.preventDefault();setZoom(v=>!v)}};addEventListener("keydown",key);return()=>removeEventListener("keydown",key)},[move,bagOpen]);
 const point=e=>{const r=e.currentTarget.getBoundingClientRect(),x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)),y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100)),v=views[active];return(v[1]*50+x/2)+"% "+(v[2]*50+y/2)+"%"};
 return <main>
  <header><a className="brand" href="#" aria-label="Thumbnails home">THUMBNAILS<sup>®</sup></a><div className="meta"><span>Designed for stillness</span><button onClick={()=>setBagOpen(true)} aria-label={'Open bag with '+count+' items'}>Bag <b>{count}</b></button></div></header>
  <section className="layout"><div><div className="eyebrow"><span>Objects, refined</span><span>2025 / 01</span></div>
   <div ref={stage} className={'stage '+(zoom?"zooming":"")} role="button" tabIndex="0" aria-label={views[active][0]+(zoom?". Zoomed in.":". Activate to zoom.")} aria-pressed={zoom} onClick={e=>{if(!zoom)setOrigin(point(e));setZoom(v=>!v)}} onMouseMove={e=>zoom&&setOrigin(point(e))}>
    <Image view={views[active]} zoom={zoom} origin={origin}/><div className="top"><span>{views[active][0]}</span><span>{zoom?"Close zoom":"Click to zoom"}</span></div>
    <div className="controls" onClick={e=>e.stopPropagation()}><button onClick={()=>move(-1)} aria-label="Previous image">←</button><span><strong>{String(active+1).padStart(2,"0")}</strong> / 08</span><button onClick={()=>move(1)} aria-label="Next image">→</button></div>
   </div>
   <div className="thumbs" role="tablist">{views.map((v,i)=><button key={i} className={i===active?"active":""} role="tab" aria-selected={i===active} aria-label={'View '+v[0]} onClick={()=>{setActive(i);setZoom(false)}}><span className="thumb"><Image view={v}/></span></button>)}</div>
  </div>
  <aside><p className="collection">Curated objects / Series 01</p><h1><i>Thumb</i><br/>nails</h1><p className="intro">A considered personal object, shaped in tactile materials and a warm, understated palette.</p><div className="specs"><div><span>Finish</span><b>{product.detail}</b></div><div><span>Collection</span><b>Series 01</b></div><div><span>Delivery</span><b>Complimentary</b></div></div><div className="buy"><span>${product.price}</span><button onClick={addToBag}>Add to bag <span>↗</span></button></div><p className="shipping">Complimentary express delivery and 30-day returns.</p><div className="keys"><kbd>←</kbd><kbd>→</kbd><span>Navigate</span><kbd>Space</kbd><span>Zoom</span><kbd>Esc</kbd><span>Exit</span></div></aside>
  </section>
  {bagOpen&&<><button className="bag-backdrop" onClick={()=>setBagOpen(false)} aria-label="Close bag"/><section className="bag-panel" role="dialog" aria-modal="true" aria-labelledby="bag-title"><div className="bag-head"><div><small>Your selection</small><h2 id="bag-title">Bag <sup>{count}</sup></h2></div><button onClick={()=>setBagOpen(false)} aria-label="Close bag">×</button></div>
   <div className="bag-items">{cart.length===0?<div className="empty"><span>Bag is empty</span><p>Select an item from the gallery and add it to your bag.</p></div>:cart.map(item=>{const p=products[item.id],v=views.find(view=>view[4]===item.id);return <article className="bag-item" key={item.id}><span className="cart-image"><Image view={v}/></span><div><h3>{p.name}</h3><p>{p.detail}</p><div className="quantity"><button onClick={()=>changeQuantity(item.id,-1)} aria-label={'Remove one '+p.name}>−</button><span>{item.quantity}</span><button onClick={()=>changeQuantity(item.id,1)} aria-label={'Add one '+p.name}>+</button></div></div><strong>${p.price*item.quantity}</strong></article>})}</div>
   {cart.length>0&&<div className="bag-footer"><div><span>Subtotal</span><strong>${total}</strong></div><button onClick={()=>alert("Checkout is ready for integration.")}>Continue to checkout <span>↗</span></button><small>Taxes and shipping calculated at checkout.</small></div>}
  </section></>}
 </main>
}


