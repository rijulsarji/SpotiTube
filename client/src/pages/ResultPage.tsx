import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Youtube, RefreshCcw, Sparkles, CheckCircle2, Loader2, Music } from 'lucide-react';
import { BASE_URL } from '../utils/env';

interface ConversionData {
  status: string;
  youtubeUrl?: string;
  songsConverted?: string[];
  bonusTracks?: string[];
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const conversionId = location.state?.conversionId;

  const [data, setData] = useState<ConversionData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!conversionId) {
      navigate('/');
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;

    const pollStatus = async () => {
      try {
        const response = await fetch(`${BASE_URL}/spotitube/status/${conversionId}`);
        if (!response.ok) throw new Error('Failed to fetch status');

        const result: ConversionData = await response.json();
        setData(result);

        if (result.status === 'COMPLETED' || result.status === 'SUCCESS' || result.status === 'FAILED') {
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error('Polling error', err);
        setError('Connection lost while checking status.');
        clearInterval(intervalId);
      }
    };

    // Initial check
    pollStatus();
    // Poll every 3 seconds
    intervalId = setInterval(pollStatus, 3000);

    return () => clearInterval(intervalId);
  }, [conversionId, navigate]);

  const handleConvertAnother = async () => {
    try {
      await fetch(`${BASE_URL}/spotitube/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'convert_again' })
      });
    } catch (e) {
      console.error(e);
    }
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-animate opacity-30 -z-10 blur-3xl" />
        <p className="text-red-500 mb-6 text-xl">{error}</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-full text-white transition-colors">Go Back to Home</button>
      </div>
    );
  }

  // LOADING STATE
  if (!data || data.status === 'LOADING' || data.status === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-animate opacity-30 -z-10 blur-3xl" />
        <div className="flex flex-col items-center text-center max-w-lg">
          <div className="relative mb-12 flex items-center justify-center h-40 w-40">
            <div className="absolute rounded-full w-full h-full bg-spotify/20 animate-pulse blur-2xl"></div>
            <Loader2 className="w-32 h-32 text-youtube animate-spin absolute opacity-40" />
            <Music className="w-16 h-16 text-spotify animate-bounce relative z-10" />
          </div>

          <h2 className="text-3xl font-bold mb-4 tracking-tight">Your YouTube playlist is cooking...</h2>
          <p className="text-gray-400 mb-8">This may take a minute based on playlist size.</p>

          <div className="bg-[#1A1A1A] border border-gray-800 p-8 rounded-3xl italic text-gray-400 mt-4 relative shadow-2xl">
            <span className="text-6xl text-spotify absolute -top-2 -left-2 opacity-30 font-serif">"</span>
            <p className="text-lg leading-relaxed relative z-10 font-medium">Without music, life would be a mistake.</p>
            <p className="mt-6 text-sm font-semibold text-gray-500 uppercase tracking-widest">– Friedrich Nietzsche</p>
          </div>
        </div>
      </div>
    );
  }

  // FAILED STATE
  if (data.status === 'FAILED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-animate opacity-30 -z-10 blur-3xl" />
        <p className="text-red-500 mb-6 text-xl">Conversion failed in n8n. Please try again.</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-full text-white transition-colors">Go Back to Home</button>
      </div>
    );
  }

  // COMPLETED STATE
  return (
    <div className="min-h-screen flex flex-col items-center pt-24 px-4 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-animate opacity-30 -z-10 blur-3xl" />

      <div className="max-w-3xl w-full">
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-spotify to-youtube"></div>

          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-spotify mb-6 drop-shadow-[0_0_15px_rgba(29,185,84,0.5)]" />
            <h1 className="text-4xl font-bold mb-4">Conversion Complete!</h1>
            <p className="text-xl text-gray-400 mb-8 max-w-lg">
              We successfully found your tracks and generated a shiny new YouTube playlist.
            </p>

            <a
              href={data.youtubeUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-youtube hover:bg-red-600 text-white font-bold rounded-full px-10 py-4 flex items-center gap-3 text-lg mb-12 glow-btn-yt"
            >
              <Youtube className="w-6 h-6" /> Open YouTube Playlist
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#121212] rounded-2xl p-6 border border-gray-800">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-spotify" />
                Converted Tracks ({data.songsConverted ? data.songsConverted.length : 0})
              </h3>
              <ul className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar text-sm text-gray-400">
                {data.songsConverted?.map((song: string, idx: number) => (
                  <li key={idx} className="border-b border-gray-800 pb-2">{song}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#121212] rounded-2xl p-6 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-purple-400">
                <Sparkles className="w-5 h-5" />
                AI Bonus Tracks ({data.bonusTracks ? data.bonusTracks.length : 0})
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {data.bonusTracks?.map((song: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-purple-500">•</span> {song}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleConvertAnother}
            className="text-gray-400 hover:text-white flex items-center gap-2 px-6 py-3 rounded-full hover:bg-white/5 transition-colors"
          >
            <RefreshCcw className="w-5 h-5" /> Convert Another Playlist
          </button>
        </div>
      </div>
    </div>
  );
}
