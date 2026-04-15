import Link from 'next/link';
import { Shield, Lock, Eye, MessageSquare, Database, Globe, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 sm:px-12 lg:px-24 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
        
        {/* Header Section */}
        <div className="bg-slate-900 px-8 py-10 text-white relative">
          <Link href="/admin/login" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Login
          </Link>
          <div className="mt-6">
            <Shield className="text-sky-400 mb-4" size={48} />
            <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="mt-2 text-slate-400 font-medium">Last Updated: April 15, 2026</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12 space-y-10 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Globe className="text-sky-500" size={24} /> 1. Introduction
            </h2>
            <p className="text-slate-600">
              Welcome to the <strong>Cola Goa Beach Resort</strong> Management Application. We value your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information when you book a room or use our services through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Eye className="text-sky-500" size={24} /> 2. Information We Collect
            </h2>
            <p className="text-slate-600 mb-4">
              To provide you with a seamless resort experience, we collect only the necessary information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Contact Details:</strong> Your full name, phone number, and email address.</li>
              <li><strong>Stay Information:</strong> Check-in and check-out dates, and room preferences.</li>
              <li><strong>Service Requests:</strong> Details of orders placed (food, spa, housekeeping).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Lock className="text-sky-500" size={24} /> 3. How We Use Data
            </h2>
            <p className="text-slate-600 mb-4 text-justify">
              We process your data primarily to manage your stay and fulfill your requests. Specifically, we use it for:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Internal Management</h3>
                <p className="text-sm text-slate-600">Managing room inventory and billing.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Service Delivery</h3>
                <p className="text-sm text-slate-600">Ensuring our staff can deliver your requested amenities correctly.</p>
              </div>
            </div>
          </section>

          <section className="bg-sky-50 p-6 rounded-2xl border border-sky-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <MessageSquare className="text-sky-600" size={24} /> 4. Third-Party Services
            </h2>
            <div className="space-y-4 text-slate-700">
              <div>
                <h3 className="font-bold text-slate-900">Twilio Communications</h3>
                <p>We use <strong>Twilio</strong> to send transactional messages like booking confirmations and guest links via SMS or WhatsApp. <strong>We do not use your phone number for marketing spam.</strong></p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Supabase Storage</h3>
                <p>Your information is securely stored in a <strong>PostgreSQL</strong> database managed by <strong>Supabase</strong>, protected by industry-standard encryption and access controls.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Database className="text-sky-500" size={24} /> 5. Data Security & Retention
            </h2>
            <p className="text-slate-600 mb-4">
              We retain your data for as long as necessary to fulfill our legal obligations and provide you with resort services. We employ strict authentication measures to ensure only authorized personnel can access guest data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Globe className="text-sky-500" size={24} /> 6. Governing Law
            </h2>
            <p className="text-slate-600 italic">
              This policy is governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts in Goa.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© 2025 Cola Goa Resort. All Rights Reserved.</p>
            <div className="flex gap-6 text-sm font-semibold text-slate-600">
              <Link href="/terms" className="hover:text-sky-500 transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-sky-500 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
