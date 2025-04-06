import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import backgroundImage from "../assets/1.jpg";
import { FaServer, FaChartLine, FaEye, FaShieldAlt, FaUsers } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ServerPerformancePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [performanceData, setPerformanceData] = useState({
    avgResponseTime: 0,
    errorRate: 0,
    requestsPerSecond: 0,
    pageViews: 0,
    threats: 0,
    uniques: 0,
  });

  useEffect(() => {
    fetchServerPerformance();
    const interval = setInterval(fetchServerPerformance, 30000); // Cập nhật mỗi 30 giây
    
    return () => clearInterval(interval);
  }, []);

  const fetchServerPerformance = async () => {
    try {
      const response = await fetch("https://api.chessvn.io.vn/api/cloudflare/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data || !result.data.viewer || !result.data.viewer.zones[0]) {
        throw new Error("No valid data returned from Cloudflare API");
      }

      const httpRequests = result.data.viewer.zones[0].httpRequests1hGroups || [];

      if (httpRequests.length === 0) {
        setError("No traffic data available for the past hour.");
        if (!trafficData.length) {
          setTrafficData([]);
          setPerformanceData({
            avgResponseTime: 0,
            errorRate: 0,
            requestsPerSecond: 0,
            pageViews: 0,
            threats: 0,
            uniques: 0,
          });
        }
      } else {
        const newTrafficData = httpRequests.map((entry) => ({
          time: new Date(entry.dimensions.datetime).toLocaleTimeString(),
          requests: entry.sum.requests,
          bytes: entry.sum.bytes / 1024 / 1024,
          pageViews: entry.sum.pageViews,
          threats: entry.sum.threats,
        }));
        setTrafficData((prevData) => {
          const updatedData = [...prevData, ...newTrafficData];
          return updatedData.slice(-100); // Giới hạn 100 điểm
        });

        const totalRequests = httpRequests.reduce((sum, entry) => sum + entry.sum.requests, 0);
        const totalPageViews = httpRequests.reduce((sum, entry) => sum + entry.sum.pageViews, 0);
        const totalThreats = httpRequests.reduce((sum, entry) => sum + entry.sum.threats, 0);
        const totalUniques = httpRequests[httpRequests.length - 1].uniq.uniques;
        const requestsPerSecond = totalRequests / (60 * 60); // 1 giờ

        setPerformanceData({
          avgResponseTime: 0, // Không có TTFB từ GraphQL
          errorRate: 0, // Không có dữ liệu mã trạng thái
          requestsPerSecond: requestsPerSecond.toFixed(2),
          pageViews: totalPageViews,
          threats: totalThreats,
          uniques: totalUniques,
        });
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching server performance:", error);
      setError(error.message || "Unable to load server performance data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-green-900/40 to-transparent"></div>
      <div className="flex h-screen overflow-hidden relative z-10">
        <SideBar />
        <div className="flex-1 flex flex-col">
          <Header className="fixed top-0 w-full z-20" />
          <main className="flex-1 p-6 mt-16 overflow-auto bg-transparent">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-200 mb-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                Hiệu suất Server
              </h1>

              <div className="bg-gray-900/80 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.6)] backdrop-blur-lg p-6 neon-border">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        border: "4px solid #C0C0C0",
                        borderTop: "4px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    ></div>
                    <p className="text-green-200 mt-4">Loading server performance...</p>
                  </div>
                ) : error ? (
                  <p className="text-green-200 text-center">{error}</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-gray-800/70 rounded-lg border border-green-500/40 text-green-100 hover:bg-green-900/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-300">
                        <h3 className="text-lg font-semibold flex items-center">
                          <FaServer className="mr-2" /> Thời gian phản hồi trung bình
                        </h3>
                        <p className="text-2xl">{performanceData.avgResponseTime} ms</p>
                      </div>
                      <div className="p-4 bg-gray-800/70 rounded-lg border border-green-500/40 text-green-100 hover:bg-green-900/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-300">
                        <h3 className="text-lg font-semibold flex items-center">
                          <FaChartLine className="mr-2" /> Yêu cầu mỗi giây
                        </h3>
                        <p className="text-2xl">{performanceData.requestsPerSecond}</p>
                      </div>
                      <div className="p-4 bg-gray-800/70 rounded-lg border border-green-500/40 text-green-100 hover:bg-green-900/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-300">
                        <h3 className="text-lg font-semibold flex items-center">
                          <FaEye className="mr-2" /> Lượt xem trang
                        </h3>
                        <p className="text-2xl">{performanceData.pageViews}</p>
                      </div>
                      <div className="p-4 bg-gray-800/70 rounded-lg border border-green-500/40 text-green-100 hover:bg-green-900/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-300">
                        <h3 className="text-lg font-semibold flex items-center">
                          <FaShieldAlt className="mr-2" /> Mối đe dọa
                        </h3>
                        <p className="text-2xl">{performanceData.threats}</p>
                      </div>
                      <div className="p-4 bg-gray-800/70 rounded-lg border border-green-500/40 text-green-100 hover:bg-green-900/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-300">
                        <h3 className="text-lg font-semibold flex items-center">
                          <FaUsers className="mr-2" /> Người dùng duy nhất
                        </h3>
                        <p className="text-2xl">{performanceData.uniques}</p>
                      </div>
                      <div className="p-4 bg-gray-800/70 rounded-lg border border-green-500/40 text-green-100 hover:bg-green-900/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-300">
                        <h3 className="text-lg font-semibold">Tỷ lệ lỗi</h3>
                        <p className="text-2xl">{performanceData.errorRate}%</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h2 className="text-2xl font-bold text-green-200 flex items-center mb-4">
                        <FaChartLine className="mr-3 text-green-500" /> Lưu lượng truy cập (1h qua)
                      </h2>
                      <div style={{ height: "400px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trafficData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="time" stroke="#A7F3D0" />
                            <YAxis yAxisId="left" stroke="#A7F3D0" />
                            <YAxis yAxisId="right" orientation="right" stroke="#A7F3D0" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1F2937",
                                border: "1px solid #4B5563",
                                color: "#D1D5DB",
                              }}
                            />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="requests"
                              name="Yêu cầu"
                              stroke="#34D399"
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="bytes"
                              name="Bytes (MB)"
                              stroke="#10B981"
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="pageViews"
                              name="Lượt xem trang"
                              stroke="#FBBF24"
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="threats"
                              name="Mối đe dọa"
                              stroke="#EF4444"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes neonGlowGreen {
          0% {
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.5),
              0 0 30px rgba(34, 197, 94, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.4),
              0 0 40px rgba(34, 197, 94, 0.3);
          }
          100% {
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.5),
              0 0 30px rgba(34, 197, 94, 0.4);
          }
        }
        .neon-border {
          animation: neonGlowGreen 2s infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default ServerPerformancePage;