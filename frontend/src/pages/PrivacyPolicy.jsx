import { useEffect } from 'react';
import { ShieldCheck, Lock, Database } from 'lucide-react';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  // Ensure the page loads at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "April 2026";

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-screen pt-24 pb-20">
      <SEO 
        title="Privacy Policy | Fohow Eden Life Kenya"
        description="Learn how Fohow Eden Life collects, uses, and protects your personal data in accordance with the Kenya Data Protection Act, 2019."
        path="/privacy"
      />
      
      {/* ════════ HEADER ════════ */}
      <div className="bg-[#1a0504] py-16 px-6 text-center border-b-[4px] border-[#811816]">
        <div className="max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#2a0808] flex items-center justify-center mx-auto mb-6 border border-[#d2a356]/30">
            <ShieldCheck size={28} className="text-[#d2a356]" />
          </div>
          <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] font-light leading-[1.1] text-[#f7f4ef] mb-4">
            Privacy <em className="text-[#d2a356] italic">Policy</em>
          </h1>
          <p className="font-dm text-[0.9rem] font-light text-[#a0998e] tracking-widest uppercase">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* ════════ CONTENT ════════ */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 font-dm">
        
        {/* Intro */}
        <div className="mb-12">
          <p className="text-[1.05rem] leading-relaxed text-[#5a5648] font-light">
            At <strong className="text-[#811816] font-medium">Fohow Eden Life Kenya</strong>, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our B2B wholesale platform, make a purchase, or interact with our consultation services, in strict accordance with the <strong className="text-[#1c1a16]">Kenya Data Protection Act, 2019</strong>.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-10">
          <h2 className="font-garamond text-3xl text-[#1c1a16] mb-5 pb-2 border-b border-[#ede8df] flex items-center gap-3">
            <Database size={20} className="text-[#d2a356]" />
            1. Information We Collect
          </h2>
          <p className="text-[0.95rem] leading-relaxed text-[#5a5648] font-light mb-4">
            We collect data necessary to facilitate B2B wholesale transactions, logistics, and TCM consultations. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[0.95rem] text-[#5a5648] font-light">
            <li><strong className="text-[#1c1a16] font-medium">Identity Data:</strong> Full name, Clinic/Pharmacy name, and National ID (for order verification).</li>
            <li><strong className="text-[#1c1a16] font-medium">Contact Data:</strong> Delivery address (County, Town, exact location), email address, and WhatsApp/Phone numbers.</li>
            <li><strong className="text-[#1c1a16] font-medium">Financial Data:</strong> M-Pesa phone numbers and transaction receipt IDs (We do not store your PINs or banking passwords).</li>
            <li><strong className="text-[#1c1a16] font-medium">Professional Data:</strong> Fohow Franchise IDs (for B2B discount validation).</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="mb-10">
          <h2 className="font-garamond text-3xl text-[#1c1a16] mb-5 pb-2 border-b border-[#ede8df]">
            2. How We Use Your Data
          </h2>
          <p className="text-[0.95rem] leading-relaxed text-[#5a5648] font-light mb-4">
            We only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[0.95rem] text-[#5a5648] font-light">
            <li>To process and deliver your wholesale orders securely.</li>
            <li>To manage payments via Safaricom's Daraja API.</li>
            <li>To send critical logistical updates and clinical integration guides via WhatsApp.</li>
            <li>To schedule and prepare for physical or virtual TCM consultations.</li>
            <li>To prevent fraud and enforce our strict no-return policy on consumable goods.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="mb-10">
          <h2 className="font-garamond text-3xl text-[#1c1a16] mb-5 pb-2 border-b border-[#ede8df] flex items-center gap-3">
            <Lock size={20} className="text-[#d2a356]" />
            3. Data Security & Sharing
          </h2>
          <p className="text-[0.95rem] leading-relaxed text-[#5a5648] font-light mb-4">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. 
          </p>
          <p className="text-[0.95rem] leading-relaxed text-[#5a5648] font-light mb-4">
            <strong className="text-[#811816] font-medium">We do not sell your data.</strong> We may share your data with trusted third parties exclusively for operational purposes, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[0.95rem] text-[#5a5648] font-light">
            <li>Safaricom (for processing M-Pesa STK Push payments).</li>
            <li>Our verified logistics partners for nationwide delivery.</li>
            <li>The Office of the Data Protection Commissioner (ODPC) or law enforcement if legally required.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="mb-10">
          <h2 className="font-garamond text-3xl text-[#1c1a16] mb-5 pb-2 border-b border-[#ede8df]">
            4. Your Legal Rights
          </h2>
          <p className="text-[0.95rem] leading-relaxed text-[#5a5648] font-light mb-4">
            Under the Kenya Data Protection Act, you have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[0.95rem] text-[#5a5648] font-light">
            <li>Request access to your personal data.</li>
            <li>Request correction of the personal data that we hold about you.</li>
            <li>Request erasure of your personal data.</li>
            <li>Withdraw consent for marketing communications at any time.</li>
          </ul>
        </div>

        {/* Section 5 (Contact) */}
        <div className="bg-[#fcfbf9] border border-[#ede8df] rounded-3xl p-8 mt-12 text-center">
          <h3 className="font-garamond text-2xl text-[#1c1a16] mb-3">Contact the Data Controller</h3>
          <p className="text-[0.9rem] leading-relaxed text-[#5a5648] font-light mb-6">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <div className="inline-flex flex-col text-left gap-1">
            <p className="text-[0.9rem] font-bold text-[#811816]">Fohow Eden Life</p>
            <p className="text-[0.85rem] text-[#5a5648]">Cargen House, Suite M203, Harambee Ave, Nairobi</p>
            <p className="text-[0.85rem] text-[#5a5648]">Email: <a href="mailto:edenlife29@gmail.com" className="text-[#d2a356] hover:underline">edenlife29@gmail.com</a></p>
            <p className="text-[0.85rem] text-[#5a5648]">Phone: <a href="tel:+254793055015" className="text-[#d2a356] hover:underline">0793 055 015</a></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
