import { useState, useEffect } from "react";
import api from "../../api/axios";

interface AnalyticsData {
  total_marks: number;
  percentage: string;
  grade: string;
  highest_subject: string;
  lowest_subject: string;
  class_average: string;
}

const Reports = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const studentRes = await api.get("/students/me");
        const studentData = studentRes.data;
        
        if (studentData && studentData.id) {
          const res = await api.get(`/analytics/${studentData.id}`);
          setAnalytics(res.data);
        }
        setError("");
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { data?: { error?: string } } };
          setError(axiosErr.response?.data?.error || "Failed to fetch reports");
        } else {
          setError("Failed to fetch reports");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Performance Report</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your academic progress</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {analytics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.total_marks}</p>
                </div>
                <span className="text-3xl">📊</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.percentage}%</p>
                </div>
                <span className="text-3xl">📈</span>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-accent-500 rounded-full" style={{ width: analytics.percentage }} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent-600 to-accent-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80">Grade</p>
                  <p className="text-4xl font-bold mt-1">{analytics.grade}</p>
                </div>
                <span className="text-4xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Best Subject</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {analytics.highest_subject || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-2xl">
                  💪
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Needs Improvement</p>
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                    {analytics.lowest_subject || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
                  👥
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class Average</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.class_average}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">vs Class Average</p>
                <p className={`text-lg font-semibold ${
                  parseFloat(analytics.percentage) >= parseFloat(analytics.class_average) 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {parseFloat(analytics.percentage) >= parseFloat(analytics.class_average) ? "+" : ""}
                  {(parseFloat(analytics.percentage) - parseFloat(analytics.class_average)).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-500 dark:text-gray-400">No analytics data available yet.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Your performance report will appear here once you have marks recorded.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;