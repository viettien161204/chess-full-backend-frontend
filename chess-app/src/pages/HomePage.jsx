import { Link } from 'react-router-dom'
import React, { useEffect } from 'react';
import logo from './1.png';
import chessBackground from './2.jpeg';


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
    <nav className="bg-white py-[15px] fixed top-0 left-0 right-0 z-10 w-full shadow-md rounded-[15px] border-[1px] border-gray-300 mx-auto mt-[10px] max-w-[1200px]">
  <ul className="flex justify-between items-center list-none px-[20px]">
    {/* Logo ở góc trái */}
    <li>
      <Link to="/">
        <img src={logo} alt="Mine Store Logo" className="h-[50px] w-auto" />
      </Link>
    </li>

    {/* Home ở chính giữa */}
    <li className="flex-1 text-center">
      <Link to="/" className="text-black font-bold text-[18px] no-underline ml-[100px] transition-colors duration-300 hover:text-blue-600">
        Home
      </Link>
    </li>

    {/* Register và Login ở góc phải */}
    <li className="text-right">
      <Link to="#" className="text-black font-bold text-[18px] no-underline mx-[5px] transition-colors duration-300 hover:text-blue-600">
        Register
      </Link>
      <Link to="#" className="text-black font-bold text-[18px] no-underline mx-[5px] transition-colors duration-300 hover:text-blue-600">
       | Login
      </Link>
    </li>
  </ul>
</nav>




  
<section
  className="h-[110vh] flex justify-start items-center flex-col text-center transition-transform ease-in-out duration-500 bg-cover bg-center text-white pt-[100px] pl-[30px]"
  style={{ 
    backgroundImage: `url(${chessBackground})` 
    
    }}
>
  <h1 className="text-6xl">Chess</h1>
  <p className="text-2xl mt-[10px]">Welcome to the world of Chess</p>
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
        <Link to="/" className="bg-[#5c6bc0] text-white py-[10px] px-[20px] no-underline rounded-[5px] hover:bg-[#3f51b5]">
            Chơi Ngay
          </Link>
      </div>
    </section>
  </div>   
    
  )
}

export default HomePage