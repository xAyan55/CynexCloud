import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getAvatarUrl } from "../../utils/avatar";
import DashboardCard from "../../components/DashboardCard";
import SkeletonLoader from "../../components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Loader2 } from "lucide-react";

interface TicketMessage {
  id: string;
  message: string;
  isStaff: number;
  createdAt: string;
  username: string;
  avatar?: string;
  userId: string;
}

export default function AdminTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  
  // Send state
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const fetchTicketDetails = async () => {
    try {
      const res = await authFetch(`/api/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        setMessages(data.messages || []);
        
        // Fetch avatar URLs
        const resolvedAvatars: Record<string, string> = {};
        for (const msg of data.messages || []) {
          if (!resolvedAvatars[msg.userId]) {
            resolvedAvatars[msg.userId] = await getAvatarUrl("", msg.userId);
          }
        }
        setAvatars(resolvedAvatars);
      } else {
        navigate("/dashboard/admin/tickets");
      }
    } catch (err) {
      console.error("Failed to load admin ticket details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyLoading(true);

    try {
      const res = await authFetch(`/api/tickets/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText })
      });

      if (res.ok) {
        setReplyText("");
        fetchTicketDetails();
      }
    } catch (err) {
      console.error("Failed to send admin reply:", err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    setCloseLoading(true);
    try {
      const res = await authFetch(`/api/tickets/${id}/close`, {
        method: "PUT"
      });
      if (res.ok) {
        fetchTicketDetails();
      }
    } catch (err) {
      console.error("Failed to close ticket:", err);
    } finally {
      setCloseLoading(false);
    }
  };

  if (loading) return <SkeletonLoader />;
  if (!ticket) return null;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans max-w-3xl mx-auto">
      {/* Title Header Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <button 
          onClick={() => navigate("/dashboard/admin/tickets")}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO LIST</span>
        </button>

        <div className="flex items-center gap-3">
          {ticket.status !== "closed" && (
            <Button
              onClick={handleCloseTicket}
              disabled={closeLoading}
              className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-[10px] py-1.5 px-3 h-auto rounded transition-colors cursor-pointer"
            >
              {closeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Close Ticket"}
            </Button>
          )}
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            ticket.status === "open"
              ? "bg-emerald-500/10 text-emerald-400"
              : ticket.status === "answered"
                ? "bg-blue-500/10 text-blue-400"
                : "bg-zinc-950 border border-zinc-800 text-zinc-500"
          }`}>
            {ticket.status}
          </span>
        </div>
      </div>

      <DashboardCard title={ticket.subject} subtitle={`Opened in ${ticket.category} | Priority: ${ticket.priority}`}>
        {/* Messages timeline thread */}
        <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2 py-2 scrollbar-none flex flex-col justify-start">
          {messages.map((msg) => {
            const isStaff = msg.isStaff === 1;
            const fallbackAvatar = isStaff ? "/images/pfp/Circle/Upstream.png" : (avatars[msg.userId] || "/images/pfp/Circle/OSLO-1.png");

            return (
              <div 
                key={msg.id} 
                className={`flex gap-3.5 items-start text-xs max-w-[85%] ${
                  isStaff ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                <img src={fallbackAvatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-zinc-800 shrink-0" />
                <div className={`p-4.5 rounded-xl border leading-relaxed space-y-1.5 ${
                  isStaff 
                    ? "bg-white/[0.03] border-zinc-800/80 text-white rounded-tr-none"
                    : "bg-zinc-950/80 border-zinc-800 text-zinc-300 rounded-tl-none" 
                }`}>
                  <div className="flex justify-between items-center gap-6 border-b border-zinc-850/50 pb-1.5 mb-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                    <span>{isStaff ? "CynexCloud Staff (You)" : msg.username}</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="font-medium whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>

        {/* Input reply form */}
        {ticket.status !== "closed" && (
          <form onSubmit={handleSendReply} className="flex gap-3 border-t border-zinc-850 pt-4 mt-4">
            <textarea
              required
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-300 rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none resize-none leading-relaxed"
              placeholder="Type administrative staff reply message here..."
            />
            <Button
              type="submit"
              disabled={replyLoading || !replyText.trim()}
              className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold p-3 h-auto rounded-lg border-none cursor-pointer flex items-center justify-center shrink-0"
            >
              {replyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        )}
      </DashboardCard>
    </div>
  );
}
