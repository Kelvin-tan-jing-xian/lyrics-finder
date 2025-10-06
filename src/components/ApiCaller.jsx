import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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
  
  // Separate states for track and artist suggestions
  const [trackSuggestions, setTrackSuggestions] = useState([]);
  const [artistSuggestions, setArtistSuggestions] = useState([]);
  const [showTrackSuggestions, setShowTrackSuggestions] = useState(false);
  const [showArtistSuggestions, setShowArtistSuggestions] = useState(false);
  const [fetchingTrackSuggestions, setFetchingTrackSuggestions] = useState(false);
  const [fetchingArtistSuggestions, setFetchingArtistSuggestions] = useState(false);

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Fetch artist suggestions from Last.fm API
  const fetchArtistSuggestions = async (artistQuery) => {
    if (!artistQuery.trim()) {
      setArtistSuggestions([]);
      return;
    }

    try {
      setFetchingArtistSuggestions(true);
      
      const url = `${LAST_FM_BASE_URL}?method=artist.search&artist=${encodeURIComponent(artistQuery)}&api_key=${LAST_FM_API_KEY}&format=json&limit=12`;
      
      const result = await axios.get(url);
      
      if (result.data.results?.artistmatches?.artist) {
        const artists = result.data.results.artistmatches.artist;
        const artistNames = artists.map(artist => artist.name);
        setArtistSuggestions(artistNames);
      } else {
        setArtistSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching artist suggestions:', err);
      setArtistSuggestions([]);
    } finally {
      setFetchingArtistSuggestions(false);
    }
  };

  // Fetch track suggestions from Last.fm API
  const fetchTrackSuggestions = async (artistName, trackQuery) => {
    if (!artistName.trim() || !trackQuery.trim()) {
      setTrackSuggestions([]);
      return;
    }

    try {
      setFetchingTrackSuggestions(true);
      
      const url = `${LAST_FM_BASE_URL}?method=track.search&track=${encodeURIComponent(trackQuery)}&artist=${encodeURIComponent(artistName)}&api_key=${LAST_FM_API_KEY}&format=json&limit=12`;
      
      const result = await axios.get(url);
      
      if (result.data.results?.trackmatches?.track) {
        const tracks = result.data.results.trackmatches.track;
        const trackNames = tracks.map(track => track.name);
        setTrackSuggestions(trackNames);
      } else {
        setTrackSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching track suggestions:', err);
      setTrackSuggestions([]);
    } finally {
      setFetchingTrackSuggestions(false);
    }
  };

  // Debounced versions
  const debouncedFetchArtistSuggestions = useCallback(
    debounce(fetchArtistSuggestions, 300),
    []
  );

  const debouncedFetchTrackSuggestions = useCallback(
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

    // Show suggestions and fetch from API
    setShowArtistSuggestions(true);
    debouncedFetchArtistSuggestions(value);
  };

  const handleTrackChange = (e) => {
    const { value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      track_name: value
    }));

    // Show suggestions and fetch from API
    setShowTrackSuggestions(true);
    debouncedFetchTrackSuggestions(searchParams.artist_name, value);
  };

  const handleArtistSuggestionClick = (suggestion) => {
    setSearchParams(prev => ({
      ...prev,
      artist_name: suggestion
    }));
    setShowArtistSuggestions(false);
    setArtistSuggestions([]);
  };

  const handleTrackSuggestionClick = (suggestion) => {
    setSearchParams(prev => ({
      ...prev,
      track_name: suggestion
    }));
    setShowTrackSuggestions(false);
    setTrackSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowTrackSuggestions(false);
    setShowArtistSuggestions(false);
    fetchData();
  };

  const handleArtistBlur = () => {
    setTimeout(() => {
      setShowArtistSuggestions(false);
    }, 200);
  };

  const handleTrackBlur = () => {
    setTimeout(() => {
      setShowTrackSuggestions(false);
    }, 200);
  };

  // Suggestion dropdown component to avoid repetition
  const SuggestionDropdown = ({ 
    show, 
    fetching, 
    suggestions, 
    onSuggestionClick,
    type = 'track'
  }) => {
    if (!show) return null;

    return (
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
        {fetching ? (
          <div style={{ padding: '10px', color: '#666', textAlign: 'center' }}>
            Loading {type} suggestions...
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                backgroundColor: '#f8f9fa',
                color:'black',
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
            No {type} suggestions found
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '8px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Search for Lyrics</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
          {/* Artist Input with Suggestions */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Artist Name:
            </label>
            <input
              type="text"
              name="artist_name"
              value={searchParams.artist_name}
              onChange={handleArtistChange}
              onFocus={() => setShowArtistSuggestions(true)}
              onBlur={handleArtistBlur}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter artist name"
            />
            
            <SuggestionDropdown
              show={showArtistSuggestions}
              fetching={fetchingArtistSuggestions}
              suggestions={artistSuggestions}
              onSuggestionClick={handleArtistSuggestionClick}
              type="artist"
            />
          </div>
          
          {/* Track Input with Suggestions */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Track Name:
            </label>
            <input
              type="text"
              name="track_name"
              value={searchParams.track_name}
              onChange={handleTrackChange}
              onFocus={() => setShowTrackSuggestions(true)}
              onBlur={handleTrackBlur}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter track name"
            />
            
            <SuggestionDropdown
              show={showTrackSuggestions}
              fetching={fetchingTrackSuggestions}
              suggestions={trackSuggestions}
              onSuggestionClick={handleTrackSuggestionClick}
              type="track"
            />
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