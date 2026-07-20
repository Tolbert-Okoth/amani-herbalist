import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, ArrowDownToLine, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Resources = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents');
        if (response.ok && response.data) {
          const allDocs = Array.isArray(response.data) ? response.data : [];
          setDocuments(allDocs.filter(doc => doc.is_published));
        } else {
          setError('Failed to load resources.');
        }
      } catch (err) {
        setError('Error connecting to the server.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (doc.excerpt && doc.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-24 font-dm">
      
      {/* ═════════ PREMIUM HERO SECTION ═════════ */}
      <div className="relative bg-[#1a0504] pt-28 pb-20 px-6 overflow-hidden">
        {/* Deep, rich glowing orbs for that premium feel */}
        <div className="absolute top-[-30%] right-[-10%] w-[50vw] max-w-[600px] aspect-square rounded-full bg-[#811816] opacity-30 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[40vw] max-w-[500px] aspect-square rounded-full bg-[#d2a356] opacity-15 blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-2xl">
            <ArrowDownToLine className="w-8 h-8 text-[#d2a356]" />
          </div>
          
          <h1 className="font-garamond text-5xl md:text-6xl lg:text-7xl font-medium text-[#f7f4ef] mb-6 tracking-tight">
            Resource <span className="text-[#d2a356] italic pr-2">Center</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#e8d5d5] max-w-2xl leading-relaxed opacity-90 mb-10">
            Access our exclusive library of clinical guides, marketing materials, and technical documentation to elevate your practice.
          </p>

          {/* Search Bar matching the premium dark theme */}
          <div className="w-full max-w-xl relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#a0998e] group-focus-within:text-[#d2a356] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search guides, forms, or materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-full py-4 pl-14 pr-6 text-[#f7f4ef] placeholder-[#a0998e] outline-none focus:border-[#d2a356] focus:bg-white/15 focus:ring-4 focus:ring-[#d2a356]/10 transition-all shadow-lg backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* ═════════ MAIN CONTENT GRID ═════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        
        {loading ? (
          <div className="flex justify-center items-center py-32 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
            <Loader2 className="w-10 h-10 text-[#811816] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 text-red-600">
            {error}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-4 border border-stone-100">
              <FileText className="w-10 h-10 text-stone-300" />
            </div>
            <p className="text-stone-500 font-medium text-lg">No documents found.</p>
            <p className="text-sm text-stone-400 mt-2">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 transition-all duration-300">
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id} 
                className="w-full sm:w-[340px] shrink-0 bg-white rounded-[2rem] p-8 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fdf8ef] to-[#f8eecd] flex items-center justify-center text-[#d2a356] shrink-0 border border-[#d2a356]/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <FileText size={26} strokeWidth={1.5} />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-garamond font-bold text-2xl text-[#1a0504] group-hover:text-[#811816] transition-colors leading-tight mb-1.5">{doc.title}</h3>
                      <div className="text-xs text-stone-400 font-medium tracking-wide uppercase">
                        Added {new Date(doc.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {doc.excerpt ? (
                    <p className="text-sm text-stone-600 mb-8 leading-relaxed line-clamp-3">
                      {doc.excerpt}
                    </p>
                  ) : (
                    <div className="mb-8"></div>
                  )}
                </div>
                
                <a 
                  href={(() => {
                    let url = api.getImageUrl(doc.file_url);
                    if (!url) return '#';
                    
                    // Cloudinary raw/image fix: Force download and assign an extension if missing
                    if (url.includes('res.cloudinary.com')) {
                      const hasExtension = /\.[a-zA-Z0-9]{3,4}$/.test(url);
                      if (!hasExtension) {
                        // Guess extension based on title, default to .ppt since that's the most common B2B resource missing it
                        const ext = doc.title.toLowerCase().includes('pdf') ? 'pdf' : 'ppt';
                        const safeName = doc.title.replace(/[^a-zA-Z0-9]/g, '_');
                        url = url.replace('/upload/', `/upload/fl_attachment:${safeName}.${ext}/`);
                      } else {
                        url = url.replace('/upload/', `/upload/fl_attachment/`);
                      }
                    }
                    return url;
                  })()} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center w-full py-3.5 px-4 bg-stone-50 text-[#1a0504] font-bold text-sm rounded-xl hover:bg-[#811816] hover:text-[#f7f4ef] hover:shadow-lg transition-all duration-300 gap-2 border border-stone-200 hover:border-transparent group/btn"
                >
                  <Download size={18} className="text-stone-400 group-hover/btn:text-[#d2a356] transition-colors" /> 
                  Download Resource
                </a>
              </div>
            ))}

            {/* ════════ DYNAMIC INJECTION (FILLER BLOCK) ════════ */}
            <div className="w-full sm:w-[340px] shrink-0 bg-[#1a0504] rounded-[2rem] p-8 border border-[#811816]/30 shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-col justify-center items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(129,24,22,0.2)] relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-20%] w-[150px] aspect-square rounded-full bg-[#811816] opacity-30 blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
              
              <div className="w-14 h-14 rounded-2xl bg-[#fdf8ef] flex items-center justify-center text-[#811816] mb-5 border border-[#d2a356]/40 shadow-inner z-10">
                <Search size={24} />
              </div>
              <h3 className="font-garamond font-bold text-2xl text-[#f7f4ef] leading-tight mb-3 z-10">
                Need a specific protocol?
              </h3>
              <p className="text-sm text-[#e8d5d5] mb-8 leading-relaxed z-10">
                Can't find the clinical document you are looking for? Contact our TCM experts for custom formulations.
              </p>
              <Link to="/consultations" className="w-full py-3.5 px-4 bg-[#d2a356] text-[#1a0504] font-bold text-sm rounded-xl hover:bg-[#e0b772] transition-colors z-10">
                Request Document
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
