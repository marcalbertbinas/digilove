import React from 'react'

function Header() {
  return (
 <>
  <header className="fixed top-0 w-full z-50 bg-white/20 backdrop-blur-md border-b border-white/20 px-6 py-4 flex justify-between items-center">
  <div className="flex items-center gap-2">
    {/* Heart Icon Container */}
    <div className="bg-rose-500/20 backdrop-blur-sm p-1.5 rounded-lg shadow-inner">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f43f5e" className="w-5 h-5">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3c1.74 0 3.285.834 4.312 2.122A5.496 5.496 0 0116.312 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    </div>

    {/* Brand Name */}
    <h1 className="text-xl font-bold tracking-tight text-rose-600">
      Digi<span className="text-rose-400">Love</span>
    </h1>
  </div>
</header>
 </>
    
    )
}
export default Header