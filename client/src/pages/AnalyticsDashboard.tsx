import { useEffect, useState } from 'react';
import { Activity, Users, RefreshCcw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { config } from '../utils/config';

interface AnalyticsData {
  pageVisits: number;
  convertAgainCount: number;
  conversionsCount: number;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}/spotitube/analytics`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Error loading analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading metrics...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center pt-24 px-4 relative">
      <div className="max-w-4xl w-full">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="text-spotify" /> SpotiTube Analytics
          </h1>
          <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 hover:border-spotify/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-spotify/10 p-3 rounded-xl">
                <Users className="w-6 h-6 text-spotify" />
              </div>
              <h2 className="text-gray-400 font-medium tracking-wide">Total Visits</h2>
            </div>
            <p className="text-5xl font-bold">{data?.pageVisits.toLocaleString()}</p>
          </div>

          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 hover:border-youtube/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-youtube/10 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-youtube" />
              </div>
              <h2 className="text-gray-400 font-medium tracking-wide">Total Conversions</h2>
            </div>
            <p className="text-5xl font-bold">{data?.conversionsCount.toLocaleString()}</p>
          </div>

          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-500/10 p-3 rounded-xl">
                <RefreshCcw className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-gray-400 font-medium tracking-wide">Convert Again CLIcks</h2>
            </div>
            <p className="text-5xl font-bold">{data?.convertAgainCount.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
