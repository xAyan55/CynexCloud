import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MinecraftPlans from "./pages/MinecraftPlans";
import VPSPlans from "./pages/VPSPlans";
import DiscordBotPlans from "./pages/DiscordBotPlans";
import SelectCategory from "./pages/SelectCategory";
import Features from "./pages/Features";
import Support from "./pages/Support";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import KnowledgeBase from "./pages/KnowledgeBase";
import DesignSystem from "./pages/DesignSystem";
import config from "./config.json";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/minecraft" element={<MinecraftPlans />} />
              <Route path="/vps" element={<VPSPlans />} />
              <Route path="/discord-bot" element={<DiscordBotPlans />} />
              <Route path="/select-category" element={<SelectCategory />} />
              <Route path="/features" element={<Features />} />
              <Route path="/support" element={<Support />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/design-system" element={<DesignSystem />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}


