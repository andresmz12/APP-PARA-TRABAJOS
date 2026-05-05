interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
}

const sizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export default function BrandLogo({ size = 'md', inverted = false }: BrandLogoProps) {
  const navyClass = inverted ? 'text-white' : 'text-navy-800';
  return (
    <span className={`font-extrabold tracking-tight leading-none ${sizes[size]}`}>
      <span className={navyClass}>chamba</span>
      <span className="text-brand-500">latin</span>
      <span className={navyClass}>app</span>
    </span>
  );
}
