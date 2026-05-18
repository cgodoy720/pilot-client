import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { startInterview } from '../../services/mockInterviewApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Mic, Brain, Users, Clock, ChevronRight, AlertCircle } from 'lucide-react';

const INTERVIEW_TYPES = [
  {
    id: 'behavioral',
    title: 'Behavioral Interview',
    description: 'Practice STAR-method responses for questions about teamwork, leadership, conflict, and more.',
    icon: Users,
    color: '#4242EA',
    focusAreas: [
      { id: 'general', label: 'General Mix' },
      { id: 'teamwork', label: 'Teamwork' },
      { id: 'leadership', label: 'Leadership' },
      { id: 'conflict', label: 'Conflict Resolution' },
      { id: 'failure', label: 'Failure & Learning' },
      { id: 'communication', label: 'Communication' },
      { id: 'adaptability', label: 'Adaptability' },
    ],
  },
  {
    id: 'technical',
    title: 'Technical Interview',
    description: 'Discuss system design, web fundamentals, databases, and algorithms with a senior engineer.',
    icon: Brain,
    color: '#FF33FF',
    focusAreas: [
      { id: 'general', label: 'General Mix' },
      { id: 'system_design', label: 'System Design' },
      { id: 'web_fundamentals', label: 'Web Fundamentals' },
      { id: 'databases', label: 'Databases' },
      { id: 'algorithms', label: 'Algorithms' },
      { id: 'api_design', label: 'API Design' },
    ],
  },
];

function MockInterviewSetup() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedFocus, setSelectedFocus] = useState('general');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async () => {
    if (!selectedType) return;

    setIsStarting(true);
    setError(null);

    try {
      const result = await startInterview(token, selectedType, selectedFocus);
      navigate(`/pathfinder/mock-interview/session/${result.interview.id}`, {
        state: {
          livekitToken: result.token,
          livekitUrl: result.livekitUrl,
          interview: result.interview,
        },
      });
    } catch (err) {
      setError(err.message);
      setIsStarting(false);
    }
  };

  const typeConfig = INTERVIEW_TYPES.find((t) => t.id === selectedType);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Mock Interview</h1>
            <p className="text-[#666] mt-1">Practice your interview skills with an AI interviewer in a real-time voice conversation.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/pathfinder/mock-interview/history')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Past Interviews
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {INTERVIEW_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-[#4242EA] shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => {
                setSelectedType(type.id);
                setSelectedFocus('general');
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${type.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: type.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{type.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {typeConfig && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Choose a Focus Area</CardTitle>
            <CardDescription>Select what you'd like the interview to concentrate on.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {typeConfig.focusAreas.map((area) => (
                <Badge
                  key={area.id}
                  variant={selectedFocus === area.id ? 'default' : 'outline'}
                  className={`cursor-pointer text-sm py-1.5 px-3 transition-all ${
                    selectedFocus === area.id
                      ? 'bg-[#4242EA] hover:bg-[#3535c0]'
                      : 'hover:bg-[#f0f0ff]'
                  }`}
                  onClick={() => setSelectedFocus(area.id)}
                >
                  {area.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedType && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Mic className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Microphone access required</p>
                <p className="mt-1">This is a voice conversation. Your browser will ask for microphone permission when the interview starts. Make sure you're in a quiet environment.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        size="lg"
        className="w-full bg-[#4242EA] hover:bg-[#3535c0] text-white h-12 text-base"
        disabled={!selectedType || isStarting}
        onClick={handleStart}
      >
        {isStarting ? (
          'Connecting...'
        ) : (
          <>
            Start Interview
            <ChevronRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}

export default MockInterviewSetup;
