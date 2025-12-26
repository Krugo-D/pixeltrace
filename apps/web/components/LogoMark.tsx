export default function LogoMark() {
  return (
    <div className="flex items-center gap-4 group">
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Brute Square Base */}
        <div className="absolute inset-0 bg-blue-600 rounded-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300" />
        <div className="absolute inset-0 bg-slate-900 rounded-lg transition-transform duration-300" />
        
        {/* Minimalist 'Trace' Element */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="3.5" 
          strokeLinecap="square" 
          className="relative z-10"
        >
          <path d="M4 4h16v16H4z" className="opacity-20" />
          <path d="M4 12h8m4 0h4M12 4v8m0 4v4" />
          <rect x="10" y="10" width="4" height="4" fill="white" stroke="none" />
        </svg>
      </div>
      
      <div className="flex flex-col justify-center">
        <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">
          PIXEL<span className="text-blue-600">TRACE</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-1">
          IP Intelligence
        </span>
      </div>
    </div>
  );
}
