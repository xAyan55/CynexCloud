import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  BookOpen, 
  Terminal, 
  Database, 
  Cpu, 
  CreditCard, 
  ChevronRight, 
  Server,
  ArrowLeft,
  ThumbsUp,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  content: string[];
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const categories = ["All", "Minecraft", "VPS", "Discord Bot", "Billing"];

  const articles: Article[] = [
    {
      id: "sftp-access",
      category: "VPS",
      title: "How to Connect to Your VPS via SFTP",
      excerpt: "Learn how to establish a secure file transfer protocol connection to manage your VPS files.",
      readTime: "3 min read",
      content: [
        "Connecting via SFTP (Secure File Transfer Protocol) allows you to securely upload, download, and organize files on your virtual private server.",
        "Step 1: Download and install an SFTP client such as FileZilla or Cyberduck.",
        "Step 2: Retrieve your VPS credentials from your CynexCloud panel. You will need the server IP, SSH port (usually 22), username (typically root), and your SSH key or password.",
        "Step 3: Open your client and choose 'New Connection' or use 'Quickconnect'. Enter sftp://YOUR_SERVER_IP in the host field, input root as the user, and supply your password or browse for your private SSH key.",
        "Step 4: Click Connect. Accept the host key fingerprint if this is your first time establishing a connection. You are now ready to browse your server directory structure."
      ]
    },
    {
      id: "java-version",
      category: "Minecraft",
      title: "Changing the Java Version of Your Minecraft Server",
      excerpt: "Easily update or downgrade your Java environment to support custom modpacks or older versions.",
      readTime: "2 min read",
      content: [
        "Minecraft versions require specific Java runtimes to run optimally. For instance, Minecraft 1.20+ requires Java 17 or Java 21, while 1.12.2 requires Java 8.",
        "Step 1: Log into the CynexCloud game server panel and stop your Minecraft server instance.",
        "Step 2: Go to 'Settings' or 'Startup Configuration' in the sidebar menu.",
        "Step 3: Locate the 'Java Version' selector dropdown menu.",
        "Step 4: Select your desired version (e.g., java-17, java-21, or java-8).",
        "Step 5: Navigate back to the main console page and click Start. The panel will automatically utilize the selected runtime binary for your server process."
      ]
    },
    {
      id: "discord-scripts",
      category: "Discord Bot",
      title: "Uploading and Launching Custom Discord Bot Scripts",
      excerpt: "Step-by-step guide to deploying Node.js or Python discord bots onto our bot hosting nodes.",
      readTime: "4 min read",
      content: [
        "CynexCloud Bot Hosting supports multiple language environments. Here is how to launch your bot script seamlessly.",
        "Step 1: Bundle your bot scripts. Ensure you have your main file (index.js, main.py, etc.) and your package file (package.json or requirements.txt) at the root level.",
        "Step 2: Log into your bot control panel and select your instance. Navigate to the 'File Manager'.",
        "Step 3: Upload your bundled zip or individual files using the drag-and-drop area or standard SFTP connection.",
        "Step 4: Go to the 'Console' page and run the dependency installation (e.g., 'npm install' or 'pip install -r requirements.txt'). This can also be automated in our panel setup scripts.",
        "Step 5: Configure your bot start file in the Startup settings. Click Start on the main console to bring your bot online."
      ]
    },
    {
      id: "domain-pointer",
      category: "VPS",
      title: "Pointing a Custom Domain to Your Server",
      excerpt: "Learn how to configure your DNS settings to bind a unique domain to your games or VPS.",
      readTime: "3 min read",
      content: [
        "Using a custom domain (e.g., play.myserver.com) replaces the need to remember numerical IP addresses.",
        "Step 1: Log into your domain registrar dashboard (e.g., Namecheap, Cloudflare, or GoDaddy) where your domain is registered.",
        "Step 2: Open the DNS Zone Editor for the domain you wish to use.",
        "Step 3: Create a new 'A' record. Set the Host/Name to '@' (for main domain) or 'play' (for a subdomain like play.yourdomain.com), and set the Value/Points to to your CynexCloud server IP address.",
        "Step 4: Set the TTL (Time to Live) to automatic or 300 seconds, and save the DNS record.",
        "Step 5: (Minecraft only) If your server uses a non-standard port (not 25565), you will also need to configure a SRV record pointing to your newly created A record. DNS propagation can take up to a few hours."
      ]
    },
    {
      id: "billing-cycle",
      category: "Billing",
      title: "How to Upgrade or Downgrade Your Billing Cycle",
      excerpt: "Manage subscription plans, modify billing intervals, and apply account credits.",
      readTime: "2 min read",
      content: [
        "We allow full flexibility on subscription periods. You can transition your plan between monthly, quarterly, or annual billing at any point.",
        "Step 1: Log into the CynexCloud Billing Area using your account credentials.",
        "Step 2: Go to 'Services' -> 'My Services' and click on the specific server plan you want to edit.",
        "Step 3: In the left sidebar or actions menu, select 'Upgrade/Downgrade Option'.",
        "Step 4: Select your preferred billing interval or tier. The system will calculate the pro-rata cost of your remaining billing cycle.",
        "Step 5: Settle the pro-rata invoice to complete the transition. The resource allocation and billing schedules will adjust immediately."
      ]
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Minecraft": return <Server className="w-4 h-4 text-zinc-400" />;
      case "VPS": return <Cpu className="w-4 h-4 text-zinc-400" />;
      case "Discord Bot": return <Terminal className="w-4 h-4 text-zinc-400" />;
      case "Billing": return <CreditCard className="w-4 h-4 text-zinc-400" />;
      default: return <BookOpen className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 text-white">
      {/* Header Banner */}
      <section className="relative py-12 md:py-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-atmospheric opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-4 border border-white/5 text-zinc-500 px-4 py-1.5 uppercase tracking-[0.4em] text-[10px] bg-zinc-950/80 rounded-full">
              Self-Service Hub
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase font-heading text-gradient">
              Knowledge Base
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto font-medium leading-relaxed">
              Find instant answers, guide steps, and configurations prepared by our lead systems engineers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Container */}
      <section className="container mx-auto px-6 mt-12 md:mt-16 relative z-10">
        <AnimatePresence mode="wait">
          {!activeArticle ? (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Search & Category Filter */}
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-white/5 pb-8">
                {/* Search input */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles (e.g., SFTP, Java)..."
                    className="w-full pl-12 pr-6 py-3 text-sm dashboard-input rounded-full"
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                        selectedCategory === cat
                          ? "bg-white text-black scale-105"
                          : "bg-zinc-950 text-zinc-500 border border-white/5 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article, idx) => (
                    <div
                      key={article.id}
                      onClick={() => {
                        setActiveArticle(article);
                        setFeedbackSubmitted(false);
                      }}
                      className="group rounded-3xl border border-white/5 bg-zinc-950/40 p-6 md:p-8 hover:bg-zinc-900/40 hover:border-white/10 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                            {getCategoryIcon(article.category)}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            {article.category}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-bold ml-auto flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-gradient mb-2 group-hover:text-white transition-colors font-heading">
                          {article.title}
                        </h3>
                        <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                        Read Guide
                        <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-20 bg-zinc-950/20 border border-white/5 rounded-3xl">
                    <p className="text-zinc-500 font-medium text-sm">No knowledge articles found matching your query.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="article-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto bg-zinc-950/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12"
            >
              {/* Back Button */}
              <button
                onClick={() => setActiveArticle(null)}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Knowledge Base
              </button>

              {/* Meta */}
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                  {getCategoryIcon(activeArticle.category)}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {activeArticle.category}
                </span>
                <span className="text-[10px] text-zinc-600 font-bold ml-auto flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activeArticle.readTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-6 font-heading">
                {activeArticle.title}
              </h1>

              {/* Content */}
              <div className="space-y-6 border-b border-white/5 pb-10 mb-10">
                {activeArticle.content.map((paragraph, idx) => {
                  if (paragraph.startsWith("Step")) {
                    return (
                      <h4 key={idx} className="text-sm font-black uppercase tracking-wider text-white mt-6 font-heading">
                        {paragraph}
                      </h4>
                    );
                  }
                  return (
                    <p key={idx} className="text-zinc-400 text-sm leading-relaxed font-medium">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Feedback Block */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white mb-1 font-heading">Was this article helpful?</h4>
                  <p className="text-zinc-500 text-xs">Your feedback helps improve our configurations guides.</p>
                </div>

                <div className="flex gap-3">
                  {feedbackSubmitted ? (
                    <span className="text-xs font-bold text-zinc-400 bg-zinc-900 border border-white/5 px-4 py-2.5 rounded-xl">
                      Thank you for your rating!
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => setFeedbackSubmitted(true)}
                        className="flex items-center gap-2 bg-zinc-900 border border-white/5 hover:border-white/20 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white px-4 py-2.5 rounded-xl transition-all"
                      >
                        <ThumbsUp className="w-4.5 h-4.5" />
                        Yes, it was
                      </button>
                      <button
                        onClick={() => setFeedbackSubmitted(true)}
                        className="bg-zinc-900 border border-white/5 hover:border-white/20 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 px-4 py-2.5 rounded-xl transition-all"
                      >
                        No
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
