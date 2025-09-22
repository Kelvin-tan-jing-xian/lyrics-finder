import { useEffect, useState } from 'react';
import axios from 'axios';

const ApiCaller = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    track_name: '她说',
    artist_name: '林俊杰'
  });

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
    // Fetch initial data on component mount
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
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
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Track Name:
            </label>
            <input
              type="text"
              name="track_name"
              value={searchParams.track_name}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter track name"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Artist Name:
            </label>
            <input
              type="text"
              name="artist_name"
              value={searchParams.artist_name}
              onChange={handleInputChange}
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

      {/* Results */}
      {response && !loading && (
        <div>
          {/* Song Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: '#f1f4f7ff', marginBottom: '5px' }}>{response?.name}</h2>
            <p style={{ color: '#7f8c8d', fontSize: '18px', margin: 0 }}>
              by {response?.artistName}
            </p>
            {response?.albumName && (
              <p style={{ color: '#95a5a6', fontSize: '14px', marginTop: '5px' }}>
                Album: {response.albumName}
              </p>
            )}
          </div>

          {/* Lyrics Display */}
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

          {/* Song Metadata */}
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