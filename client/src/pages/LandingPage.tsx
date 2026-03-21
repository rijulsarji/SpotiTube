import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wand2 } from 'lucide-react';
import SpotifyLogo from "../assets/spotify.png"
import YoutubeLogo from "../assets/youtube.png"

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes('spotify.com/playlist')) {
      setError('Please enter a valid Spotify playlist URL.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      // Fire tracking event (no await needed)
      fetch('http://localhost:5500/spotitube/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'convert_playlist' })
      }).catch(console.error);

      const response = await fetch('http://localhost:5500/spotitube/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotifyUrl: url }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/result', { state: { conversionId: data.conversionId } });
      } else {
        setError(data.error || 'Conversion failed.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-animate opacity-40 -z-10 blur-3xl" />

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-4xl px-4 flex flex-col items-center justify-center text-center mt-16 pt-12 gap-2">
        <div className="flex items-center gap-3 mb-6">
          <img src={SpotifyLogo} className="w-10 h-10" />
          <ArrowRight className="w-6 h-6 text-gray-500" />
          <img src={YoutubeLogo} className="w-10 h-10" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 flex flex-col gap-2 md:gap-4">
          <div>Turn Your</div>
          <div><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-spotify pb-1">Spotify</span> Playlists</div>
          <div>into <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-youtube pb-1">YouTube</span> Playlists.</div>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12">
          Powered by n8n and AI agents.
        </p>

        {/* Form */}
        <form onSubmit={handleConvert} className="w-full max-w-2xl relative mb-16">
          <div className="relative group flex items-center">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://open.spotify.com/playlist/..."
              className="w-full bg-[#1A1A1A] border border-gray-800 rounded-full py-5 pl-8 pr-40 text-lg focus:outline-none focus:border-spotify focus:ring-1 focus:ring-spotify transition-all"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 bottom-2 bg-spotify hover:bg-[#1ed760] text-black font-semibold rounded-full px-8 py-2 flex items-center gap-2 glow-btn disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Wand2 className="w-5 h-5 animate-spin" /> Converting...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" /> Convert
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full mt-8">
          <div className="flex flex-col items-center p-6 bg-[#161616] rounded-2xl border border-gray-800 hover:border-spotify/50 transition-colors">
            <div className="bg-spotify/10 p-4 rounded-full mb-4">
              <img src={SpotifyLogo} className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Paste URL</h3>
            <p className="text-gray-400">Grab any public Spotify playlist link and paste it above.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-[#161616] rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-colors">
            <div className="bg-purple-500/10 p-4 rounded-full mb-4">
              <Wand2 className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">2. AI Magic</h3>
            <p className="text-gray-400">Our n8n agent finds exact tracks and recommends bonus songs.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-[#161616] rounded-2xl border border-gray-800 hover:border-youtube/50 transition-colors">
            <div className="bg-youtube/10 p-4 rounded-full mb-4">
              <img src={YoutubeLogo} className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Enjoy on YouTube</h3>
            <p className="text-gray-400">Get a brand new YouTube playlist ready to listen to.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-500 mt-16 border-t border-gray-800">
        <p>Built with ❤️ using n8n and AI.</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <a href="https://github.com/rijulsarji/SpotiTube" className="text-gray-400 hover:text-white transition-colors underline">View on GitHub</a>
          <span className="text-gray-700">•</span>
          <a href="https://youtu.be/Puc9i0PUWYs" className="text-gray-400 hover:text-white transition-colors underline">How it works</a>
        </div>
      </footer>
    </div>
  );
}
