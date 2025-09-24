import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// Mock data for track recommendations (you can expand this)
const ARTIST_TRACKS = {
  '林俊杰': ['她说', '修炼爱情', '不为谁而作的歌', '曹操', '江南', 
            '一千年以后', '背对背拥抱', '小酒窝', '学不会', 
            '那些你很冒险的梦','西界','可惜没如果','黑暗骑士','醉赤壁',
            '美人鱼','豆浆油条','伟大的渺小','圣所','因你而在','故事细腻',
            '不潮不用花钱','手心的蔷薇','当你','心墙','我还想她', 
            '编号89757','翅膀','爱与希望','爱笑的眼睛','不死之身','零度的亲吻',
            '对的时间点','加油','我很想爱他'
            ],
  '周杰伦': ['七里香', '青花瓷', '简单爱', '双截棍', '夜曲', '晴天', '以父之名', '稻香', '告白气球', '听妈妈的话'],
  'taylor swift': ['Love Story', 'Shake It Off', 'Blank Space', 'Bad Blood', 'You Belong With Me', 'Look What You Made Me Do', 'Cardigan', 'Willow', 'Anti-Hero'],
  'default': ['Popular Song 1', 'Popular Song 2', 'Popular Song 3']
};

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

  useEffect(() => {
    fetchData();
  }, []);

  // Debounced search recommendations
  const getTrackSuggestions = useCallback((artistName, trackQuery) => {
    if (!artistName.trim() || !trackQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const artistTracks = ARTIST_TRACKS[artistName] || ARTIST_TRACKS.default || [];
    
    const filteredSuggestions = artistTracks.filter(track =>
      track.toLowerCase().includes(trackQuery.toLowerCase())
    );
    
    setSuggestions(filteredSuggestions.slice(0, 5)); // Show top 5 results
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));

    // If track_name is being typed, show suggestions
    if (name === 'track_name') {
      setShowSuggestions(true);
      getTrackSuggestions(searchParams.artist_name, value);
    }
  };

  const handleArtistChange = (e) => {
    const { value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      artist_name: value
    }));

    // When artist changes, update track suggestions based on new artist
    if (searchParams.track_name) {
      getTrackSuggestions(value, searchParams.track_name);
    }
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
    // Hide suggestions after a short delay to allow clicking on them
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
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
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
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Track Name:
            </label>
            <input
              type="text"
              name="track_name"
              value={searchParams.track_name}
              onChange={handleInputChange}
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
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                color: 'black',
                backgroundColor: 'black',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      backgroundColor: '#f8f9fa',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  >
                    {suggestion}
                  </div>
                ))}
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
            <h2 style={{ color: '#eff3f7ff', marginBottom: '5px' }}>{response?.name}</h2>
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