import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormById, getFormAnalytics, getCompletionStats } from '../../services/formService';
import { TrendingUp, Clock, Users, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

const FormAnalytics = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [completionStats, setCompletionStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [formId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [formData, analyticsData, statsData] = await Promise.all([
        getFormById(formId),
        getFormAnalytics(formId),
        getCompletionStats(formId)
      ]);
      setForm(formData);
      setAnalytics(analyticsData);
      setCompletionStats(statsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Swal.fire('Error', 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4242ea] rounded-full animate-spin mb-4"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto overflow-x-hidden box-border bg-[#f5f5f5] min-h-screen text-[#1a1a1a]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-16 py-6 shadow-sm mb-8">
        <button 
          onClick={() => navigate('/forms')}
          className="px-4 py-2 bg-transparent text-[#4242ea] border-none text-sm font-medium cursor-pointer transition-all duration-200 mb-4 inline-flex items-center gap-2 hover:text-[#3333d1]"
        >
          ← Back to Forms
        </button>
        <h1 className="text-3xl font-bold mb-2">{form?.title}</h1>
        <p className="text-gray-600">Form Analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="px-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Submissions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {analytics?.total_submissions || 0}
                </div>
                <div className="text-sm text-gray-500 font-medium">Total Submissions</div>
              </div>
            </div>
          </div>

          {/* Avg Completion Time */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {formatTime(analytics?.avg_completion_time)}
                </div>
                <div className="text-sm text-gray-500 font-medium">Avg. Completion Time</div>
              </div>
            </div>
          </div>

          {/* Unique Respondents */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {analytics?.unique_respondents || 0}
                </div>
                <div className="text-sm text-gray-500 font-medium">Unique Respondents</div>
              </div>
            </div>
          </div>

          {/* First Submission */}
          {analytics?.first_submission && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-800 mb-1">
                    {new Date(analytics.first_submission).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">First Submission</div>
                </div>
              </div>
            </div>
          )}

          {/* Last Submission */}
          {analytics?.last_submission && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-800 mb-1">
                    {new Date(analytics.last_submission).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Last Submission</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Completion Stats */}
        {completionStats.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Submissions Over Time</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">Submissions</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {completionStats.map((stat, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-800">
                        {new Date(stat.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-800">
                        {stat.submissions}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {formatTime(stat.avg_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormAnalytics;
