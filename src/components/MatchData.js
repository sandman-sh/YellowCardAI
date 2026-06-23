"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Calendar, MapPin, AlertCircle, Coins } from "lucide-react";

const TEAM_TRANSLATIONS = {
  // German -> English
  "Mexiko": "Mexico",
  "Südafrika": "South Africa",
  "Südkorea": "South Korea",
  "Tschechien": "Czech Republic",
  "Deutschland": "Germany",
  "Frankreich": "France",
  "Spanien": "Spain",
  "Italien": "Italy",
  "Kroatien": "Croatia",
  "Niederlande": "Netherlands",
  "Belgien": "Belgium",
  "Schweiz": "Switzerland",
  "Dänemark": "Denmark",
  "Polen": "Poland",
  "Schweden": "Sweden",
  "Österreich": "Austria",
  "Türkei": "Turkey",
  "Ungarn": "Hungary",
  "Serbien": "Serbia",
  "Slowakei": "Slovakia",
  "Rumänien": "Romania",
  "Slowenien": "Slovenia",
  "Georgien": "Georgia",
  "Albanien": "Albania",
  "Marokko": "Morocco",
  "Ägypten": "Egypt",
  "Elfenbeinküste": "Ivory Coast",
  "Kamerun": "Cameroon",
  "Algerien": "Algeria",
  "Brasilien": "Brazil",
  "Argentinien": "Argentina",
  "Uruguay": "Uruguay",
  "Kolumbien": "Colombia",
  "Kanada": "Canada",
  "Saudi-Arabien": "Saudi Arabia",
  "Irak": "Iraq",
  "Katar": "Qatar",
  "Neuseeland": "New Zealand",
  "Australien": "Australia",
  "Irland": "Ireland",
  "Nordirland": "Northern Ireland",
  "Griechenland": "Greece",
  "Finnland": "Finland",
  "Norwegen": "Norway",
  "Island": "Iceland",
  "Bulgarien": "Bulgaria",
  "Russland": "Russia",
  "Ukraine": "Ukraine",
  "Wales": "Wales",
  "Schottland": "Scotland",
  "England": "England",
  "Chile": "Chile",
  "Ecuador": "Ecuador",
  "Paraguay": "Paraguay",
  "Peru": "Peru",
  "Bolivien": "Bolivia",
  "Venezuela": "Venezuela",
  "Costa Rica": "Costa Rica",
  "Honduras": "Honduras",
  "Panama": "Panama",
  "Jamaika": "Jamaica",
  "Senegal": "Senegal",
  "Nigeria": "Nigeria",
  "Ghana": "Ghana",
  "Tunesien": "Tunisia",
  "Sambia": "Zambia",
  "Jordanien": "Jordan",
  "China": "China",
  "Usbekistan": "Uzbekistan",
  "Vereinigte Arabische Emirate": "UAE",
  "Oman": "Oman",
  "Bahrain": "Bahrain",
  "Palästina": "Palestine"
};

const translateTeam = (name) => {
  if (!name) return "";
  return TEAM_TRANSLATIONS[name] || name;
};

export default function MatchData({ onSelectTeam }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch WM 2026 from OpenLigaDB
      const response = await fetch("https://api.openligadb.de/getmatchdata/wm26/2026");
      if (!response.ok) {
        throw new Error("Failed to fetch match data");
      }
      const data = await response.json();
      
      // Translate team names to English
      const translatedData = data.map(match => ({
        ...match,
        team1: {
          ...match.team1,
          teamName: translateTeam(match.team1.teamName)
        },
        team2: {
          ...match.team2,
          teamName: translateTeam(match.team2.teamName)
        }
      }));

      // Sort matches by date (upcoming first)
      const sorted = translatedData.sort((a, b) => new Date(a.matchDateTime) - new Date(b.matchDateTime));
      setMatches(sorted);
    } catch (err) {
      console.error("Match fetch error:", err);
      setError("Could not load FIFA match data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const getScore = (match) => {
    if (!match.matchIsFinished) return "VS";
    // Look for the end result (usually index 1 or has resultName "Endergebnis")
    const endResult = match.matchResults?.find(r => r.resultName === "Endergebnis") || match.matchResults?.[0];
    if (endResult) {
      return `${endResult.pointsTeam1} - ${endResult.pointsTeam2}`;
    }
    return "0 - 0";
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="neo-card h-full flex flex-col min-h-[400px]">
      {/* Header */}
      <div className="bg-black text-white p-4 border-b-4 border-black flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h2 className="font-black text-lg tracking-tight uppercase">
            Block A: World Cup 2026
          </h2>
        </div>
        <button 
          onClick={fetchMatches}
          disabled={loading}
          className="p-1 border-2 border-white hover:bg-ref-yellow hover:text-black transition-colors"
          title="Refresh Fixtures"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-4 max-h-[500px] custom-scrollbar bg-stone-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-black">
            <RefreshCw size={32} className="animate-spin text-ref-green" />
            <p className="font-bold text-sm uppercase">Loading fixtures...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-ref-red p-4 text-center">
            <AlertCircle size={32} />
            <p className="font-bold text-sm">{error}</p>
            <button 
              onClick={fetchMatches}
              className="neo-button !bg-black !text-white text-xs px-4 py-2 border-2 border-black mt-2"
            >
              Retry
            </button>
          </div>
        ) : matches.length === 0 ? (
          <p className="text-black font-bold text-center py-12">No matches found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {matches.map((match) => {
              const score = getScore(match);
              const isFinished = match.matchIsFinished;
              
              return (
                <div 
                  key={match.matchID}
                  className="border-4 border-black bg-white p-3 neo-shadow transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black"
                >
                  {/* Metadata line */}
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-stone-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(match.matchDateTime)}
                    </span>
                    {match.location && (
                      <span className="flex items-center gap-0.5 max-w-[120px] truncate">
                        <MapPin size={10} />
                        {match.location.locationCity}
                      </span>
                    )}
                  </div>

                  {/* Teams and Score Grid */}
                  <div className="grid grid-cols-7 items-center gap-1 py-1">
                    {/* Team 1 */}
                    <div 
                      onClick={() => onSelectTeam(match.team1.teamName, match.team2.teamName)}
                      className="col-span-3 flex flex-col items-center justify-center text-center p-1 cursor-pointer hover:bg-stone-100 border-2 border-transparent hover:border-black transition-all"
                    >
                      <img 
                        src={match.team1.teamIconUrl || "https://awiealex.de/flags/default.png"} 
                        alt={match.team1.teamName} 
                        className="w-8 h-8 object-contain border-2 border-black mb-1 bg-stone-100"
                        onError={(e) => { e.target.src = "https://flagcdn.com/w80/un.png"; }}
                      />
                      <span className="font-black text-xs uppercase tracking-tighter truncate w-full">
                        {match.team1.teamName}
                      </span>
                    </div>

                    {/* Score / VS Center */}
                    <div className="col-span-1 flex flex-col items-center justify-center">
                      <span className={`font-black text-xs px-2 py-1 border-2 border-black ${isFinished ? 'bg-black text-white' : 'bg-ref-yellow text-black'}`}>
                        {score}
                      </span>
                      {isFinished ? (
                        <span className="text-[8px] font-black text-ref-red uppercase mt-1">FT</span>
                      ) : (
                        <span className="text-[8px] font-black text-emerald-600 uppercase mt-1">Live</span>
                      )}
                    </div>

                    {/* Team 2 */}
                    <div 
                      onClick={() => onSelectTeam(match.team2.teamName, match.team1.teamName)}
                      className="col-span-3 flex flex-col items-center justify-center text-center p-1 cursor-pointer hover:bg-stone-100 border-2 border-transparent hover:border-black transition-all"
                    >
                      <img 
                        src={match.team2.teamIconUrl || "https://awiealex.de/flags/default.png"} 
                        alt={match.team2.teamName} 
                        className="w-8 h-8 object-contain border-2 border-black mb-1 bg-stone-100"
                        onError={(e) => { e.target.src = "https://flagcdn.com/w80/un.png"; }}
                      />
                      <span className="font-black text-xs uppercase tracking-tighter truncate w-full">
                        {match.team2.teamName}
                      </span>
                    </div>
                  </div>

                  {/* Quick Bet Button if Match is NOT Finished */}
                  <div className="mt-2 pt-2 border-t border-stone-200 flex justify-end">
                    <button
                      onClick={() => onSelectTeam(match.team1.teamName, match.team2.teamName)}
                      className="text-[9px] font-black uppercase bg-ref-yellow text-black border-2 border-black px-2 py-0.5 flex items-center gap-1 hover:bg-black hover:text-ref-yellow transition-all"
                    >
                      <Coins size={10} /> Propose Bet
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white text-black p-3 border-t-4 border-black text-xs font-bold text-center">
        💡 <span className="uppercase text-[10px] font-black">Tip:</span> Click a team or "Propose Bet" to load it into the Referee Chat.
      </div>
    </div>
  );
}
