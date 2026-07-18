import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Document {
  _id: string;
  filename: string;
}

interface Message {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export const Ask = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [history, setHistory] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data } = await axios.get(import.meta.env.VITE_API_URL + '/documents');
        setDocuments(data);
        if (data.length > 0) {
          setSelectedDocId(data[0]._id);
        }
      } catch (err) {
        setError('Failed to fetch documents');
      }
    };
    fetchDocuments();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedDocId) return;
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/history?documentId=${selectedDocId}`);
        setHistory(data.reverse()); // Reverse because API returns descending
      } catch (err) {
        setError('Failed to fetch history');
      }
    };
    fetchHistory();
  }, [selectedDocId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedDocId) return;

    const currentQuestion = question;
    setQuestion('');
    setLoading(true);
    setError('');

    // Optimistically add to UI (without ID yet)
    const tempId = Date.now().toString();
    setHistory((prev) => [
      ...prev,
      { _id: tempId, question: currentQuestion, answer: '', createdAt: new Date().toISOString() },
    ]);

    try {
      const { data } = await axios.post(import.meta.env.VITE_API_URL + '/ask', {
        documentId: selectedDocId,
        question: currentQuestion,
      });

      // Update history with actual response
      setHistory((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? data : msg
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get answer');
      // Remove optimistic message on error
      setHistory((prev) => prev.filter((msg) => msg._id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Ask AI</h1>
        <div className="flex gap-4 items-center w-[500px]">
          <input
            type="text"
            placeholder="Search conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base border"
          />
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 pl-3 pr-10 text-base border"
          >
            <option value="" disabled>Select a document</option>
            {documents.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.filename}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 shrink-0">
          {error}
        </div>
      )}

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Bot className="w-12 h-12 mb-4 text-gray-400" />
              <p>No questions asked yet for this document.</p>
              <p className="text-sm">Type a question below to get started!</p>
            </div>
          ) : (
            history
              .filter(msg => 
                msg.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                msg.answer.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((msg, idx) => (
              <div key={msg._id || idx} className="space-y-4">
                {/* User Message */}
                <div className="flex items-start gap-4 justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p>{msg.question}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    {msg.answer ? (
                      <p className="whitespace-pre-wrap">{msg.answer}</p>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading || !selectedDocId}
              placeholder={selectedDocId ? "Ask a question about the document..." : "Select a document first"}
              className="flex-1 rounded-full border-gray-300 px-6 py-3 focus:border-blue-500 focus:ring-blue-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || !question.trim() || !selectedDocId}
              className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
