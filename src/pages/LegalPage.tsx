import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'refund' | 'cancellation' | 'shipping';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const navigate = useNavigate();
  
  const getPageTitle = () => {
    switch (type) {
      case 'privacy': return 'Privacy Policy';
      case 'terms': return 'Terms & Conditions';
      case 'refund': return 'Return & Refund Policy';
      case 'cancellation': return 'Cancellation Policy';
      case 'shipping': return 'Shipping Policy';
      default: return 'Legal Policy';
    }
  };

  const getPageDescription = () => {
    switch (type) {
      case 'privacy': return 'Our commitment to protecting your personal data.';
      case 'terms': return 'The terms and conditions for using TOLETBRO services.';
      case 'refund': return 'Information about returns and refunds for our products and services.';
      case 'cancellation': return 'Our policy regarding service and order cancellations.';
      case 'shipping': return 'Shipping and delivery information for physical products.';
      default: return 'Legal information and policies.';
    }
  };

  const tradeName = "TOLETBRO";
  const legalName = "ToletBro Technologies";
  const registeredAddress = "Plot No.34, Central Bank Colony, LB Nagar, Hyderabad, Telangana, Pin code : 500074.";

  return (
    <div className="min-h-screen bg-white py-20 px-6 text-black">
      <SEO 
        title={`${getPageTitle()} | ${tradeName}`}
        description={getPageDescription()}
      />
      
      <div className="mx-auto max-w-4xl">
        <button 
          onClick={() => navigate(-1)}
          className="mb-12 flex items-center gap-2 text-sm font-bold hover:underline"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="border-b border-black pb-8">
            <h1 className="text-4xl font-bold tracking-tighter md:text-7xl">
              {getPageTitle().split(' ')[0]} <span className="italic">{getPageTitle().split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="mt-4 text-sm font-medium uppercase tracking-widest text-gray-500">Last updated: April 02, 2026</p>
          </div>

          <div className="prose prose-neutral max-w-none space-y-12 text-base leading-relaxed text-gray-800 md:text-lg">
            {type === 'terms' && (
              <>
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">1. Acceptance of Terms</h2>
                  <p>This website is operated by <strong>{tradeName}</strong>. Throughout the site, the terms “we”, “us” and “our” refer to {tradeName}. {tradeName} offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
                  <p>By accessing or using {tradeName}, you agree to be bound by these Terms & Conditions, all applicable laws and regulations in India, and agree that you are responsible for compliance with any applicable local laws.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">2. Use License</h2>
                  <p>Permission is granted to temporarily download one copy of the materials (information or software) on {tradeName}'s website for personal, non-commercial transitory viewing only.</p>
                  <p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by {tradeName} at any time.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">3. Disclaimer</h2>
                  <p>The materials on {tradeName}'s website are provided on an 'as is' basis. {tradeName} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">4. Property Listings</h2>
                  <p>Property owners are solely responsible for the accuracy and legality of their listings. {tradeName} does not verify the ownership of properties or the truthfulness of descriptions. Users are advised to perform their own due diligence before entering into any rental agreement.</p>
                  <p>Fake listings, duplicate listings, or listings with misleading information will be removed without notice, and the user account may be suspended.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">5. Prohibited Activities</h2>
                  <p>You agree not to engage in any of the following prohibited activities:</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li>Copying, distributing, or disclosing any part of the Service in any medium.</li>
                    <li>Using any automated system, including "robots," "spiders," or "offline readers," to access the Service.</li>
                    <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service.</li>
                    <li>Taking any action that imposes an unreasonable or disproportionately large load on our infrastructure.</li>
                    <li>Uploading invalid data, viruses, worms, or other software agents through the Service.</li>
                  </ul>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">6. Products and Services</h2>
                  <p>We offer various products and services including:</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li><strong>Smart Tolet Boards:</strong> Physical QR-enabled boards for property visibility. Price: ₹499 - ₹999 (inclusive of taxes).</li>
                    <li><strong>Promote Option:</strong> Featured listing services to increase property visibility. Price: ₹199 - ₹499 per listing.</li>
                    <li><strong>Premium Features:</strong> Advanced dashboard tools and analytics for owners. Price: ₹99 - ₹299 per month.</li>
                  </ul>
                  <p>All prices are in Indian Rupees (INR). We reserve the right to modify prices at any time without prior notice.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">7. Limitation of Liability</h2>
                  <p>In no event shall {tradeName} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on {tradeName}'s website.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">8. Governing Law</h2>
                  <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in Hyderabad, Telangana.</p>
                </section>
              </>
            )}

            {type === 'privacy' && (
              <>
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">1. Information We Collect</h2>
                  <p>We collect information that you provide directly to us when you use our services. This includes:</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li><strong>Personal Information:</strong> Name, email address, phone number, and profile picture when you register.</li>
                    <li><strong>Property Information:</strong> Address, photos, pricing, and descriptions of properties you list.</li>
                    <li><strong>Location Data:</strong> We collect precise or approximate location information from your mobile device if you grant us permission.</li>
                    <li><strong>Usage Data:</strong> Information about how you interact with our platform, including search queries and pages visited.</li>
                  </ul>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">2. How We Use Your Information</h2>
                  <p>We use the collected information for various purposes, including:</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li>To provide and maintain our Service, including connecting tenants with property owners.</li>
                    <li>To notify you about changes to our Service or new property listings.</li>
                    <li>To provide customer support and gather analysis or valuable information to improve our Service.</li>
                    <li>To monitor the usage of our Service and detect, prevent, and address technical issues.</li>
                  </ul>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">3. Sharing of Information</h2>
                  <p>We may share your information in the following situations:</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li><strong>With Other Users:</strong> When you express interest in a property or list a property, certain information (like your name and phone number) may be shared with the other party to facilitate the rental process.</li>
                    <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
                  </ul>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">4. Cookies and Tracking Technologies</h2>
                  <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
                  <p>We use cookies for various purposes, including:</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li><strong>Essential Cookies:</strong> Necessary for the operation of our platform.</li>
                    <li><strong>Analytics Cookies:</strong> To understand how users interact with our site.</li>
                    <li><strong>Advertising Cookies:</strong> We use third-party vendors, including Google, who use cookies to serve ads based on a user's prior visits to our website or other websites.</li>
                  </ul>
                  <p>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet. Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand underline">Google Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="http://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-brand underline">www.aboutads.info</a>.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">5. Data Security</h2>
                  <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">6. Your Data Rights</h2>
                  <p>Under Indian data protection laws, you have the right to access, update, or delete the information we have on you. You can perform these actions within your account settings or by contacting us.</p>
                </section>
              </>
            )}

            {type === 'refund' && (
              <>
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">1. Return and Refund Policy</h2>
                  <p>At {tradeName}, we strive to ensure your satisfaction with our products and services. Please read our refund policy carefully.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">2. Physical Products (Smart Tolet Boards)</h2>
                  <p>If you receive a damaged or defective Smart Tolet Board, you are eligible for a replacement or refund.</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li><strong>Duration:</strong> You must report the issue within 7 days of delivery.</li>
                    <li><strong>Refund Mode:</strong> Refunds will be processed to the original payment method within 5-7 working days after we receive and inspect the returned item.</li>
                  </ul>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">3. Digital Services (Promote & Premium)</h2>
                  <p>Payments for digital services like property promotion or premium dashboard features are generally non-refundable once the service has been activated.</p>
                  <p>If you face technical issues where the service was not rendered despite payment, please contact us within 48 hours for a resolution or refund.</p>
                </section>
              </>
            )}

            {type === 'cancellation' && (
              <>
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">1. Cancellation Policy</h2>
                  <p>We understand that plans can change. Here is our policy regarding cancellations.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">2. Order Cancellations</h2>
                  <p>For physical products like Smart Tolet Boards, you can cancel your order before it is shipped.</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li><strong>Duration:</strong> Cancellations are accepted within 24 hours of placing the order or until the order is marked as "Shipped", whichever is earlier.</li>
                  </ul>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">3. Service Cancellations</h2>
                  <p>Subscription-based premium features can be cancelled at any time from your profile settings. The cancellation will take effect at the end of the current billing cycle.</p>
                </section>
              </>
            )}

            {type === 'shipping' && (
              <>
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">1. Shipping Policy</h2>
                  <p>We deliver our physical products (Smart Tolet Boards) across India.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">2. Delivery Timeline</h2>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li><strong>Processing Time:</strong> Orders are processed within 1-2 business days.</li>
                    <li><strong>Shipping Duration:</strong> Standard delivery takes 3-7 business days depending on your location.</li>
                  </ul>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-black md:text-3xl">3. Shipping Charges</h2>
                  <p>Shipping charges are calculated at checkout based on your delivery address. We may offer free shipping on certain order values as specified on the website.</p>
                </section>
              </>
            )}
          </div>

          <div className="mt-20 border-t border-black pt-12">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Legal Information</p>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold md:text-xl">{legalName}</p>
              <p className="text-gray-600"><strong>Trade Name:</strong> {tradeName}</p>
              <p className="text-gray-600"><strong>Registered Address:</strong> {registeredAddress}</p>
              <p className="text-gray-600"><strong>Email:</strong> support@toletbro.com</p>
              <p className="text-gray-600"><strong>Phone:</strong> +91 8500482405</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

