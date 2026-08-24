const DATASET = [
  { id: 1, type: "Document", title: "Q3 Roadmap Planning", excerpt: "Cross-team roadmap for Q3 including launch milestones." },
  { id: 2, type: "Document", title: "Design System Guidelines", excerpt: "Typography, color, and spacing tokens for the product." },
  { id: 3, type: "Person", title: "Amina Yusuf", excerpt: "Engineering Manager, Platform team." },
  { id: 4, type: "Person", title: "Ben Carter", excerpt: "Product Designer, Growth team." },
  { id: 5, type: "File", title: "onboarding-flow-v3.fig", excerpt: "Figma file — updated 2 days ago." },
  { id: 6, type: "File", title: "revenue-report-2026.xlsx", excerpt: "Spreadsheet — finance shared drive." },
  { id: 7, type: "Document", title: "Incident Postmortem: Search Outage", excerpt: "Root cause analysis and remediation steps." },
  { id: 8, type: "Person", title: "Priya Nair", excerpt: "Data Scientist, Analytics team." },
  { id: 9, type: "Document", title: "API Rate Limiting Proposal", excerpt: "Design doc for per-tenant rate limits." },
  { id: 10, type: "File", title: "brand-guidelines.pdf", excerpt: "PDF — marketing shared drive." },
  { id: 11, type: "Document", title: "Search Relevance Tuning Notes", excerpt: "Notes on ranking signal experiments." },
  { id: 12, type: "Person", title: "Wei Zhang", excerpt: "Staff Engineer, Search & Discovery." },
];

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function searchAll(query) {
  await wait(250 + Math.random() * 300);
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return DATASET.filter(
    (item) => item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q)
  );
}

