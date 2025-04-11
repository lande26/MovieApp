// import React from 'react'

// const Search = ({searchTerm,setSearchTerm}) => {
//   return (
//     <div className='search'>
//         <div>
//             <img src="search.svg" alt="search" />
//             <input 
//                 type="text"
//                 placeholder='Search for Movies, Shows and more' 
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}  
//             />
//         </div>
//     </div>
//   )
// }

// export default Search

import React from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Search = ({ searchTerm, setSearchTerm }) => {
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <motion.div 
      className="search max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon size={20} className="text-gray-400" />
        </div>
        
        <input
          type="text"
          placeholder="Search for Movies, Shows and more"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-12 py-4 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700 text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          autoFocus
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
  );
};

export default Search;