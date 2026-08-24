const FIRST = ["Amina", "Ben", "Carlos", "Priya", "Wei", "Sofia", "Liam", "Noor", "Ravi", "Elena", "Tomás", "Aisha"];
const LAST = ["Yusuf", "Carter", "Diaz", "Nair", "Zhang", "Rossi", "Novak", "Farah", "Singh", "Petrova", "Kim", "Silva"];
const DOMAINS = ["acme.co", "globex.io", "initech.dev", "umbrella.org", "stark.tech"];
const STATUSES = ["active", "inactive", "pending"];

export function generateRows(count) {
  const rows = new Array(count);
  for (let i = 0; i < count; i++) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7) % LAST.length];
    rows[i] = {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@${DOMAINS[i % DOMAINS.length]}`,
      status: STATUSES[i % STATUSES.length],
      score: Math.round((Math.sin(i * 12.9898) * 0.5 + 0.5) * 1000) / 10,
    };
  }
  return rows;
}
