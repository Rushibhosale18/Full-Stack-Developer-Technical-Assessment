import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Book, MessageSquare, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalDocuments: number;
  totalQuestions: number;
  recentUploads: {
    _id: string;
    filename: string;
    createdAt: string;
    size: number;
  }[];
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(import.meta.env.VITE_API_URL + '/dashboard');
        setStats(data);
      } catch (err: any) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Book className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Documents</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Questions Asked</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
        </div>
        <div className="p-0">
          {stats.recentUploads.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No documents uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {stats.recentUploads.map((doc) => (
                <li key={doc._id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(doc.createdAt), 'MMM d, yyyy')} • {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
