import Link from 'next/link';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Button({ 
  href, 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-black uppercase transition-all duration-300 active:translate-y-0';
  
  const variants = {
    primary: 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-blue-600 hover:-translate-y-0.5',
    outline: 'border-2 border-slate-200 bg-white text-slate-900 hover:border-slate-900 hover:shadow-lg hover:-translate-y-0.5',
  };

  const sizes = {
    sm: 'px-6 py-3 text-sm tracking-widest',
    md: 'px-8 py-4 text-sm tracking-widest',
    lg: 'px-10 py-4 text-lg tracking-tighter',
  };

  return (
    <Link
      href={href}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}

