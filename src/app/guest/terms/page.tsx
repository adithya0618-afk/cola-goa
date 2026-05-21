import Link from 'next/link';
import { FileText, AlertCircle, Calendar, CreditCard, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 sm:px-12 lg:px-24 font-sans text-slate-800 tracking-tight">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
        
        {/* Header Section */}
        <div className="bg-slate-900 px-8 py-10 text-white relative">
          <Link href="/admin/login" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Login
          </Link>
          <div className="mt-6">
            <FileText className="text-emerald-400 mb-4" size={48} />
            <h1 className="text-4xl font-extrabold">Terms & Conditions</h1>
            <p className="mt-2 text-slate-400 font-medium italic">Standard Operating Procedures for Cola Goa Resort</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12 space-y-12 leading-relaxed text-slate-600">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 border-b pb-2">
              <AlertCircle className="text-emerald-500" size={24} /> 1. Acceptance of Terms
            </h2>
            <p className="text-justify font-medium">
              By accessing our services, creating a booking, or using our guest link portal, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please refrain from using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 border-b pb-2">
              <Calendar className="text-emerald-500" size={24} /> 2. Booking & Cancellation Policy
            </h2>
            <p className="mb-4">
              Bookings are confirmed only after the required advance payment is made or authorized by the resort management.
            </p>
            <ul className="list-disc pl-6 space-y-2 font-medium">
              <li><strong>Cancellation:</strong> Cancellations made at least 48 hours before the check-in date may be eligible for a refund, subject to administrative fees.</li>
              <li><strong>No-Shows:</strong> Failure to arrive by the scheduled check-in time without prior notice will result in the forfeiture of your booking and advance payment.</li>
              <li><strong>Late Check-Outs:</strong> Unauthorized check-outs later than 11 AM will attract additional night charges.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 border-b pb-2">
              <ShieldAlert className="text-emerald-500" size={24} /> 3. User Responsibilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h3 className="font-bold text-emerald-900 mb-2 underline decoration-emerald-200 decoration-2 underline-offset-4">Accurate Information</h3>
                <p className="text-sm text-emerald-800">Users must provide accurate names, phone numbers, and emails as required by authorities and resort management.</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h3 className="font-bold text-emerald-900 mb-2 underline decoration-emerald-200 decoration-2 underline-offset-4">No Misuse</h3>
                <p className="text-sm text-emerald-800">You must not use our digital services for fraudulent activities or to disrupt our systems.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 border-b pb-2">
              <CreditCard className="text-emerald-500" size={24} /> 4. Service Usage & Refusal
            </h2>
            <p className="text-justify italic">
              The resort management reserves the right to refuse service or cancel a booking at any time if a guest violates resort code-of-conduct or provides false credentials. Services like spa, food, and housekeeping are subject to availability and operating hours. 
            </p>
          </section>

          <section className="bg-slate-100 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-300 pb-2">5. Limitation of Liability</h2>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest leading-loose">
              Cola Goa Resort and its developers are not liable for any indirect, incidental, or special damages arising out of your stay or use of our management systems. We strive for 100% uptime with our systems but do not guarantee error-free performance.
            </p>
          </section>

          <section className="text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tighter">6. Governing Law</h2>
            <p className="text-slate-500 font-medium">
              These terms are governed by the laws of <strong>India</strong>. Any legal proceedings shall be conducted exclusively within the jurisdiction of the courts in Goa.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© 2025 Cola Goa Resort. All Rights Reserved.</p>
            <div className="flex gap-6 text-sm font-semibold text-slate-600">
              <Link href="/privacy" className="hover:text-emerald-500 transition-colors uppercase tracking-widest text-[10px]">Privacy Policy</Link>
              <Link href="/cookies" className="hover:text-emerald-500 transition-colors uppercase tracking-widest text-[10px]">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
