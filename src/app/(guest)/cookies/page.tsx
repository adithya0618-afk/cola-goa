import Link from 'next/link';
import { ShieldCheck, Info, Database, Clock, ArrowLeft } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 sm:px-12 lg:px-24 font-sans text-slate-800 tracking-tight">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
        
        {/* Header Section */}
        <div className="bg-slate-900 px-8 py-10 text-white relative">
          <Link href="/admin/login" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Login
          </Link>
          <div className="mt-6">
            <ShieldCheck className="text-orange-400 mb-4" size={48} />
            <h1 className="text-4xl font-extrabold tracking-tighter">Cookie Policy</h1>
            <p className="mt-2 text-slate-400 font-medium">How we manage your secure session.</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12 space-y-12 text-slate-600 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Info className="text-orange-500" size={24} /> 1. What are Cookies?
            </h2>
            <p className="text-justify font-medium">
              Cookies are small pieces of text sent by your web browser and stored on your device. They allow our website to recognize you and make your next visit easier and the service more useful to you.
            </p>
          </section>

          <section className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Lock className="text-orange-600" size={24} /> 2. Essential Cookies We Use
            </h2>
            <p className="mb-4 font-medium italic">Our platform only uses cookies for essential authentication tasks:</p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border h-fit"><Database size={20} className="text-orange-500" /></div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-none mb-1">Session Authentication (JWT)</h3>
                  <p className="text-sm">We use a "JSON Web Token" cookie to securely identify you and keep you logged in to the dashboard. Without this cookie, the dashboard cannot verify your identity.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border h-fit"><Clock size={20} className="text-orange-500" /></div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-none mb-1">Expiration</h3>
                  <p className="text-sm text-justify">These cookies are temporary and automatically expire after 12 hours of inactivity to keep your terminal secure.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. No Third-Party Tracking</h2>
            <p className="text-justify font-medium">
              We currently <strong>do not use any third-party tracking, advertising, or marketing cookies</strong>. Your browsing habits within our application are kept private to your resort stay management.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 underline underline-offset-8 decoration-orange-200 decoration-4">
              4. Future Analytics
            </h2>
            <p className="text-justify italic">
              In the future, we may introduce anonymized analytics to improve the performance of our staff portal. If we do, this policy will be updated with full details on how to opt-out.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-semibold tracking-tighter">© 2025 Cola Goa Resort. All Rights Reserved.</p>
            <div className="flex gap-6 text-sm font-semibold text-slate-600">
              <Link href="/privacy" className="hover:text-orange-500 transition-all hover:scale-105 active:scale-95 duration-150">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-orange-500 transition-all hover:scale-105 active:scale-95 duration-150">Terms and Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Lock(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )
  }
