import React, { useState, useEffect, useRef } from "react";
import { Gift, ArrowRight, Star, Rocket, Zap } from "lucide-react";

/**
 * PillAlert Component
 * Fully replicates the HTML/CSS behavior where the container width
 * is driven by the content's max-width transitions.
 */
const PillAlert = ({
  badgeText = "New Portfolio",
  badgeIcon: BadgeIcon = Gift,
  longText = "Visit now for new experience and updates",
  shortText = "Visit Now",
  href = "#",
  color = "#00945b",
}) => {
  const [isTriggered, setIsTriggered] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    setIsTriggered(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsTriggered(false);
    }, 3000);
  };

  const handleMouseLeave = () => {
    // Optional: Uncomment to reset immediately on leave
    // if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsTriggered(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Custom Cubic Bezier from original CSS
  const transitionStyle = {
    transitionProperty: "max-width, opacity, transform, padding",
    transitionDuration: "0.5s, 0.3s, 0.4s, 0.4s",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1), ease, ease, ease",
  };

  return (
    <div className='flex justify-center w-full px-4'>
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className='relative inline-flex items-center justify-center rounded-full bg-[#0f0f0f] p-[2px] overflow-hidden cursor-pointer group max-w-full'
        style={{
          boxShadow: isTriggered
            ? `0 0 15px ${color}40`
            : "0 4px 20px rgba(0, 0, 0, 0.3)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* Rotating Border Glow */}
        <div
          className='absolute top-[-50%] left-[-50%] w-[200%] h-[200%] z-0 animate-[spin_4s_linear_infinite]'
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, rgba(255, 255, 255, 0.1) 60deg, ${color} 120deg, rgba(255, 255, 255, 0.1) 180deg, transparent 360deg)`,
          }}
        />

        {/* Inner Content Wrapper */}
        <div className='relative z-10 bg-[#ffff] dark:bg-[#0f0f0f]  rounded-full flex items-center p-[5px] h-full w-full max-w-full'>
          {/* Badge */}
          <span
            className='flex items-center gap-1 text-white text-xs font-bold px-[14px] py-[6px] rounded-full whitespace-nowrap shrink-0 mr-1'
            style={{
              backgroundColor: color,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            {badgeText}
            {BadgeIcon && (
              <BadgeIcon size={11} strokeWidth={3} className='ml-1' />
            )}
          </span>

          {/* Text Slider Container */}
          <div className='flex items-center overflow-hidden flex-1 min-w-0'>
            {/* Long Text */}
            <span
              className='flex items-center  text-[0.85rem] font-medium whitespace-nowrap overflow-hidden'
              style={{
                ...transitionStyle,
                fontFamily: "Montserrat, sans-serif",
                maxWidth: isTriggered ? "0px" : "min(500px, 55vw)",
                opacity: isTriggered ? 0 : 1,
                transform: isTriggered ? "translateX(-10px)" : "translateX(0)",
                paddingLeft: isTriggered ? "0px" : "10px",
                paddingRight: isTriggered ? "0px" : "10px",
              }}
            >
              <span className='truncate'>{longText}</span>
              <ArrowRight
                size={13}
                className='ml-2 text-[#888] shrink-0 transition-colors duration-300 group-hover:text-[#aaa]'
              />
            </span>

            {/* Short Text */}
            <span
              className='flex items-center  text-[0.9rem] font-semibold whitespace-nowrap overflow-hidden'
              style={{
                ...transitionStyle,
                fontFamily: "Montserrat, sans-serif",
                maxWidth: isTriggered ? "150px" : "0px",
                opacity: isTriggered ? 1 : 0,
                transform: isTriggered ? "translateX(0)" : "translateX(20px)",
                paddingLeft: isTriggered ? "12px" : "0px",
                paddingRight: isTriggered ? "8px" : "0px",
              }}
            >
              {shortText}
              <ArrowRight
                size={14}
                className='ml-[6px]'
                style={{ color: color }}
              />
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default PillAlert;
