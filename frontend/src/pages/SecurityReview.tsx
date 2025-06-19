import React, { useEffect, useState } from "react";
import { visitorAPI } from "../services/api.ts";
import toast from "react-hot-toast";
import type { VisitorRequest } from "../types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  declined: "bg-red-100 text-red-800",
};

const SecurityReview: React.FC = () => {
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await visitorAPI.getRequests();
        setRequests(data.requests || data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(r => r.status === statusFilter);

  const handleReview = async (id: string, status: "approved" | "declined") => {
    setReviewingId(id);
    try {
      await visitorAPI.reviewRequest(id, { status, reviewComments });
      toast.success(`Request ${status}`);
      setRequests(requests.map(r => r._id === id ? { ...r, status, reviewComments } : r));
      setReviewComments("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to review request");
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Visitor Requests (Security Review)</h2>
      <div className="mb-4 flex gap-2">
        <label className="font-medium">Filter by status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-gray-500 py-4 text-center">No requests found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map(r => (
                <tr key={r._id}>
                  <td className="px-4 py-2 whitespace-nowrap">{r.visitorName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.purpose}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.scheduledDate?.slice(0, 10)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[r.status] || "bg-gray-100 text-gray-800"}`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap flex flex-col gap-2">
                    {r.status === "pending" && (
                      <>
                        <textarea
                          className="border rounded px-2 py-1 mb-2 w-full"
                          placeholder="Review comments (optional)"
                          value={reviewingId === r._id ? reviewComments : ""}
                          onChange={e => setReviewComments(e.target.value)}
                          disabled={reviewingId !== r._id}
                        />
                        <div className="flex gap-2">
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                            disabled={reviewingId === r._id}
                            onClick={() => handleReview(r._id, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                            disabled={reviewingId === r._id}
                            onClick={() => handleReview(r._id, "declined")}
                          >
                            Decline
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SecurityReview;
