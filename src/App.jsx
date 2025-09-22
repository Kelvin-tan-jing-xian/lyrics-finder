import ApiCaller from './components/ApiCaller';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Kelvin's Lyrics Finder</h1>
        {/* <p>Calling API: https://lrclib.net/api/get?track_name=她说&artist_name=林俊杰</p> */}
      </header>
      <main>
        <ApiCaller />
      </main>
    </div>
  );
}

export default App;