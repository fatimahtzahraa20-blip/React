import UsersTable from "./components/UsersTable";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header>
        <h1>Users Dashboard</h1>
        <p>Users fetched from Supabase</p>
      </header>

      <main>
        <UsersTable />
      </main>
    </div>
  );
}

export default App;