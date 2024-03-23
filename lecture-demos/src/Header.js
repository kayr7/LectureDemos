import React from 'react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white p-6 shadow-md">
      <h1 className="text-center text-3xl md:text-4xl font-semibold">
        <a href="/" className="hover:text-blue-300 transition duration-150 ease-in-out">Demos and Experiments for Lectures</a>
      </h1>
    </header>
  );
};

export default Header;
