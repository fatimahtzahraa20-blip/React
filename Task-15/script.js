const records = [
  {
    name: 'Ava Patel',
    role: 'Product Designer',
    department: 'Design',
    status: 'Active',
    location: 'New York',
    email: 'ava.patel@acme.io'
  },
  {
    name: 'Lucas Nguyen',
    role: 'Frontend Engineer',
    department: 'Engineering',
    status: 'Active',
    location: 'Seattle',
    email: 'lucas.nguyen@acme.io'
  },
  {
    name: 'Maya Thompson',
    role: 'Marketing Lead',
    department: 'Marketing',
    status: 'Pending',
    location: 'Chicago',
    email: 'maya.thompson@acme.io'
  },
  {
    name: 'Ethan Brooks',
    role: 'Sales Manager',
    department: 'Sales',
    status: 'Inactive',
    location: 'Austin',
    email: 'ethan.brooks@acme.io'
  },
  {
    name: 'Sofia Kim',
    role: 'Data Analyst',
    department: 'Analytics',
    status: 'Active',
    location: 'Boston',
    email: 'sofia.kim@acme.io'
  },
  {
    name: 'Noah Reed',
    role: 'Operations Manager',
    department: 'Operations',
    status: 'Pending',
    location: 'Denver',
    email: 'noah.reed@acme.io'
  },
  {
    name: 'Isabella Garcia',
    role: 'Customer Success',
    department: 'Support',
    status: 'Active',
    location: 'Miami',
    email: 'isabella.garcia@acme.io'
  },
  {
    name: 'Daniel Chen',
    role: 'QA Engineer',
    department: 'Engineering',
    status: 'Inactive',
    location: 'San Jose',
    email: 'daniel.chen@acme.io'
  }
];

const searchInput = document.getElementById('searchInput');
const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const resultCount = document.getElementById('resultCount');

function getStatusClass(status) {
  const normalized = status.toLowerCase();

  if (normalized === 'active') return 'status-active';
  if (normalized === 'pending') return 'status-pending';
  return 'status-inactive';
}

function renderTable(filterText = '') {
  const query = filterText.trim().toLowerCase();

  const filteredRecords = records.filter((record) => {
    const searchableText = Object.values(record).join(' ').toLowerCase();
    return searchableText.includes(query);
  });

  tableBody.innerHTML = filteredRecords
    .map(
      (record) => `
        <tr>
          <td class="name-cell">${record.name}</td>
          <td>${record.role}</td>
          <td>${record.department}</td>
          <td><span class="status-pill ${getStatusClass(record.status)}">${record.status}</span></td>
          <td>${record.location}</td>
          <td>${record.email}</td>
        </tr>
      `
    )
    .join('');

  emptyState.hidden = filteredRecords.length > 0;
  resultCount.textContent = `${filteredRecords.length} record${filteredRecords.length === 1 ? '' : 's'}`;
}

searchInput.addEventListener('input', (event) => {
  renderTable(event.target.value);
});

renderTable();
