import { Link } from 'react-router-dom'
import React, { useEffect } from 'react';
const HomePage = () => {
    useEffect(() => {
        let currentSection = 0;
        const sections = document.querySelectorAll('section');
    
        const handleWheel = (e) => {
          if (e.deltaY > 0) {
            // Cuộn xuống
            if (currentSection < sections.length - 1) {
              currentSection++;
            }
          } else {
            // Cuộn lên
            if (currentSection > 0) {
              currentSection--;
            }
          }
          // Di chuyển đến section mới
          sections.forEach((section) => {
            section.style.transform = `translateY(-${currentSection * 100}vh)`;
          });
        };
    
        window.addEventListener('wheel', handleWheel);
        return () => {
          window.removeEventListener('wheel', handleWheel);
        };
      }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
    {/* Navigation */}
    <nav className="bg-[#333] py-[15px] fixed top-0 left-0 right-0 z-10 w-full">
      <ul className="flex justify-between items-center list-none px-[20px]">
        <li className="mx-[15px] last:ml-0">
          <a href="index.html" className="text-white font-bold text-[18px] no-underline">
            Trang Chủ
          </a>
        </li>
        <li className="mx-[15px] last:ml-0">
          <a href="#" className="text-white font-bold text-[18px] no-underline">
            Đăng Ký
          </a>
        </li>
        <li className="mx-[15px] last:ml-0">
          <a href="#" className="text-white font-bold text-[18px] no-underline">
            Đăng Nhập
          </a>
        </li>
      </ul>
    </nav>

    {/* Section Trang chủ */}
    <section className="h-[110vh] flex justify-center items-center flex-col text-center transition-transform ease-in-out duration-500 bg-[#4caf50] text-white">
      <h1 className="text-5xl">Website Cờ Vua</h1>
      <p>Chào mừng đến với thế giới cờ vua của chúng tôi!</p>
    </section>

    {/* Section Chơi Offline */}
    <section className="h-[110vh] flex justify-center items-center flex-col text-center transition-transform ease-in-out duration-500 bg-[#3f51b5] text-white">
      <div className="bg-white rounded-lg p-5 text-[#333] w-4/5 max-w-[400px] shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
        <h2 className="mb-[20px] text-[#333]">Chơi Offline</h2>
        <p className="mb-[20px] text-[#666]">Hai người cùng chơi trên một máy tính.</p>
        <Link to="/chess" className="bg-[#5c6bc0] text-white py-[10px] px-[20px] no-underline rounded-[5px] hover:bg-[#3f51b5]">
            Chơi Ngay
          </Link>
      </div>
    </section>

    {/* Section Chơi Online */}
    <section className="h-[110vh] flex justify-center items-center flex-col text-center transition-transform ease-in-out duration-500 bg-[#3f51b5] text-white">
      <div className="bg-white rounded-lg p-5 text-[#333] w-4/5 max-w-[400px] shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
        <h2 className="mb-[20px] text-[#333]">Chơi Online</h2>
        <p className="mb-[20px] text-[#666]">
          Thách thức bạn bè hoặc người chơi ngẫu nhiên từ khắp nơi trên thế giới.
        </p>
        <Link to="/" className="bg-[#5c6bc0] text-white py-[10px] px-[20px] no-underline rounded-[5px] hover:bg-[#3f51b5]">
            Chơi Ngay
          </Link>
      </div>
    </section>

    {/* Section Chơi Với Bot */}
    <section className="h-[110vh] flex justify-center items-center flex-col text-center transition-transform ease-in-out duration-500 bg-[#3f51b5] text-white">
      <div className="bg-white rounded-lg p-5 text-[#333] w-4/5 max-w-[400px] shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
        <h2 className="mb-[20px] text-[#333]">Chơi Với Bot</h2>
        <p className="mb-[20px] text-[#666]">
          Chơi với một con bot AI thông minh để cải thiện kỹ năng của bạn.
        </p>
        <Link to="/chess" className="bg-[#5c6bc0] text-white py-[10px] px-[20px] no-underline rounded-[5px] hover:bg-[#3f51b5]">
            Chơi Ngay
          </Link>
      </div>
    </section>
  </div>   
    
  )
}

export default HomePage