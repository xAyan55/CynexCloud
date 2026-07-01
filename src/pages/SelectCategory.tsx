import * as React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronRight, Gamepad2, Server, MessageSquare } from "lucide-react";
import { Badge } from "../components/CustomBadge";
import config from "../config.json";

export default function SelectCategory() {
  const categories = [
    {
      id: "minecraft",
      name: "Minecraft Hosting",
      description: "Lag-free gaming with Ryzen 9 performance.",
      href: "/minecraft",
      icon: <Gamepad2 className="w-8 h-8" />,
      image: config.images.categories.minecraft.background,
      logo: config.images.categories.minecraft.logo
    },
    {
      id: "vps",
      name: "VPS Hosting",
      description: "Full root access with enterprise NVMe storage.",
      href: "/vps",
      icon: <Server className="w-8 h-8" />,
      image: config.images.categories.vps.background,
      logo: config.images.categories.vps.logo
    },
    {
      id: "discord",
      name: "Discord Bot Hosting",
      description: "Keep your community active 24/7.",
      href: "/discord-bot",
      icon: <MessageSquare className="w-8 h-8" />,
      image: config.images.categories.discord.background,
      logo: config.images.categories.discord.logo
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-atmospheric opacity-40 pointer-events-none" />
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-24"
        >
          <Badge variant="outline" className="mb-6 border-white/5 text-zinc-600 px-4 py-1 uppercase tracking-[0.4em] text-[10px] glass-dark shadow-2xl">
            Choose Your Path
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-9xl font-black tracking-tighter mb-6 uppercase font-heading text-gradient">
            Select <span className="text-zinc-800 italic font-thin">Category</span>
          </h1>
          <p className="text-zinc-600 max-w-xl mx-auto text-sm sm:text-base md:text-lg font-medium italic">
            Choose the hosting solution that fits your needs. All plans include instant setup and 24/7 support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ 
                y: -20,
                transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
              }}
              className="relative group h-[450px] sm:h-[600px] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border-gradient glass shadow-2xl"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-atmospheric opacity-20 pointer-events-none" />
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full p-6 sm:p-12 flex flex-col justify-end">
                <div className="mb-4 sm:mb-8">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center mb-4 sm:mb-8 border border-white/10 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-700 overflow-hidden shadow-2xl">
                    {category.logo ? (
                      <img src={category.logo} alt={category.name} className="w-full h-full object-cover group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                    ) : (
                      category.icon
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 sm:mb-4 uppercase tracking-tighter font-heading leading-none">{category.name}</h2>
                  <p className="text-zinc-400 text-xs sm:text-base leading-relaxed mb-6 sm:mb-10 font-medium">
                    {category.description}
                  </p>
                </div>

                <Link 
                  to={category.href}
                  className="inline-flex items-center justify-center w-full bg-white text-black font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-200 transition-all duration-500 group/btn shadow-[0_0_0_rgba(255,255,255,0)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  View Plans
                  <ChevronRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-500" />
                </Link>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-1000 bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
