import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './1.png'; // Đảm bảo file logo nằm trong thư mục src hoặc điều chỉnh đường dẫn
import axios from 'axios'; // Thêm axios để gọi API

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(''); // State để hiển thị lỗi
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra token để đảm bảo người dùng đã đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Điều hướng về login nếu không có token
      return;
    }

    // Gọi API để lấy danh sách người dùng
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://150.95.112.187:8080/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Log dữ liệu trả về để kiểm tra
        console.log('API Response:', response.data);

        // Giả định API trả về một mảng các user
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Trích xuất email từ token để tìm người dùng hiện tại
          const email = extractEmailFromToken(token); // Hàm này cần được định nghĩa
          const currentUser = response.data.find(u => u.email === email);

          if (currentUser) {
            setUser(currentUser);
          } else {
            throw new Error('User not found in the response');
          }
        } else {
          throw new Error('No users data received from API');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load profile. Please try again.');
        console.error('Error fetching profile:', err.response?.data || err.message);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Hàm trích xuất email từ token JWT
  const extractEmailFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1]; // Lấy phần payload của token
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.sub; // Giả định 'sub' là email hoặc username trong token
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-blue-300">
        <p className="text-lg animate-pulse drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-red-500">
        <p className="text-lg drop-shadow-[0_0_10px_rgba(220,53,69,0.5)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-hidden min-h-screen font-sans bg-gradient-to-b from-gray-900 to-black">
      {/* Navbar */}
      <nav className="bg-blue-900/90 shadow-[0_0_15px_rgba(59,130,246,0.5)] py-3  top-0 left-4 right-4 z-20 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md transition-colors duration-500 ease-in-out">
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img src={logo} alt="Chess Logo" className="h-12 md:h-16 w-auto transition-transform duration-300 hover:scale-110" style={{ filter: `drop-shadow(0 0 10px rgba(59,130,246,0.8))` }} />
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link to="/" className="text-blue-400 hover:text-blue-200 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] font-semibold text-base md:text-lg transition-all duration-300">
              Home
            </Link>
          </li>
          <li className="text-right relative">
            <div className="relative">
              {/* Avatar (ảnh đại diện mặc định) */}
              <img
                src="https://store.playstation.com/store/api/chihiro/00_09_000/container/IE/en/99/EP4037-SLES51630_00-AVPLAYITCH000002/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=720&h=720"
                alt="User Avatar"
                className="w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
                onClick={() => navigate('/profile')} // Điều hướng về profile khi nhấp vào avatar
              />
            </div>
          </li>
        </ul>
      </nav>

      {/* Profile Content */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-2xl p-8 bg-gradient-to-br from-gray-900/90 to-blue-950/90 shadow-[0_0_25px_rgba(59,130,246,0.6)] rounded-xl backdrop-blur-lg border border-blue-500/60 transform hover:scale-105 transition-all duration-500">
          <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-300 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-fadeInDrop">
            My Profile
          </h1>
          <div className="space-y-6 text-blue-200">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <img
                src="https://store.playstation.com/store/api/chihiro/00_09_000/container/IE/en/99/EP4037-SLES51630_00-AVPLAYITCH000002/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=720&h=720"
                alt="User Avatar"
                className="w-24 h-24 rounded-full border-4 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.7)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,1)]"
              />
            </div>

            {/* User Information */}
            <div className="p-6 bg-gray-800/80 rounded-lg border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.4)] backdrop-blur-md transition-all duration-300 hover:bg-gray-700/80">
              <p className="text-lg font-semibold text-blue-300 mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">Email:</p>
              <p className="text-base text-blue-200 mb-4">{user.email || 'Not available'}</p>

              <p className="text-lg font-semibold text-blue-300 mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">First Name:</p>
              <p className="text-base text-blue-200 mb-4">{user.firstName || 'Not available'}</p>

              <p className="text-lg font-semibold text-blue-300 mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">Last Name:</p>
              <p className="text-base text-blue-200 mb-4">{user.lastName || 'Not available'}</p>

              <p className="text-lg font-semibold text-blue-300 mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">Birthday:</p>
              <p className="text-base text-blue-200 mb-4">{user.birthDay || 'Not available'}</p>

              <p className="text-lg font-semibold text-blue-300 mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">Score:</p>
              <p className="text-base text-blue-200">{user.score || 'Not available'}</p>
            </div>

            {/* Placeholder for Change Password */}
            <div className="text-center text-blue-300 italic mt-6">
              <p className="text-base drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]">
                Change Password feature will be implemented later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS cho animation
const styles = `
  @keyframes fadeInDrop {
    from {
      opacity: 0;
      transform: translateY(-20px);
      filter: blur(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }

  .animate-fadeInDrop {
    animation: fadeInDrop 1.5s ease-out;
  }
`;

export default Profile;