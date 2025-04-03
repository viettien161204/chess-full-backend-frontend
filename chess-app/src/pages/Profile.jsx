import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './1.png';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false); // Hiển thị form đổi mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('https://api.chessvn.io.vn/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('API Response:', response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
          const email = extractEmailFromToken(token);
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

  const extractEmailFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    const token = localStorage.getItem('token');
    const email = extractEmailFromToken(token);

    try {
      console.log('Sending change password request to /api/auth/change-password with data:', { email, oldPassword, newPassword });
      const response = await axios.post(
        'https://api.chessvn.io.vn/api/auth/change-password',
        { email, oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Response:', response.data);
      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowChangePassword(false), 2000); // Ẩn form sau 2 giây
    } catch (err) {
      console.error('Error changing password:', err.response ? err.response.data : err.message);
      setPasswordError(err.response?.data || 'Failed to change password. Please check your old password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/login');
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
      <nav className="bg-blue-900/90 shadow-[0_0_15px_rgba(59,130,246,0.5)] py-3 top-0 left-4 right-4 z-20 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md transition-colors duration-500 ease-in-out">
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
            <img
              src="https://store.playstation.com/store/api/chihiro/00_09_000/container/IE/en/99/EP4037-SLES51630_00-AVPLAYITCH000002/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=720&h=720"
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
              onClick={() => navigate('/profile')}
            />
          </li>
        </ul>
      </nav>

      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-2xl p-8 bg-gradient-to-br from-gray-900/90 to-blue-950/90 shadow-[0_0_25px_rgba(59,130,246,0.6)] rounded-xl backdrop-blur-lg border border-blue-500/60 transform hover:scale-105 transition-all duration-500">
          <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-300 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-fadeInDrop">
            My Profile
          </h1>
          <div className="space-y-6 text-blue-200">
            <div className="flex justify-center mb-6">
              <img
                src="https://store.playstation.com/store/api/chihiro/00_09_000/container/IE/en/99/EP4037-SLES51630_00-AVPLAYITCH000002/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=720&h=720"
                alt="User Avatar"
                className="w-24 h-24 rounded-full border-4 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.7)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,1)]"
              />
            </div>

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

            {/* Nút Change Password */}
            <div className="text-center mt-6">
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.7)] hover:from-blue-700 hover:to-blue-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,1)] transition-all duration-300"
              >
                {showChangePassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {/* Form Change Password */}
            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                {passwordError && <p className="text-red-500 text-center">{passwordError}</p>}
                {passwordSuccess && <p className="text-green-500 text-center">{passwordSuccess}</p>}
                <div>
                  <label className="block text-blue-200 text-sm font-bold mb-2 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]">Old Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-blue-500/50 rounded-lg bg-gray-800/80 text-blue-100 placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-gray-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(59,130,246,0.3)]"
                    placeholder="Enter your old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-blue-200 text-sm font-bold mb-2 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-blue-500/50 rounded-lg bg-gray-800/80 text-blue-100 placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-gray-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(59,130,246,0.3)]"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-blue-200 text-sm font-bold mb-2 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-blue-500/50 rounded-lg bg-gray-800/80 text-blue-100 placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-gray-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(59,130,246,0.3)]"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-2 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.7)] hover:from-blue-700 hover:to-blue-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,1)] transition-all duration-300"
                >
                  Submit
                </button>
              </form>
            )}

            {/* Nút Logout */}
            <div className="text-center mt-6">
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,53,69,0.7)] hover:from-red-700 hover:to-red-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(220,53,69,1)] transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
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
      `}</style>
    </div>
  );
};

export default Profile;