import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, Eye, BarChart3, Users, MapPin, Shield,
  RefreshCw, Globe2, Sparkles, Download, Check, AlertCircle, ArrowRight, ExternalLink
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import mosqueService from '../../services/mosqueService';
import IqamahConfigurator from './IqamahConfigurator';
import { useAuth } from '../../context/AuthContext';

const MOCK_STATS = [
  { label: 'Total Verified Mosques', value: '12+', icon: MapPin, change: 'Live in PostGIS' },
  { label: 'Pending Reviews', value: 3, icon: Clock, change: '1 claim waiting' },
  { label: 'Active Contributors', value: 142, icon: Users, change: '+18 this week' },
  { label: 'Monthly Visitors', value: '12.8K', icon: BarChart3, change: '+28%' },
];

const INITIAL_SUBMISSIONS = [];

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const storedTab = typeof window !== 'undefined' ? localStorage.getItem('om_admin_active_tab') : null;
  const initialTab = (urlTab || storedTab || 'pending');
  // If user is not SUPER_ADMIN, they do not have access to iqamah schedule
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const resolvedTab = (!isSuperAdmin && initialTab === 'iqamah') ? 'pending' : initialTab;
  const [activeTab, setActiveTab] = useState(resolvedTab);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    try {
      localStorage.setItem('om_admin_active_tab', tabId);
    } catch {}
  };

  useEffect(() => {
    const currentTabParam = searchParams.get('tab');
    if (currentTabParam === 'iqamah' && !isSuperAdmin) {
      setActiveTab('pending');
      setSearchParams({ tab: 'pending' }, { replace: true });
    } else if (currentTabParam && currentTabParam !== activeTab) {
      setActiveTab(currentTabParam);
    } else if (!currentTabParam && activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [searchParams, isSuperAdmin]);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);

  // OSM Ingestion Tool State
  const [osmCity, setOsmCity] = useState('London');
  const [osmCountry, setOsmCountry] = useState('United Kingdom');
  const [osmDryRun, setOsmDryRun] = useState(false);
  const [osmIngesting, setOsmIngesting] = useState(false);
  const [osmResult, setOsmResult] = useState(null);
  const [osmError, setOsmError] = useState('');

  // Mosque Iqamah Configurator State
  const [mosquesList, setMosquesList] = useState([]);
  const [selectedMosqueId, setSelectedMosqueId] = useState('');

  // Analytics State
  const [platformStats, setPlatformStats] = useState(null);
  const [analyticsMosqueId, setAnalyticsMosqueId] = useState('');
  const [mosqueStats, setMosqueStats] = useState(null);
  const [loadingMosqueStats, setLoadingMosqueStats] = useState(false);

  // Mosque Claims Moderation State
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [claimDecisionNotes, setClaimDecisionNotes] = useState({});
  const [claimActionInProgress, setClaimActionInProgress] = useState(null);

  useEffect(() => {
    // Clean up any obsolete local storage key if present from previous builds
    try {
      localStorage.removeItem('om_pending_submissions');
    } catch {}

    // Load backend moderation submissions directly from PostgreSQL for the active status
    const loadSubmissions = async () => {
      try {
        const queryStatus = (activeTab === 'approved' || activeTab === 'rejected') ? activeTab.toUpperCase() : 'PENDING';
        const res = await api.get(`/admin/moderation/submissions?status=${queryStatus}`);
        const pageData = res.data?.data;
        const list = pageData?.content || [];
        const formatted = list.map((s) => ({
          id: s.id,
          type: s.submissionType === 'NEW_MOSQUE' ? 'New Mosque' : 'Edit Suggestion',
          name: s.name,
          submittedBy: s.contactPhone || s.contactEmail || s.submitterEmail || 'Community Member',
          date: new Date(s.createdAt || Date.now()).toLocaleDateString(),
          status: s.status,
          city: s.city,
          description: s.description,
          contactPhone: s.contactPhone,
          websiteUrl: s.websiteUrl,
          targetMosqueId: s.targetMosqueId,
        }));
        setSubmissions(formatted);
      } catch (err) {
        console.warn('Unable to load backend moderation submissions', err);
        setSubmissions([]);
      }
    };
    if (activeTab === 'pending' || activeTab === 'edit-suggestions' || activeTab === 'approved' || activeTab === 'rejected') {
      loadSubmissions();
    }
  }, [activeTab]);

  useEffect(() => {
    // Load registered mosques for Iqamah configuration
    const loadMosques = async () => {
      try {
        const res = await mosqueService.getMosques({ page: 0, limit: 50 });
        const list = res.content || res.mosques || (Array.isArray(res) ? res : []);
        setMosquesList(list);
        if (list.length > 0) {
          setSelectedMosqueId(list[0].id || list[0].slug);
        }
      } catch (err) {
        console.warn('Unable to load mosques for admin', err);
      }
    };
    loadMosques();

    // Load pending mosque claims
    const loadClaims = async () => {
      setLoadingClaims(true);
      try {
        const res = await mosqueService.getClaimRequests('PENDING');
        const list = res?.content || (Array.isArray(res) ? res : []);
        setClaims(list);
      } catch (err) {
        console.warn('Unable to load claims', err);
      } finally {
        setLoadingClaims(false);
      }
    };
    loadClaims();

    // Load platform stats
    const loadPlatformStats = async () => {
      try {
        const stats = await mosqueService.getPlatformStats();
        if (stats) setPlatformStats(stats);
      } catch (err) {
        console.warn('Unable to load platform stats', err);
      }
    };
    loadPlatformStats();
  }, []);

  useEffect(() => {
    if (!analyticsMosqueId && mosquesList.length > 0) {
      setAnalyticsMosqueId(mosquesList[0].id || mosquesList[0].slug);
    }
  }, [mosquesList, analyticsMosqueId]);

  useEffect(() => {
    if (!analyticsMosqueId) return;
    const targetMosque = mosquesList.find((m) => m.id === analyticsMosqueId || m.slug === analyticsMosqueId);
    const targetUuid = targetMosque?.id || (analyticsMosqueId.includes('-') && analyticsMosqueId.length === 36 ? analyticsMosqueId : null);
    if (!targetUuid) return;

    const fetchMosqueStats = async () => {
      setLoadingMosqueStats(true);
      try {
        const stats = await mosqueService.getMosqueAdminStats(targetUuid);
        setMosqueStats(stats);
      } catch (err) {
        console.warn('Unable to load mosque admin stats', err);
        setMosqueStats(null);
      } finally {
        setLoadingMosqueStats(false);
      }
    };
    fetchMosqueStats();
  }, [analyticsMosqueId, mosquesList]);

  const handleViewProof = (url) => {
    if (!url) return;
    if (url.startsWith('data:')) {
      const win = window.open('', '_blank');
      if (win) {
        if (url.startsWith('data:image/')) {
          win.document.write(`<title>Proof Document</title><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${url}" style="max-width:100%;max-height:100vh;object-fit:contain;"/></body>`);
        } else if (url.startsWith('data:application/pdf')) {
          win.document.write(`<title>Proof Document</title><body style="margin:0;"><embed width="100%" height="100%" src="${url}" type="application/pdf" style="width:100%;height:100vh;" /></body>`);
        } else {
          win.location.href = url;
        }
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAction = async (id, newStatus) => {
    try {
      await api.patch(`/admin/moderation/submissions/${id}/decision`, {
        status: newStatus,
        reviewComments: 'Reviewed and decision recorded.',
      });
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update submission decision');
    }
  };

  const handleClaimDecision = async (claimId, status) => {
    setClaimActionInProgress(claimId);
    const comments = claimDecisionNotes[claimId] || (status === 'APPROVED' ? 'Approved official mosque representative.' : 'Insufficient verification documentation provided.');
    try {
      await mosqueService.reviewClaimRequest(claimId, {
        status,
        reviewComments: comments,
      });
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
      setClaimDecisionNotes((prev) => {
        const updated = { ...prev };
        delete updated[claimId];
        return updated;
      });
    } catch (err) {
      alert(err.response?.data?.message || err.message || `Failed to ${status.toLowerCase()} claim`);
    } finally {
      setClaimActionInProgress(null);
    }
  };

  const handleOsmIngest = async (e) => {
    e.preventDefault();
    if (!osmCity.trim()) return;

    setOsmIngesting(true);
    setOsmError('');
    setOsmResult(null);

    try {
      const result = await mosqueService.ingestOsmByCity({
        city: osmCity.trim(),
        country: osmCountry.trim(),
        dryRun: osmDryRun,
      });
      setOsmResult(result);
    } catch (err) {
      setOsmError(err.response?.data?.message || err.message || 'Failed to trigger OpenStreetMap ingestion');
    } finally {
      setOsmIngesting(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (activeTab === 'edit-suggestions') return s.type === 'Edit Suggestion' && s.status === 'PENDING';
    if (activeTab === 'pending') return s.type === 'New Mosque' && s.status === 'PENDING';
    return s.status === activeTab.toUpperCase();
  });

  const pendingNewMosquesCount = submissions.filter((s) => s.status === 'PENDING' && s.type === 'New Mosque').length;
  const editSuggestionsCount = submissions.filter((s) => s.status === 'PENDING' && s.type === 'Edit Suggestion').length;
  const totalPendingCount = pendingNewMosquesCount + editSuggestionsCount;
  const verifiedMosquesCount = mosquesList.length > 0 ? `${mosquesList.length}+` : '12+';

  const statsCards = [
    {
      label: 'Total Verified Mosques',
      value: platformStats ? `${platformStats.verifiedMosques} / ${platformStats.totalMosques}` : verifiedMosquesCount,
      icon: MapPin,
      change: 'Live in PostGIS',
    },
    {
      label: 'Pending Reviews',
      value: platformStats ? (platformStats.pendingSubmissions + platformStats.pendingClaims) : totalPendingCount,
      icon: Clock,
      change: platformStats ? `${platformStats.pendingClaims} claims waiting` : (claims.length > 0 ? `${claims.length} claims waiting` : 'Queue cleared'),
    },
    {
      label: 'Registered Users',
      value: platformStats ? `${platformStats.totalRegisteredUsers}` : '142',
      icon: Users,
      change: 'PostgreSQL DB',
    },
    {
      label: 'Active Content Flags',
      value: platformStats ? `${platformStats.activeFlags}` : '0',
      icon: Shield,
      change: 'Community Safe',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-2 border border-primary-200 dark:border-primary-800">
            <Shield size={13} className="text-primary-500" />
            <span>Moderation &amp; Administration Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review crowdsourced mosque proposals, verify claims, and run OpenStreetMap batch ingestion
          </p>
        </div>
      </div>

      {/* Stats Cards - Compact 2x2 grid on mobile screens */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-3 sm:p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[85px] sm:max-w-none">
                  {stat.change}
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-2 sm:mt-3">{stat.value}</p>
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 mb-6 w-full max-w-5xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-sm">
        {[
          { id: 'pending', label: `Pending Reviews${pendingNewMosquesCount > 0 ? ` (${pendingNewMosquesCount})` : ''}` },
          { id: 'edit-suggestions', label: `Edit Suggestions${editSuggestionsCount > 0 ? ` (${editSuggestionsCount})` : ''}` },
          { id: 'claims', label: `Mosque Claims${claims.length > 0 ? ` (${claims.length})` : ''}` },
          { id: 'approved', label: 'Approved' },
          { id: 'rejected', label: 'Rejected' },
          ...(isSuperAdmin ? [{ id: 'iqamah', label: 'Iqamah Schedules' }] : []),
          { id: 'osm-ingest', label: 'OSM Ingestion' },
          { id: 'analytics', label: 'Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-center ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: OSM Ingestion Tool */}
      {activeTab === 'osm-ingest' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
                <Globe2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  OpenStreetMap (OSM) Automated Batch Ingestion Engine
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl leading-relaxed">
                  Bulk-populate hundreds of verified mosques directly from OpenStreetMap via the Overpass API.
                  Extracts GPS coordinates, addresses, contacts, and automatically maps Islamic facilities
                  (Wudu areas, Women&apos;s sections, Wheelchair access, Parking). Built with spatial deduplication (<span className="font-semibold">&lt;50m proximity check</span>).
                </p>
              </div>
            </div>

            {osmError && (
              <div className="p-4 mb-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{osmError}</span>
              </div>
            )}

            <form onSubmit={handleOsmIngest} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Target City
                  </label>
                  <input
                    type="text"
                    required
                    value={osmCity}
                    onChange={(e) => setOsmCity(e.target.value)}
                    placeholder="e.g. London, Toronto, Chicago"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Country (Optional)
                  </label>
                  <input
                    type="text"
                    value={osmCountry}
                    onChange={(e) => setOsmCountry(e.target.value)}
                    placeholder="e.g. United Kingdom"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={osmDryRun}
                  onChange={(e) => setOsmDryRun(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span><strong>Dry Run Mode:</strong> Preview matching mosques and tags without saving to database</span>
              </label>

              <button
                type="submit"
                disabled={osmIngesting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {osmIngesting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Querying OpenStreetMap Overpass API...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Start Batch Ingestion ({osmCity})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Card */}
          {osmResult && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-lg">
                  <Check size={20} className="text-emerald-600" />
                  <span>Ingestion Completed in {osmResult.durationMs}ms</span>
                </div>
                {osmResult.dryRun && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    Dry Run Preview
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Total Retrieved</span>
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {osmResult.totalElementsFetched}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 block">New Mosques {osmResult.dryRun ? 'Found' : 'Saved'}</span>
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {osmResult.mosquesInserted}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Duplicates Skipped (&lt;50m)</span>
                  <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
                    {osmResult.duplicatesSkipped}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Facilities Attached</span>
                  <span className="text-2xl font-extrabold text-sky-600 mt-1 block">
                    {osmResult.facilitiesAttached}
                  </span>
                </div>
              </div>

              {osmResult.insertedMosqueNames?.length > 0 && (
                <div className="pt-2">
                  <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Sample Ingested Mosques:
                  </h5>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {osmResult.insertedMosqueNames.slice(0, 15).map((name, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200">
                        {name}
                      </span>
                    ))}
                    {osmResult.insertedMosqueNames.length > 15 && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-xs font-bold text-emerald-800 dark:text-emerald-200">
                        +{osmResult.insertedMosqueNames.length - 15} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/mosques"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  <span>Explore in Mosque Directory</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Mosque Claims Moderation */}
      {activeTab === 'claims' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="text-purple-600" size={20} />
                Mosque Administration Ownership Claims
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Verify committee credentials and approve imams to manage their mosque profile &amp; prayer timetables
              </p>
            </div>
            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800">
              {claims.length} Pending Review
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Mosque</th>
                  <th className="px-5 py-3.5">Claimant &amp; Position</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Proof / Credentials</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Moderator Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      {claim.mosqueName || 'Mosque'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">{claim.fullName}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-[11px] font-bold rounded">
                        {claim.positionInMosque}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                      <div>{claim.phoneNumber}</div>
                      {claim.officialEmail && <div className="text-gray-400">{claim.officialEmail}</div>}
                    </td>
                    <td className="px-5 py-4">
                      {claim.proofDocumentUrl ? (
                        <button
                          type="button"
                          onClick={() => handleViewProof(claim.proofDocumentUrl)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                        >
                          <span>View Proof Document</span>
                          <ExternalLink size={12} />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No URL provided</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={claimActionInProgress === claim.id}
                          onClick={() => handleClaimDecision(claim.id, 'APPROVED')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle size={13} />
                          <span>Approve &amp; Grant Admin</span>
                        </button>
                        <button
                          type="button"
                          disabled={claimActionInProgress === claim.id}
                          onClick={() => handleClaimDecision(claim.id, 'REJECTED')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          <XCircle size={13} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {claims.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm">
              <Shield size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">No pending mosque claims</p>
              <p className="text-xs text-gray-400 mt-1">All mosque ownership and imam verification requests have been processed.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Review Queue Tables (Pending, Edit Suggestions, Approved, Rejected) */}
      {(activeTab === 'pending' || activeTab === 'edit-suggestions' || activeTab === 'approved' || activeTab === 'rejected') && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Submission Type</th>
                  <th className="px-5 py-3.5">Mosque &amp; Details</th>
                  <th className="px-5 py-3.5">Submitted By</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Moderator Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        item.type === 'New Mosque' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' :
                        item.type === 'Claim Request' ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300' :
                        'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{item.name}</span>
                        {item.targetMosqueId && (
                          <Link
                            to={`/mosques/${item.targetMosqueId}`}
                            target="_blank"
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-0.5 hover:underline"
                          >
                            <span>View Mosque</span>
                            <ExternalLink size={11} />
                          </Link>
                        )}
                      </div>
                      {item.city && <span className="block text-xs font-normal text-gray-400">{item.city}</span>}
                      {item.description && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400 block mb-0.5">
                            {item.type === 'Edit Suggestion' ? 'Suggested Correction:' : 'Proposal Notes:'}
                          </span>
                          <p className="leading-relaxed whitespace-pre-wrap">{item.description}</p>
                          {(item.contactPhone || item.websiteUrl) && (
                            <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 dark:border-amber-800/40 flex flex-wrap gap-3 text-[11px] text-amber-800 dark:text-amber-300">
                              {item.contactPhone && <span>📞 Phone: {item.contactPhone}</span>}
                              {item.websiteUrl && <span>🌐 Web: {item.websiteUrl}</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 align-top">{item.submittedBy}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 align-top">{item.date}</td>
                    <td className="px-5 py-4 align-top">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        item.status === 'APPROVED' ? 'text-green-600' :
                        item.status === 'REJECTED' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {item.status === 'APPROVED' ? <CheckCircle size={13} /> :
                         item.status === 'REJECTED' ? <XCircle size={13} /> :
                         <Clock size={13} />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleAction(item.id, 'APPROVED')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                          >
                            <CheckCircle size={13} />
                            <span>{item.type === 'Edit Suggestion' ? 'Approve (+20 pts)' : 'Approve'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(item.id, 'REJECTED')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm">
              <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                {activeTab === 'edit-suggestions' ? 'No pending edit suggestions' : `No ${activeTab} submissions`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activeTab === 'edit-suggestions'
                  ? 'All crowdsourced mosque edit suggestions have been reviewed and processed.'
                  : activeTab === 'pending'
                  ? 'All crowdsourced submissions have been reviewed.'
                  : `There are currently no ${activeTab} items in the moderation queue.`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Iqamah Schedules */}
      {activeTab === 'iqamah' && isSuperAdmin && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              Select Mosque to Configure
            </label>
            <select
              value={selectedMosqueId}
              onChange={(e) => setSelectedMosqueId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {mosquesList.map((m) => (
                <option key={m.id || m.slug} value={m.id || m.slug}>
                  {m.name} ({m.city || 'Verified'})
                </option>
              ))}
            </select>
          </div>

          {selectedMosqueId ? (
            <IqamahConfigurator
              mosqueId={selectedMosqueId}
              mosqueName={mosquesList.find((m) => (m.id || m.slug) === selectedMosqueId)?.name || 'Selected Mosque'}
            />
          ) : (
            <div className="py-8 text-center text-sm text-gray-500">
              No mosques available to configure.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8" id="analytics-section">
          {/* Platform System-wide Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <BarChart3 size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Platform Demographics &amp; Operational KPIs</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Live system counters aggregated across PostgreSQL database</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Directory Coverage</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {platformStats?.totalMosques ?? 0}
                </p>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                  {platformStats?.verifiedMosques ?? 0} verified mosques
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Registered Community</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {platformStats?.totalRegisteredUsers ?? 0}
                </p>
                <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 mt-1 inline-block">
                  PostgreSQL User Base
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pending Moderation</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {platformStats?.pendingSubmissions ?? 0}
                </p>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mt-1 inline-block">
                  {platformStats?.pendingClaims ?? 0} claims pending
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Content Flags</p>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {platformStats?.activeFlags ?? 0}
                </p>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                  Community Safe
                </span>
              </div>
            </div>
          </div>

          {/* Mosque Administration Drilldown */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mosque Administrator Intelligence</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Inspect real-time engagement and community ratings for individual mosques</p>
              </div>

              <div className="w-full sm:w-72">
                <select
                  id="analytics-mosque-select"
                  value={analyticsMosqueId}
                  onChange={(e) => setAnalyticsMosqueId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  {mosquesList.map((m) => (
                    <option key={m.id || m.slug} value={m.id || m.slug}>
                      {m.name} ({m.city || 'Verified'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingMosqueStats ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading mosque metrics...</div>
            ) : mosqueStats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">Worshipper Favorites</span>
                    <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">{mosqueStats.totalFavorites}</p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Receives Iqamah alerts</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                    <span className="text-xs text-amber-800 dark:text-amber-300 font-bold">Average Rating</span>
                    <p className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">
                      ⭐ {mosqueStats.averageRating ? mosqueStats.averageRating.toFixed(1) : '5.0'}
                    </p>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">{mosqueStats.totalReviews} total reviews</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                    <span className="text-xs text-blue-800 dark:text-blue-300 font-bold">Upcoming Events</span>
                    <p className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">{mosqueStats.upcomingEventsCount}</p>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">Scheduled initiatives</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                    <span className="text-xs text-purple-800 dark:text-purple-300 font-bold">Unanswered Q&amp;A</span>
                    <p className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">{mosqueStats.unansweredQuestionsCount}</p>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">Pending replies</span>
                  </div>
                </div>

                {/* Rating Distribution Breakdown */}
                {mosqueStats.ratingsCountByStar && (
                  <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">
                      Ratings Distribution Breakdown
                    </h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = mosqueStats.ratingsCountByStar[star] || 0;
                        const total = mosqueStats.totalReviews || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={star} className="flex items-center gap-3 text-xs">
                            <span className="w-8 font-bold text-gray-700 dark:text-gray-300 flex items-center gap-0.5">
                              {star} <span className="text-amber-500">★</span>
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-12 text-right text-gray-500 dark:text-gray-400 font-medium">
                              {count} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-500">
                Select a mosque from the list above to preview live administrator statistics.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
