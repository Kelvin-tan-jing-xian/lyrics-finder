import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// You'll need to get a free API key from https://www.last.fm/api
const LAST_FM_API_KEY = import.meta.env.VITE_LAST_FM_API_KEY;
const LAST_FM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

const ApiCaller = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    track_name: '她说',
    artist_name: '林俊杰'
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);

  // Debounce function to avoid too many API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Fetch track suggestions from Last.fm API
  const fetchTrackSuggestions = async (artistName, trackQuery) => {
    if (!artistName.trim() || !trackQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setFetchingSuggestions(true);
      
      const url = `${LAST_FM_BASE_URL}?method=track.search&track=${encodeURIComponent(trackQuery)}&artist=${encodeURIComponent(artistName)}&api_key=${LAST_FM_API_KEY}&format=json&limit=12`;
      
      const result = await axios.get(url);
      
      if (result.data.results?.trackmatches?.track) {
        const tracks = result.data.results.trackmatches.track;
        const trackNames = tracks.map(track => track.name);
        setSuggestions(trackNames);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
    } finally {
      setFetchingSuggestions(false);
    }
  };

  // Debounced version of fetchTrackSuggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchTrackSuggestions, 300),
    []
  );

  // Fetch lyrics from LRC Library API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(searchParams.track_name)}&artist_name=${encodeURIComponent(searchParams.artist_name)}`;
      
      console.log('Making API call to:', apiUrl);
      
      const result = await axios.get(apiUrl);
      setResponse(result.data);
      console.log('API Response:', result.data);
      
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch lyrics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleArtistChange = (e) => {
    const { value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      artist_name: value
    }));

    // When artist changes, fetch new suggestions
    if (searchParams.track_name) {
      debouncedFetchSuggestions(value, searchParams.track_name);
    }
  };

  const handleTrackChange = (e) => {
    const { value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      track_name: value
    }));

    // Show suggestions and fetch from API
    setShowSuggestions(true);
    debouncedFetchSuggestions(searchParams.artist_name, value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchParams(prev => ({
      ...prev,
      track_name: suggestion
    }));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchData();
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        position: 'relative'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Search for Lyrics</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'black' }}>
              Artist Name:
            </label>
            <input
              type="text"
              name="artist_name"
              value={searchParams.artist_name}
              onChange={handleArtistChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter artist name"
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <label style={{ color: 'black', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Track Name:
            </label>
            <input
              type="text"
              name="track_name"
              value={searchParams.track_name}
              onChange={handleTrackChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={handleBlur}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter track name"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'black',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {fetchingSuggestions ? (
                  <div style={{ padding: '10px', color: '#666', textAlign: 'center' }}>
                    Loading suggestions...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        backgroundColor: 'white',
                        color: 'black',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    >
                      {suggestion}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '10px', color: '#666', textAlign: 'center' }}>
                    No suggestions found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Searching...' : 'Search Lyrics'}
        </button>
      </form>

      {/* Rest of the component remains the same */}
      {loading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: '#666'
        }}>
          <div>Loading lyrics...</div>
        </div>
      )}

      {error && (
        <div style={{ 
          color: '#d32f2f', 
          padding: '20px', 
          background: '#ffebee', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Error Loading Lyrics</h3>
          <p>{error}</p>
        </div>
      )}

      {response && !loading && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>{response?.name}</h2>
            <p style={{ color: '#7f8c8d', fontSize: '18px', margin: 0 }}>
              by {response?.artistName}
            </p>
            {response?.albumName && (
              <p style={{ color: '#95a5a6', fontSize: '14px', marginTop: '5px' }}>
                Album: {response.albumName}
              </p>
            )}
          </div>

          {response?.plainLyrics ? (
            <div style={{ 
              background: '#000000',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #333'
            }}>
              <div style={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: '1.8',
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
                textAlign: 'center'
              }}>
                {response.plainLyrics}
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#7f8c8d',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              No lyrics found for this song.
            </div>
          )}

          <div style={{ 
            marginTop: '30px', 
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#5a6c7d'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
              {response.duration && (
                <div>
                  <strong>Duration:</strong> {Math.floor(response.duration / 60)}:
                  {(response.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
              <div>
                <strong>Instrumental:</strong> {response.instrumental ? 'Yes' : 'No'}
              </div>
              {response.plainLyrics && (
                <div>
                  <strong>Lines:</strong> {response.plainLyrics.split('\n').filter(line => line.trim()).length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiCaller;