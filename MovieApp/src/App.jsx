import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Tv, TrendingUp, Search as SearchIcon, X, Loader } from 'lucide-react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'trending'

  // Debounce the search term to prevent making too many API requests
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setErrorMessage('No movies found');
        setMovieList([]);
        return;
      }

      setMovieList(data.results);

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
      setMovieList([]);
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies || []);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
      setTrendingMovies([]);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Animated background pattern */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        <div className="pattern"></div>
      </div>

      <div className="wrapper max-w-7xl mx-auto px-4 py-8 relative z-10">
        <motion.header 
          className="text-center mb-12 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.img 
            src="./hero.png" 
            alt="Hero Banner" 
            className="mx-auto mb-8 drop-shadow-2xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 15 
            }}
          />
          
          <motion.h1 
            className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Find Movies You'll Love
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="relative max-w-3xl mx-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <SearchIcon size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for Movies, Shows and more"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-12 py-4 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.header>
        
        {/* Tabs */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <div className="inline-flex items-center bg-gray-800/30 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'all' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Film size={16} className="mr-2" />
              All Movies
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'trending' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <TrendingUp size={16} className="mr-2" />
              Trending
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'trending' && trendingMovies.length > 0 ? (
            <motion.section 
              key="trending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="trending mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  <span className="mr-2">🔥</span>
                  Trending Movies
                </h2>
              </div>

              <div className="relative">
                <ul className="flex overflow-x-auto gap-5 pb-8 scroll-smooth">
                  {trendingMovies.map((movie, index) => (
                    <motion.li 
                      key={movie.$id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex-shrink-0 relative"
                    >
                      <div className="relative">
                        <p className="absolute -top-6 left-0 text-5xl font-bold opacity-20 text-purple-500">
                          {index + 1}
                        </p>
                        <img 
                          src={movie.poster_url} 
                          alt={movie.title} 
                          className="w-48 h-72 object-cover rounded-xl shadow-lg hover:shadow-purple-900/20 hover:shadow-xl transition-all cursor-pointer"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 rounded-b-xl">
                          <p className="font-medium text-sm line-clamp-1">{movie.title}</p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                
                <div className="absolute right-0 bottom-0 w-24 h-8 bg-gradient-to-l from-gray-900 to-transparent"></div>
              </div>
            </motion.section>
          ) : activeTab === 'all' ? (
            <motion.section 
              key="all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="all-movies"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Tv size={20} className="mr-2 text-purple-400" />
                  {searchTerm ? 'Search Results' : 'Popular Movies'}
                </h2>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size={36} className="animate-spin text-purple-500" />
                </div>
              ) : errorMessage ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-red-400 mb-2">{errorMessage}</p>
                  <button 
                    onClick={() => fetchMovies()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 transition-colors mt-4"
                  >
                    Show Popular Movies
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </motion.div>
              )}
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  )
}

export default App