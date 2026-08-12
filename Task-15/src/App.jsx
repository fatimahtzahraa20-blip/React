import { useMemo, useState } from 'react';

const records = [
  { name: 'Ava Patel', role: 'Product Designer', department: 'Design', status: 'Active', location: 'New York', email: 'ava.patel@acme.io' },
  { name: 'Lucas Nguyen', role: 'Frontend Engineer', department: 'Engineering', status: 'Active', location: 'Seattle', email: 'lucas.nguyen@acme.io' },
  { name: 'Maya Thompson', role: 'Marketing Lead', department: 'Marketing', status: 'Pending', location: 'Chicago', email: 'maya.thompson@acme.io' },
  { name: 'Ethan Brooks', role: 'Sales Manager', department: 'Sales', status: 'Inactive', location: 'Austin', email: 'ethan.brooks@acme.io' },
  { name: 'Sofia Kim', role: 'Data Analyst', department: 'Analytics', status: 'Active', location: 'Boston', email: 'sofia.kim@acme.io' },
  { name: 'Noah Reed', role: 'Operations Manager', department: 'Operations', status: 'Pending', location: 'Denver', email: 'noah.reed@acme.io' },
  { name: 'Isabella Garcia', role: 'Customer Success', department: 'Support', status: 'Active', location: 'Miami', email: 'isabella.garcia@acme.io' },
  { name: 'Daniel Chen', role: 'QA Engineer', department: 'Engineering', status: 'Inactive', location: 'San Jose', email: 'daniel.chen@acme.io' }
];

const statusClassMap = {
  Active: 'status-active',
  Pending: 'status-pending',
  Inactive: 'status-inactive'
};

export default function App() {
  const [query, setQuery] = useState('');

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return records;
    }

    return records.filter((record) =>
      Object.values(record).some((value) =>
        String(value).toLowerCase().includes(normalizedQuery)
      )
    );
  }, [query]);

  return (
    <main className="app-shell">
      <section className="card">
        <div className="header-row">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Client Directory</h1>
          </div>
          <span className="result-badge" aria-live="polite">
            {filteredRecords.length} record{filteredRecords.length === 1 ? '' : 's'}
          </span>
        </div>

        <label className="search-wrap" htmlFor="searchInput">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            id="searchInput"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, role, team, or status"
            autoComplete="off"
          />
        </label>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Location</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.email}>
                    <td className="name-cell">{record.name}</td>
                    <td>{record.role}</td>
                    <td>{record.department}</td>
                    <td>
                      <span className={`status-pill ${statusClassMap[record.status]}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.location}</td>
                    <td>{record.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">No matching records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
