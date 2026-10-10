import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RationCardLogo: React.FC<Props> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'h-9 w-auto',
    md: 'h-14 w-auto',
    lg: 'h-20 w-auto',
    xl: 'h-28 w-auto',
  };

  const selectedSize = className ? className : sizeMap[size];

  return (
    <div className={`inline-flex items-center shrink-0 select-none ${selectedSize}`}>
      <svg
        viewBox="0 0 220 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto drop-shadow-sm"
        style={{ aspectRatio: '2.2 / 1' }}
      >
        {/* Outer Rounded Container Border */}
        <rect
          x="2"
          y="2"
          width="216"
          height="96"
          rx="22"
          fill="#0D8D44"
          stroke="#0B7337"
          strokeWidth="3"
        />

        {/* Right White Card Section */}
        <path
          d="M142 2 H198 C209.046 2 218 10.954 218 22 V78 C218 89.046 209.046 98 198 98 H142 V2 Z"
          fill="#FFFFFF"
        />

        {/* Vertical divider line */}
        <line x1="142" y1="2" x2="142" y2="98" stroke="#0D8D44" strokeWidth="2.5" />

        {/* Left Side: Arabic Typography "البطاقة التموينية" */}
        <g fill="#FFFFFF" textAnchor="middle">
          {/* Top Word: البطاقة (Al-Bitaqa) */}
          <text
            x="72"
            y="42"
            fontFamily="'Cairo', 'Amiri', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif"
            fontWeight="900"
            fontSize="32"
            letterSpacing="0.5"
            style={{ direction: 'rtl' }}
            fill="#FFFFFF"
          >
            البطاقة
          </text>

          {/* Bottom Word: التموينية (Al-Tamwīniyyah) */}
          <text
            x="72"
            y="82"
            fontFamily="'Cairo', 'Amiri', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif"
            fontWeight="900"
            fontSize="31"
            letterSpacing="0.5"
            style={{ direction: 'rtl' }}
            fill="#FFFFFF"
          >
            التموينية
          </text>
        </g>

        {/* Right Side: Golden Laurel Wreath + Iraqi Eagle Emblem + Green Hand */}
        <g transform="translate(142, 0)">
          {/* Golden Laurel Wreath around top emblem */}
          <circle cx="38" cy="33" r="23" stroke="#E6A817" strokeWidth="2" strokeDasharray="3 2" fill="none" opacity="0.9" />
          <path
            d="M20 33 C20 20 28 14 38 14 C48 14 56 20 56 33 C56 44 48 50 38 50 C28 50 20 44 20 33 Z"
            stroke="#D99B0D"
            strokeWidth="1.5"
            fill="#FFFBF0"
          />

          {/* Coat of Arms of Iraq (Eagle of Saladin) */}
          {/* Golden Eagle Wings & Body */}
          <path
            d="M38 18 L34 24 L27 28 L30 36 L34 37 L38 43 L42 37 L46 36 L49 28 L42 24 Z"
            fill="#BF820A"
          />
          {/* Eagle Head & Crown */}
          <path
            d="M38 15 C36.5 15 36 17 38 19 C40 17 39.5 15 38 15 Z"
            fill="#8C5C00"
          />

          {/* Iraqi Flag Shield in Center (Red, White, Black vertical/horizontal stripes) */}
          <g transform="translate(34, 25)">
            <rect x="0" y="0" width="8" height="4" fill="#CE1126" />
            <rect x="0" y="4" width="8" height="4" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.3" />
            <rect x="0" y="8" width="8" height="4" fill="#000000" />
            {/* Green Takbir dots in white stripe */}
            <circle cx="4" cy="6" r="0.8" fill="#0D8D44" />
          </g>

          {/* Green Supportive Hand Holding the Ration System (at bottom of white area) */}
          {/* Stylized Open Hand in brand green #0D8D44 */}
          <path
            d="M17 76 
               L30 63 
               C33 60 38 60 41 63 
               L49 71 
               C52 74 57 74 61 70 
               L67 64 
               C69 62 72 63 73 66 
               L70 75 
               C65 83 58 87 48 87 
               L24 87 
               C19 87 15 83 15 78 
               Z"
            fill="#0D8D44"
          />
          {/* Hand Palm Thumb Contour */}
          <path
            d="M26 69 L38 57 C41 54 45 55 47 58 L44 65 Z"
            fill="#0A7538"
          />
        </g>
      </svg>
    </div>
  );
};
