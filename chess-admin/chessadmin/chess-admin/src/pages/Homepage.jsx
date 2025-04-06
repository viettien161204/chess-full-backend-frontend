import { useState } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import Admin from "../components/Admin";
import backgroundImage from "../assets/1.jpg";

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className="min-h-screen w-screen overflow-hidden relative font-sans bg-black"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-gray-900/40 to-transparent"></div>
      <div className="flex h-screen overflow-hidden relative z-10">
        {isSidebarOpen && <SideBar />}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-16" : "ml-0"}`}>
          <Header onToggleSidebar={toggleSidebar} className="fixed top-0 w-full z-20 bg-gray-900/90 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <main className="flex-1 p-6 mt-16 overflow-auto bg-transparent">
            <Admin />
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes chessUnfold {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.5) rotate(-10deg);
            filter: blur(5px);
          }
          50% {
            opacity: 0.7;
            transform: translateY(10px) scale(1.1) rotate(5deg);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
            filter: blur(0);
          }
        }

        .animate-chessUnfold {
          animation: chessUnfold 1.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;