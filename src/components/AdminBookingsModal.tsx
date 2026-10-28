import React, { useState, useEffect } from 'react';
import { X, Database, RefreshCw, CheckCircle, AlertTriangle, Copy, ExternalLink, Calendar, Phone, User, Clock } from 'lucide-react';
import { getAppointmentsFromSupabase, getSupabaseProjectRef, SUPABASE_SQL_SCHEMA, SUPABASE_URL } from '../lib/supabase';

interface AdminBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminBookingsModal: React.FC<AdminBookingsModalProps> = ({ isOpen, onClose }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'sql'>('bookings');

  const projectId = getSupabaseProjectRef() || 'not-configured';

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    const res = await getAppointmentsFromSupabase();
    if (res.error) {
      if (res.error.code === 'PGRST205') {
        setError("Table 'appointments' does not exist yet in your Supabase project schema cache.");
        setActiveTab('sql');
      } else {
        setError(res.error.message || 'Error fetching appointments from Supabase');
      }
      setAppointments([]);
    } else {
      setAppointments(res.data || []);
      if ((res.data || []).length > 0) {
        setActiveTab('bookings');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-zinc-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-white">
                  Supabase Backend Dashboard
                </h2>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  Connected
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Project: {projectId} &bull; URL: {SUPABASE_URL}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              disabled={loading}
              title="Refresh appointments"
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FFD60A]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-4 border-b border-zinc-800 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#FFD60A] text-[#FFD60A]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Live Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-[#FFD60A] text-[#FFD60A]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <span>Supabase SQL Setup</span>
            {error && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {activeTab === 'bookings' ? (
            <div>
              {loading ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#FFD60A] animate-spin mx-auto" />
                  <p className="text-xs text-zinc-400 font-medium">Fetching records from Supabase backend...</p>
                </div>
              ) : error ? (
                <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>Supabase Table Setup Needed</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {error}
                  </p>
                  <p className="text-xs text-zinc-400">
                    To store and view submissions directly inside Supabase, run the one-click SQL script in your Supabase dashboard SQL editor.
                  </p>
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => setActiveTab('sql')}
                      className="bg-[#FFD60A] text-black text-xs font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-yellow-400"
                    >
                      View &amp; Copy SQL Script
                    </button>
                    <a
                      href={`https://supabase.com/dashboard/project/${projectId}/sql/new`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
                    >
                      <span>Open Supabase SQL Editor</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 bg-zinc-800/80 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-white">No Appointments Yet</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    When visitors fill out the "Book Appointment" form, their records will appear here in real time and in your Supabase Table editor!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id || apt.booking_code}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#FFD60A] bg-black/60 px-2.5 py-1 rounded border border-zinc-800">
                            {apt.booking_code}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {apt.client_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {apt.status || 'Pending'}
                          </span>
                          <span>{apt.created_at ? new Date(apt.created_at).toLocaleDateString() : ''}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Service</span>
                          <span className="font-medium text-white">{apt.service}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Artist</span>
                          <span className="font-medium text-[#FFD60A]">{apt.artist}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Date &amp; Time</span>
                          <span className="text-zinc-200">{apt.appointment_date} at {apt.time_slot}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Phone</span>
                          <a href={`tel:${apt.client_phone}`} className="text-zinc-200 hover:text-white underline">
                            {apt.client_phone}
                          </a>
                        </div>
                      </div>

                      {apt.placement && (
                        <div className="text-xs text-zinc-400 flex items-center gap-2 pt-1 border-t border-zinc-800/40">
                          <span><strong>Placement:</strong> {apt.placement} ({apt.size})</span>
                          {apt.notes && <span>&bull; <strong>Notes:</strong> {apt.notes}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#FFD60A]" />
                    <span>Supabase SQL Table Creation Script</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySQL}
                      className="bg-[#FFD60A] hover:bg-yellow-400 text-black font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                    </button>
                    <a
                      href={`https://supabase.com/dashboard/project/${projectId}/sql/new`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <span>Open in Supabase</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">
                  Run this SQL in your Supabase SQL Editor once to initialize the <code className="text-[#FFD60A]">appointments</code> and <code className="text-[#FFD60A]">contact_inquiries</code> tables with public insert permissions.
                </p>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black">
                <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
