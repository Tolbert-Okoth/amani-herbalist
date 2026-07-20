import { useState, useEffect } from 'react';
import { Calendar, User, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import api from '../api';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';

/* ── robust fade-up hook ── */
const useInView = (threshold = 0.08) => {
  const [visible, setVisible] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    if (!element) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(element);
    return () => obs.disconnect();
  }, [element, threshold]);

  return [setElement, visible];
};

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState(null);

  const [headerRef, headerVisible] = useInView(0.05);
  const [gridRef, gridVisible] = useInView(0.04);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const response = await api.get('/blogs');
        if (response.data) {
          // ONLY show articles that the admin has marked as 'Published'
          const publishedBlogs = response.data.filter(blog => blog.is_published);
          setBlogs(publishedBlogs);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // ══════════════════════════════════
  //  FULL ARTICLE VIEW
  // ══════════════════════════════════
  if (activeArticle) {
    return (
      <div className="font-garamond min-h-screen bg-[#f7f4ef] pt-24 pb-24 px-6 animate-in fade-in duration-500">
        <SEO 
          title={activeArticle.title}
          description={activeArticle.content.substring(0, 160).replace(/(<([^>]+)>)/gi, "")}
          path={`/blog?article=${activeArticle.id}`}
          type="article"
          image={activeArticle.image_url ? api.getImageUrl(activeArticle.image_url) : undefined}
        />
        <div className="max-w-3xl mx-auto">

          <button
            onClick={() => setActiveArticle(null)}
            className="font-dm flex items-center text-[#811816] text-sm font-medium mb-10 hover:text-[#d2a356] hover:drop-shadow-[0_0_4px_rgba(210,163,86,0.4)] transition-all duration-300"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Journal
          </button>

          {/* Article Hero Image */}
          <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-[#f0ece3] rounded-[2rem] overflow-hidden mb-12 border border-[#ede8df] shadow-sm">
            {activeArticle.image_url ? (
              <img
                src={api.getImageUrl(activeArticle.image_url)}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#fcf5f5] text-[#811816]/30">
                <BookOpen className="w-20 h-20" strokeWidth={1} />
              </div>
            )}
          </div>

          {/* Article Header */}
          <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] font-light text-[#1c1a16] leading-[1.1] mb-6">
            {activeArticle.title}
          </h1>

          <div className="font-dm flex flex-wrap items-center gap-6 text-[0.85rem] text-[#8a8070] font-medium mb-12 pb-10 border-b border-[#ede8df]">
            <span className="flex items-center">
              <User size={15} className="mr-2 text-[#d2a356]" />
              {activeArticle.author || 'Fohow Eden Life Team'}
            </span>
            <span className="flex items-center">
              <Calendar size={15} className="mr-2 text-[#d2a356]" />
              {new Date(activeArticle.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Article Content - Selection color customized to brand Maroon! */}
          <div 
            className="prose prose-lg max-w-none text-[#5a5648] font-light leading-[1.85] whitespace-pre-wrap selection:bg-[#811816] selection:text-[#f7f4ef]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeArticle.content) }}
          />

        </div>
      </div>
    );
  }

  // ══════════════════════════════════
  //  BLOG LIST VIEW (THE JOURNAL)
  // ══════════════════════════════════
  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-[100svh] overflow-x-hidden">
      <SEO 
        title="The TCM Journal | Fohow Eden Life Blog"
        description="Clinical insights, seasonal prescribing guides, and TCM knowledge for health practitioners and Fohow distributors in Kenya."
        path="/blog"
      />

      {/* Header */}
      <section ref={headerRef} className="px-6 pt-24 pb-12 md:pt-32 md:pb-16 text-center max-w-4xl mx-auto">
        <div className={`fade-up ${headerVisible ? 'in' : ''}`}>
          <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#d2a356] mb-4 flex items-center justify-center gap-3 drop-shadow-[0_0_2px_rgba(210,163,86,0.2)]">
            <span className="w-6 h-[1px] bg-[#d2a356] inline-block" /> Clinical Insights <span className="w-6 h-[1px] bg-[#d2a356] inline-block" />
          </p>
          <h1 className="text-[clamp(2.8rem,5vw,4.5rem)] font-light leading-[1.08] tracking-[-0.01em] text-[#1c1a16] mb-6">
            The TCM <em className="text-[#811816] italic">Journal.</em>
          </h1>
          <p className="font-dm text-[1rem] font-light leading-relaxed text-[#5a5648] max-w-2xl mx-auto">
            Discover the ancient science behind our formulations, seasonal prescribing guides for the Kenyan climate, and clinical B2B strategies.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section ref={gridRef} className="px-6 pb-24 max-w-7xl mx-auto">
        {loading ? (
          <div className="font-dm flex items-center justify-center py-20 text-[#8a8070] gap-3">
            <div className="w-6 h-6 border-2 border-[#e0d8cc] border-t-[#811816] rounded-full animate-spin" />
            Loading the journal…
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-[#c8b89a] rounded-[2rem] shadow-sm max-w-3xl mx-auto">
            <BookOpen size={40} className="mx-auto mb-4 text-[#d2a356]" strokeWidth={1.5} />
            <p className="text-2xl font-light text-[#1c1a16] mb-2">The ink is still drying.</p>
            <p className="font-dm text-[0.9rem] font-light text-[#8a8070]">No articles have been published yet. Check back soon!</p>
          </div>
        ) : (
          /* AUTO-FIT GRID: Stretches items to fill white space! */
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 md:gap-8">
            {blogs.map((blog, i) => (
              <div
                key={blog.id}
                className={`bg-white rounded-[2rem] overflow-hidden border border-[#ede8df] shadow-sm hover:shadow-[0_24px_50px_-12px_rgba(129,24,22,0.08)] hover:border-[#d2a356]/30 hover:-translate-y-1.5 transition-all duration-500 flex flex-col cursor-pointer group fade-up ${gridVisible ? 'in' : ''}`}
                style={{ transitionDelay: `${Math.min((i % 4) + 1, 8) * 80}ms` }}
                onClick={() => setActiveArticle(blog)}
              >

                {/* Card Image */}
                <div className="w-full aspect-[16/10] md:aspect-[4/3] bg-[#f0ece3] overflow-hidden relative">
                  {blog.image_url ? (
                    <img
                      src={api.getImageUrl(blog.image_url)}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#fcf5f5] text-[#811816]/30">
                      <BookOpen size={48} strokeWidth={1} />
                    </div>
                  )}
                  {/* Category/Date Tag */}
                  <span className="font-dm absolute top-4 left-4 bg-[#f7f4ef]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[0.65rem] font-medium text-[#811816] tracking-[0.08em] uppercase border border-[#811816]/10">
                    {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-7 md:p-9 flex flex-col flex-1">
                  <h2 className="text-[1.4rem] font-medium text-[#1c1a16] leading-[1.3] mb-4 line-clamp-2 transition-colors group-hover:text-[#811816]">
                    {blog.title}
                  </h2>

                  <p className="font-dm text-[0.9rem] font-light text-[#5a5648] leading-[1.8] line-clamp-3 mb-8">
                    {blog.excerpt}
                  </p>

                  <div className="mt-auto pt-5 border-t border-[#ede8df]">
                    <span className="font-dm flex items-center text-[0.8rem] font-medium text-[#811816] uppercase tracking-[0.06em] transition-all group-hover:text-[#d2a356] group-hover:drop-shadow-[0_0_4px_rgba(210,163,86,0.4)] group-hover:gap-2">
                      Read Article <ArrowRight size={14} className="ml-1.5" />
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Blog;
