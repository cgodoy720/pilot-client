import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import pursuitLogoFull from '../../assets/logo-full.png';
import { Calendar, Clock, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ProgramDetails = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/program-settings`);
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching program settings:', err);
        // Fallback to defaults if API is unavailable
        setSettings({
          program_title: 'Pursuit AI-Native Program is designed to transform you into an AI-native builder.',
          program_description: 'Learn cutting-edge technologies, build real-world projects, and join a community of builders shaping the future of tech.',
          program_start_date: 'March 14, 2026',
          schedule_weekday: 'Mon - Wed: 6:30 - 10:00 PM',
          schedule_weekend: 'Sat - Sun: 10:00 AM - 4:00 PM',
          location_address: '47-10 Austell Pl.',
          location_city: 'Long Island City, NY 11101'
        });
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (!user || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEFEF]">
        <div className="text-[#1E1E1E] text-xl font-proxima">Loading...</div>
      </div>
    );
  }

  // Parse weekday schedule into label and time parts
  const parseSchedule = (schedule) => {
    if (!schedule) return { days: '', time: '' };
    const colonIdx = schedule.indexOf(':');
    if (colonIdx === -1) return { days: schedule, time: '' };
    // Find the second colon-space pattern (after "Mon - Wed:")
    const parts = schedule.split(/:\s+/);
    if (parts.length >= 2) {
      return { days: parts[0] + ':', time: parts.slice(1).join(': ') };
    }
    return { days: schedule, time: '' };
  };

  const weekday = parseSchedule(settings.schedule_weekday);
  const weekend = parseSchedule(settings.schedule_weekend);

  return (
    <div className="min-h-screen bg-[#EFEFEF] font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#C8C8C8] px-4 md:px-8 py-2">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/apply">
              <img
                src={pursuitLogoFull}
                alt="Pursuit Logo"
                className="h-8 md:h-10 object-contain cursor-pointer"
                style={{ filter: 'invert(1)' }}
              />
            </Link>
            <div className="text-base md:text-lg font-semibold text-[#1E1E1E]">
              Welcome, {user.firstName || user.first_name}!
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/apply" className="hidden md:block text-[#666] hover:text-[#1E1E1E] px-4 py-2 font-semibold transition-colors">
              Apply
            </Link>
            <Link to="/program-details" className="hidden md:block text-[#4242EA] hover:text-[#3535D1] px-4 py-2 font-semibold transition-colors">
              Details
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Title Section */}
            <div>
              <h1 className="text-5xl font-bold text-[#1E1E1E] leading-tight font-proxima-bold mb-6">
                {settings.program_title}
              </h1>
              <p className="text-xl text-[#666] leading-relaxed">
                {settings.program_description}
              </p>
            </div>

            {/* Program Details Card */}
            <Card className="shadow-lg">
              <CardContent className="p-8 space-y-8">
                {/* Start Date */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#4242EA]">
                    <Calendar className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Start Date</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#1E1E1E] ml-7">
                    {settings.program_start_date}
                  </p>
                </div>

                {/* Schedule */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#4242EA]">
                    <Clock className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Schedule</h3>
                  </div>
                  <div className="ml-7 space-y-2 text-lg text-[#1E1E1E]">
                    <p className="font-semibold">{weekday.days} <span className="font-normal">{weekday.time}</span></p>
                    <p className="font-semibold">{weekend.days} <span className="font-normal">{weekend.time}</span></p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#4242EA]">
                    <MapPin className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Location</h3>
                  </div>
                  <p className="text-lg text-[#1E1E1E] ml-7">
                    {settings.location_address}<br />
                    {settings.location_city}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails;
