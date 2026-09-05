import { useId, useRef, useState } from "react";

const FAQS = [
  { question: "What is an accordion component?", answer: "An accordion is a vertically stacked set of interactive headings that reveal or hide related content. It keeps long pages easy to scan while letting people choose the details they need." },
  { question: "Can I open more than one section?", answer: "This example keeps one section open at a time. The state is intentionally simple, so it can easily be adapted to store multiple open section IDs instead." },
  { question: "How does keyboard navigation work?", answer: "Use Tab to enter the accordion, then Arrow Up and Arrow Down to move between headings. Home and End jump to the first and last heading, while Enter or Space toggles a section." },
  { question: "Is the component accessible?", answer: "Yes. Each heading contains a native button with aria-expanded and aria-controls. Every panel is labelled by its heading, and visible focus styles make keyboard position clear." },
  { question: "Can the animation handle dynamic content?", answer: "Yes. The panel animates from a zero-fraction to a one-fraction CSS grid row, so no fixed height or JavaScript measurement is required." },
];

function AccordionItem({ item, index, open, onToggle, setButtonRef, onKeyDown }) {
  const id = useId().replace(/:/g, "");
  const buttonId = `accordion-button-${id}`;
  const panelId = `accordion-panel-${id}`;
  return (
    <div className={`accordion-item${open ? " is-open" : ""}`}>
      <h2><button ref={(node) => setButtonRef(index, node)} id={buttonId} className="accordion-trigger" type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle} onKeyDown={(event) => onKeyDown(event, index)}><span>{item.question}</span><span className="accordion-icon" aria-hidden="true"><span /><span /></span></button></h2>
      <div className="accordion-panel-wrap" aria-hidden={!open}><div className="accordion-panel-inner"><div id={panelId} className="accordion-panel" role="region" aria-labelledby={buttonId}><p>{item.answer}</p></div></div></div>
    </div>
  );
}

function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  const buttonRefs = useRef([]);
  function handleKeyDown(event, index) {
    let nextIndex;
    if (event.key === "ArrowDown") nextIndex = (index + 1) % items.length;
    if (event.key === "ArrowUp") nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex !== undefined) { event.preventDefault(); buttonRefs.current[nextIndex]?.focus(); }
  }
  return <div className="accordion">{items.map((item, index) => <AccordionItem key={item.question} item={item} index={index} open={openIndex === index} onToggle={() => setOpenIndex((current) => current === index ? -1 : index)} setButtonRef={(itemIndex, node) => { buttonRefs.current[itemIndex] = node; }} onKeyDown={handleKeyDown} />)}</div>;
}

export default function App() {
  return (
    <main className="page-shell"><section className="faq-card" aria-labelledby="page-title">
      <div className="eyebrow"><span /> Help center</div>
      <h1 id="page-title">Frequently asked questions</h1>
      <p className="intro">Everything you need to know about this accordion and how to navigate it.</p>
      <Accordion items={FAQS} />
      <p className="keyboard-hint"><span className="hint-icon" aria-hidden="true">Keys</span> Navigate with <kbd>Up</kbd> <kbd>Down</kbd> <kbd>Home</kbd> <kbd>End</kbd></p>
    </section></main>
  );
}
