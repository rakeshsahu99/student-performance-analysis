import { useState, useEffect } from "react";
import api from "../../api/axios";

interface StudentData {
  id: number;
  roll_number: string;
  class: string;
  name: string;
  email: string;
}

const Students = () => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/students/me");
        setStudentData(res.data);
        setError("");
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { data?: { error?: string } } };
          setError(axiosErr.response?.data?.error || "Failed to fetch student data");
        } else {
          setError("Failed to fetch student data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-amber-800 dark:text-amber-200">No student profile found for your account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View your student information</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-accent-600 to-accent-500 px-6 py-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
              👨‍🎓
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Full Name</span>
              <span className="font-semibold text-gray-900 dark:text-white">{studentData.name}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
              <span className="text-gray-700 dark:text-gray-300">{studentData.email}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Roll Number</span>
              <span className="font-medium text-gray-900 dark:text-white">{studentData.roll_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Class</span>
              <span className="px-3 py-1 text-sm font-medium bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full">
                {studentData.class}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;