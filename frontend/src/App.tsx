import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import ChaptersPage from "./pages/ChaptersPage";
import ChapterDetailPage from "./pages/ChapterDetailPage";
import MemoryDetailPage from "./pages/MemoryDetailPage";
import SubmitPage from "./pages/SubmitPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/chapters" element={<ChaptersPage />} />
        <Route path="/chapters/:chapterId" element={<ChapterDetailPage />} />
        <Route path="/chapters/:chapterId/:pageNum" element={<MemoryDetailPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main style={{ minHeight: "calc(100vh - 180px)", display: "flex", flexDirection: "column" }}>
        <AnimatedRoutes />
      </main>
      <Footer />
    </BrowserRouter>
  );
}
