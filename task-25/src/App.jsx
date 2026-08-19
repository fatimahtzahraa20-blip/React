import { useState } from "react";

const PLANS = [
  { name: "Starter", monthly: 9, yearly: 90, desc: "For individuals just getting started.",
    features: ["1 project", "Basic analytics", "Community support", "1 GB storage"] },
  { name: "Pro", monthly: 29, yearly: 290, desc: "For growing teams that need more power.", featured: true,
    features: ["Unlimited projects", "Advanced analytics", "Priority support", "50 GB storage", "Custom integrations"] },
  { name: "Enterprise", monthly: 99, yearly: 990, desc: "For organizations with advanced needs.",
    features: ["Everything in Pro", "Dedicated manager", "SLA & SSO", "Unlimited storage", "Custom contracts"] },
];

function PricingCard({ plan, yearly, selected, onSelect }) {
  const price = yearly ? plan.yearly : plan.monthly;
  return (
    <div className={"card" + (plan.featured ? " featured" : "") + (selected ? " selected" : "")}>
      {plan.featured && <div className="tag">Most popular</div>}
      <div className="plan">{plan.name}</div>
      <div className="price">${price}<span>/{yearly ? "yr" : "mo"}</span></div>
      <div className="desc">{plan.desc}</div>
      <ul>
        {plan.features.map((f, i) => <li key={i}><span className="check">✓</span>{f}</li>)}
      </ul>
      <button type="button" className="cta" aria-pressed={selected} onClick={() => onSelect(plan.name)}>
        {selected ? plan.name + ' selected' : 'Choose ' + plan.name}
      </button>
    </div>
  );
}

function Checkout({ plan, yearly, close }) {
  const [done, setDone] = useState(false);
  const price = yearly ? plan.yearly : plan.monthly;
  return <div className="checkout-bg" onMouseDown={close}><section className="checkout" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
    <button className="close" aria-label="Close" onClick={close}>&times;</button>
    {done ? <div className="success"><b>&#10003;</b><h2>Payment successful</h2><p>Your {plan.name} plan order has been received.</p><button className="pay" onClick={close}>Done</button></div> : <>
    <header><small>SECURE CHECKOUT</small><h2>Complete your purchase</h2><p>Enter your payment details below.</p></header>
    <div className="summary"><span><b>{plan.name} plan</b><small>{yearly ? "Yearly" : "Monthly"} billing</small></span><strong>{'$'}{price}<small>/{yearly ? "yr" : "mo"}</small></strong></div>
    <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      <label>Full name<input placeholder="Alex Morgan" required /></label>
      <label>Email address<input type="email" placeholder="alex@example.com" required /></label>
      <label>Card number<input inputMode="numeric" placeholder="1234 5678 9012 3456" pattern="[0-9 ]{15,19}" required /></label>
      <div className="fields"><label>Expiry<input placeholder="MM/YY" required /></label><label>CVV<input type="password" inputMode="numeric" placeholder="123" pattern="[0-9]{3,4}" required /></label></div>
      <button className="pay" type="submit">Pay {'$'}{price}</button><em>Demo checkout - no real payment is processed.</em>
    </form></>}</section></div>;
}

export default function App() {
  const [yearly, setYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  return (
    <div className="wrap">
      <h1>Simple, transparent pricing</h1>
      <p className="sub">Choose the plan that fits your team. Cancel anytime.</p>
      <div className="toggle">
        <button className={!yearly ? "active" : ""} onClick={() => setYearly(false)}>Monthly</button>
        <button className={yearly ? "active" : ""} onClick={() => setYearly(true)}>Yearly <span className="save">Save 17%</span></button>
      </div>
      <div className="grid">
        {PLANS.map((p) => (
          <PricingCard key={p.name} plan={p} yearly={yearly}
            selected={selectedPlan === p.name} onSelect={setSelectedPlan} />
        ))}
      </div>
      <p className="selection-status" aria-live="polite">
        {selectedPlan ? 'You selected the ' + selectedPlan + ' plan.' : 'Select a plan to get started.'}
      </p>
      {selectedPlan && <Checkout plan={PLANS.find((p) => p.name === selectedPlan)} yearly={yearly} close={() => setSelectedPlan("")} />}
    </div>
  );
}
