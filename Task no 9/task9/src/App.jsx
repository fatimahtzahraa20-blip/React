import { useState, useEffect } from "react";

function App() {
  // Counter State
  const [count, setCount] = useState(0);

  // Posts State
  const [posts, setPosts] = useState([]);

  // Fetch data when component loads
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
      .then((response) => response.json())
      .then((data) => setPosts(data))
      .catch((error) => console.log(error));
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Task 9</h1>

      <hr />

      <h2>Counter App</h2>

      <h3>{count}</h3>

      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>

      <button
        onClick={() => setCount(count - 1)}
        style={{ marginLeft: "10px" }}
      >
        Decrement
      </button>

      <button
        onClick={() => setCount(0)}
        style={{ marginLeft: "10px" }}
      >
        Reset
      </button>

      <hr />

      <h2>Posts from JSONPlaceholder API</h2>

      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "8px"
          }}
        >
          <h3>{post.title}</h3>

          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}

export default App;