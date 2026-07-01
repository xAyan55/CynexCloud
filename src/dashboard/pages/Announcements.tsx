import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import DashboardCard from "../components/DashboardCard";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import { Megaphone, Calendar } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  poster: string;
  createdAt: string;
}

export default function Announcements() {
  const { authFetch } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const res = await authFetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">System Announcements</h2>
        <p className="text-xs text-zinc-500 font-medium">Keep track of our system releases, platform improvements, and service status updates.</p>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-5">
          {announcements.map((ann) => (
            <div key={ann.id}>
              <DashboardCard
                title={ann.title}
                headerAction={
                  <div className="flex items-center gap-1.5 text-zinc-500 font-bold uppercase tracking-wider text-[9px] bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                }
              >
                <div className="space-y-4 pt-1 text-xs">
                  <span className="text-[9px] font-bold text-zinc-400 bg-white/[0.04] border border-zinc-800/80 px-2 py-0.5 rounded uppercase tracking-wider">
                    {ann.category}
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    {ann.content}
                  </p>
                  <div className="text-[10px] text-zinc-655 font-bold flex justify-between items-center border-t border-zinc-800/40 pt-3">
                    <span>POSTED BY: {ann.poster}</span>
                    <span>SYSTEM NOTIFICATION</span>
                  </div>
                </div>
              </DashboardCard>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No system announcements"
          description="There are no system updates or alerts currently published."
          icon={Megaphone}
        />
      )}
    </div>
  );
}
