import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader } from "lucide-react";
import { Client, Databases, Query } from "appwrite";

// Initialize Appwrite
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("YOUR_APPWRITE_PROJECT_ID"); // Replace with your project ID

const databases = new Databases(client);

const IndianStreamingPlatforms = ({ movie }) => {
  const platforms = {
    hotstar: {
      url: "https://www.hotstar.com/in",
      icon: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Disney%2B_Hotstar_logo.svg",
      name: "Disney+ Hotstar",
      color: "hover:bg-blue-900/20"
    },
    jiocinema: {
      url: "https://www.jiocinema.com",
      icon: "https://upload.wikimedia.org/wikipedia/commons/9/9c/JioCinema_Logo.svg",
      name: "Jio Cinema",
      color: "hover:bg-purple-900/20"
    },
    zee5: {
      url: "https://www.zee5.com",
      icon: "https://upload.wikimedia.org/wikipedia/commons/7/7a/ZEE5_logo.svg",
      name: "ZEE5",
      color: "hover:bg-indigo-900/20"
    },
    sonyliv: {
      url: "https://www.sonyliv.com",
      icon: "https://upload.wikimedia.org/wikipedia/commons/5/5a/SonyLIV_logo.svg",
      name: "SonyLIV",
      color: "hover:bg-red-900/20"
    },
    mxplayer: {
      url: "https://www.mxplayer.in",
      icon: "https://upload.wikimedia.org/wikipedia/commons/9/9c/MX_Player_logo.svg",
      name: "MX Player",
      color: "hover:bg-yellow-900/20"
    },
    voot: {
      url: "https://www.voot.com",
      icon: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Voot_logo.svg",
      name: "Voot",
      color: "hover:bg-pink-900/20"
    },
    erosnow: {
      url: "https://erosnow.com",
      icon: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Eros_Now_logo.svg",
      name: "Eros Now",
      color: "hover:bg-red-900/20"
    },
    altbalaji: {
      url: "https://www.altbalaji.com",
      icon: "https://upload.wikimedia.org/wikipedia/commons/9/9c/ALTBalaji_logo.svg",
      name: "ALTBalaji",
      color: "hover:bg-purple-900/20"
    }
  };

  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noAvailability, setNoAvailability] = useState(false);

  // Utility function to create slug from title
  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    const fetchStreamingAvailability = async () => {
      setIsLoading(true);
      setError(null);
      setNoAvailability(false);
      
      try {
        // First, try to get platform-specific IDs from Appwrite database
        const appwriteData = await fetchFromAppwrite(movie);
        
        // Use TMDB's watch providers endpoint for availability
        const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/watch/providers`,
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${TMDB_API_KEY}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch streaming availability');
        }
        
        const data = await response.json();
        
        // Check if we have India results
        if (data.results && data.results.IN) {
          const indiaProviders = data.results.IN;
          
          // Get available platforms with direct URLs where possible
          const available = processProviders(indiaProviders, movie, appwriteData);
          
          if (available.length > 0) {
            setAvailablePlatforms(available);
          } else {
            // No platforms found
            setNoAvailability(true);
          }
        } else {
          // If no India results found
          setNoAvailability(true);
        }
      } catch (error) {
        console.error('Error fetching streaming availability:', error);
        setError('Could not determine streaming availability');
        setNoAvailability(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (movie.id) {
      fetchStreamingAvailability();
    } else {
      setNoAvailability(true);
      setIsLoading(false);
    }
  }, [movie.id, movie.title]);

  // Fetch movie specific streaming data from Appwrite
  const fetchFromAppwrite = async (movie) => {
    try {
      // Query your Appwrite database for this specific movie
      const response = await databases.listDocuments(
        'YOUR_DATABASE_ID', // Replace with your database ID
        'streaming_links', // Replace with your collection ID
        [Query.equal('tmdb_id', movie.id)]
      );

      if (response.documents && response.documents.length > 0) {
        return response.documents[0]; // Return the first matching document
      }
      return null;
    } catch (error) {
      console.error('Error fetching from Appwrite:', error);
      return null;
    }
  };

  // Save data to Appwrite if admin adds platform-specific links
  const saveToAppwrite = async (movieId, platformData) => {
    try {
      // Check if entry exists
      const existingDocs = await databases.listDocuments(
        'YOUR_DATABASE_ID',
        'streaming_links',
        [Query.equal('tmdb_id', movieId)]
      );

      // If document exists, update it
      if (existingDocs.documents.length > 0) {
        const docId = existingDocs.documents[0].$id;
        await databases.updateDocument(
          'YOUR_DATABASE_ID',
          'streaming_links',
          docId,
          platformData
        );
      } else {
        // Otherwise create new document
        await databases.createDocument(
          'YOUR_DATABASE_ID',
          'streaming_links',
          'unique()',
          {
            tmdb_id: movieId,
            ...platformData
          }
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error saving to Appwrite:', error);
      return false;
    }
  };

  // Process providers and create direct links where possible
  const processProviders = (indiaProviders, movie, appwriteData) => {
    // Define platform data with correct URL patterns
    const platformMapping = {
      8: {
        key: 'netflix',
        name: "Netflix",
        directUrl: (movie, appwriteData) => {
          // Check if we have a Netflix ID in Appwrite data
          if (appwriteData && appwriteData.netflix_id) {
            return `https://www.netflix.com/title/${appwriteData.netflix_id}`;
          }
          return `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`;
        },
        icon: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
        color: "hover:bg-red-900/20"
      },
      9: {
        key: 'prime',
        name: "Prime Video",
        directUrl: (movie, appwriteData) => {
          // Check if we have an Amazon ID in Appwrite data
          if (appwriteData && appwriteData.prime_id) {
            return `https://www.primevideo.com/detail/${appwriteData.prime_id}`;
          }
          return `https://www.primevideo.com/search?k=${encodeURIComponent(movie.title)}`;
        },
        icon: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.svg",
        color: "hover:bg-blue-900/20"
      },
      122: {
        key: 'hotstar',
        name: "Disney+ Hotstar",
        directUrl: (movie, appwriteData) => {
          // Format: https://www.hotstar.com/in/movies/guardians-of-the-galaxy-vol-3/1260143699
          const slug = createSlug(movie.title);
          if (appwriteData && appwriteData.hotstar_id) {
            return `https://www.hotstar.com/in/movies/${slug}/${appwriteData.hotstar_id}`;
          }
          return `https://www.hotstar.com/in/search?q=${encodeURIComponent(movie.title)}`;
        },
        icon: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Disney%2B_Hotstar_logo.svg",
        color: "hover:bg-blue-900/20"
      },
      58: {
        key: 'zee5',
        name: "Zee5",
        directUrl: (movie, appwriteData) => {
          const slug = createSlug(movie.title);
          if (appwriteData && appwriteData.zee5_id) {
            return `https://www.zee5.com/movies/details/${slug}/${appwriteData.zee5_id}`;
          }
          return `https://www.zee5.com/search?q=${encodeURIComponent(movie.title)}`;
        },
        icon: "https://upload.wikimedia.org/wikipedia/commons/5/5a/ZEE5_logo.svg",
        color: "hover:bg-indigo-900/20"
      },
      67: {
        key: 'sonyliv',
        name: "SonyLIV",
        directUrl: (movie, appwriteData) => {
          const slug = createSlug(movie.title);
          if (appwriteData && appwriteData.sonyliv_id) {
            return `https://www.sonyliv.com/movies/${slug}-${appwriteData.sonyliv_id}`;
          }
          return `https://www.sonyliv.com/search?q=${encodeURIComponent(movie.title)}`;
        },
        icon: "https://upload.wikimedia.org/wikipedia/commons/5/5a/SonyLIV_logo.svg",
        color: "hover:bg-red-900/20"
      },
      190: {
        key: 'mxplayer',
        name: "MX Player",
        directUrl: (movie, appwriteData) => {
          const slug = createSlug(movie.title);
          if (appwriteData && appwriteData.mxplayer_id) {
            return `https://www.mxplayer.in/movie/${appwriteData.mxplayer_id}/${slug}`;
          }
          return `https://www.mxplayer.in/search?q=${encodeURIComponent(movie.title)}`;
        },
        icon: "https://upload.wikimedia.org/wikipedia/commons/9/9c/MX_Player_logo.svg",
        color: "hover:bg-yellow-900/20"
      }
    };
    
    // Extract all providers from different categories
    const allProviders = [
      ...(indiaProviders.flatrate || []),
      ...(indiaProviders.rent || []),
      ...(indiaProviders.buy || [])
    ];
    
    const availablePlatforms = [];
    
    // For each provider, check if it's in our mapping and create platform data
    allProviders.forEach(provider => {
      const platformInfo = platformMapping[provider.provider_id];
      
      if (platformInfo) {
        const platformData = {
          key: platformInfo.key,
          name: platformInfo.name,
          url: platformInfo.directUrl(movie, appwriteData),
          icon: platformInfo.icon,
          color: platformInfo.color,
          isDirectLink: appwriteData && appwriteData[`${platformInfo.key}_id`] ? true : false
        };
        
        // Only add if not already in the list
        if (!availablePlatforms.some(p => p.key === platformData.key)) {
          availablePlatforms.push(platformData);
        }
      }
    });
    
    return availablePlatforms;
  };

  // For admin UI to add platform IDs (optional)
  const AdminControls = ({ movie, isAdmin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
      netflix_id: '',
      prime_id: '',
      hotstar_id: '',
      zee5_id: '',
      sonyliv_id: '',
      mxplayer_id: ''
    });
    
    if (!isAdmin) return null;
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      const success = await saveToAppwrite(movie.id, formData);
      if (success) {
        setIsEditing(false);
        // Refresh component
        window.location.reload();
      }
    };
    
    return (
      <div className="mt-4 p-3 border border-gray-700 rounded-lg">
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-purple-700 text-white text-xs rounded-md"
          >
            Add Platform Links
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400">Netflix ID</label>
                <input 
                  type="text" 
                  value={formData.netflix_id}
                  onChange={(e) => setFormData({...formData, netflix_id: e.target.value})}
                  className="w-full bg-gray-800 px-2 py-1 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Prime Video ID</label>
                <input 
                  type="text" 
                  value={formData.prime_id}
                  onChange={(e) => setFormData({...formData, prime_id: e.target.value})}
                  className="w-full bg-gray-800 px-2 py-1 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Hotstar ID</label>
                <input 
                  type="text" 
                  value={formData.hotstar_id}
                  onChange={(e) => setFormData({...formData, hotstar_id: e.target.value})}
                  className="w-full bg-gray-800 px-2 py-1 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Zee5 ID</label>
                <input 
                  type="text" 
                  value={formData.zee5_id}
                  onChange={(e) => setFormData({...formData, zee5_id: e.target.value})}
                  className="w-full bg-gray-800 px-2 py-1 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">SonyLIV ID</label>
                <input 
                  type="text" 
                  value={formData.sonyliv_id}
                  onChange={(e) => setFormData({...formData, sonyliv_id: e.target.value})}
                  className="w-full bg-gray-800 px-2 py-1 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">MX Player ID</label>
                <input 
                  type="text" 
                  value={formData.mxplayer_id}
                  onChange={(e) => setFormData({...formData, mxplayer_id: e.target.value})}
                  className="w-full bg-gray-800 px-2 py-1 rounded text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-700 text-white text-xs rounded-md"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-3 py-1 bg-green-700 text-white text-xs rounded-md"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Loader className="animate-spin mx-auto h-6 w-6 text-purple-500 mb-2" />
        <p className="text-sm text-gray-400">Finding where to watch...</p>
      </div>
    );
  }

  // Show message when not available on any platform
  if (noAvailability) {
    return (
      <div className="text-center py-4 px-3 bg-gray-800/50 rounded-lg">
        <AlertCircle className="mx-auto h-6 w-6 text-yellow-500 mb-2" />
        <p className="text-sm text-gray-300 font-medium">Not yet available on streaming platforms</p>
        <p className="text-xs text-gray-400 mt-1">This movie will come soon on streaming platforms</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-3">
        Available on Streaming Platforms:
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {availablePlatforms.map(platform => (
          <motion.a
            key={platform.key}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex items-center justify-center p-2 bg-gray-800/50 rounded-lg ${platform.color} transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={platform.icon}
              alt={platform.name}
              className="h-8 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {platform.name} {platform.isDirectLink ? "(Direct)" : "(Search)"}
            </div>
          </motion.a>
        ))}
      </div>
      
      {/* Uncomment and add admin check logic if you want admin controls */}
      {/* <AdminControls movie={movie} isAdmin={yourAdminCheckLogic} /> */}
    </div>
  );
};

export default IndianStreamingPlatforms;