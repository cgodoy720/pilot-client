import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import pursuitLogoFull from '../../assets/logo-full.png';
import { Calendar, Clock, MapPin } from 'lucide-react';

const ProgramDetails = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/apply');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEFEF]">
        <div className="text-[#1E1E1E] text-xl font-proxima">Loading...</div>
      </div>
    );
  }

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
                Pursuit AI-Native Program is designed to transform you into an AI-native builder.
              </h1>
              <p className="text-xl text-[#666] leading-relaxed">
                Learn cutting-edge technologies, build real-world projects, and join a community of builders shaping the future of tech.
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
                    March 14, 2025
                  </p>
                </div>

                {/* Schedule */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#4242EA]">
                    <Clock className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Schedule</h3>
                  </div>
                  <div className="ml-7 space-y-2 text-lg text-[#1E1E1E]">
                    <p className="font-semibold">Mon - Wed: <span className="font-normal">6:00 - 10:30 PM</span></p>
                    <p className="font-semibold">Sat - Sun: <span className="font-normal">10:00 AM - 6:00 PM</span></p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#4242EA]">
                    <MapPin className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Location</h3>
                  </div>
                  <p className="text-lg text-[#1E1E1E] ml-7">
                    47-10 Austell Pl.<br />
                    Long Island City, NY 11101
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
