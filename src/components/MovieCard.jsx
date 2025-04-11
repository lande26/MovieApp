// import React, { useState } from 'react'
// import IndianStreamingPlatforms from './IndianStreamingPlatforms'

// const MovieCard = ({ movie }) => {
//   const [showDetails, setShowDetails] = useState(false);
//   const { title, vote_average, poster_path, release_date, original_language, id } = movie;

//   return (
//     <div 
//       className="movie-card cursor-pointer transition-transform hover:scale-105"
//       onClick={() => setShowDetails(!showDetails)}
//     >
//       <img
//         src={poster_path ?
//           `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
//         alt={title}
//         className="w-full h-auto rounded-t-lg"
//       />

//       <div className="p-4">
//         <h3 className="text-lg font-semibold">{title}</h3>

//         <div className="content flex items-center gap-2 mt-2">
//           <div className="rating flex items-center gap-1">
//             <img src="star.svg" alt="Star Icon" className="w-4 h-4" />
//             <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
//           </div>

//           <span>•</span>
//           <p className="lang uppercase">{original_language}</p>

//           <span>•</span>
//           <p className="year">
//             {release_date ? release_date.split('-')[0] : 'N/A'}
//           </p>
//         </div>

//         {showDetails && (
//           <div className="mt-4">
//             <IndianStreamingPlatforms movie={movie} />
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default MovieCard

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronDown, ChevronUp, Globe, Calendar } from 'lucide-react';
import IndianStreamingPlatforms from './IndianStreamingPlatforms';

const MovieCard = ({ movie }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { title, vote_average, poster_path, release_date, original_language, id, overview } = movie;
  
  const truncatedOverview = overview?.length > 100 
    ? overview.substring(0, 100) + '...' 
    : overview;

  return (
    <motion.div
      className="movie-card rounded-xl overflow-hidden bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 shadow-lg border border-gray-700/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      layout
    >
      <div className="relative group cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
        <div className="aspect-[2/3] overflow-hidden">
          <motion.img
            src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-sm text-gray-200 font-light line-clamp-3">{truncatedOverview}</p>
            </div>
          </div>
        </div>
        
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star size={14} className="text-yellow-400" fill="currentColor" />
            <p className="text-white text-sm font-medium">{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-2 mt-2 text-gray-300">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <p>{release_date ? release_date.split('-')[0] : 'N/A'}</p>
          </div>
          
          <span>•</span>
          
          <div className="flex items-center gap-1">
            <Globe size={14} />
            <p className="uppercase">{original_language}</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-3 flex items-center justify-center gap-1 py-2 text-sm font-medium bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
        >
          {showDetails ? (
            <>Hide Details <ChevronUp size={16} /></>
          ) : (
            <>Show Details <ChevronDown size={16} /></>
          )}
        </button>
      </div>
      
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: showDetails ? 'auto' : 0,
          opacity: showDetails ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden bg-gray-900/50"
      >
        <div className="p-4">
          <IndianStreamingPlatforms movie={movie} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default MovieCard;