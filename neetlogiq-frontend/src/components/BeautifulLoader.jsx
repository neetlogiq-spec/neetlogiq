import React from 'react';
import '../styles/loading.css';

const BeautifulLoader = ({ 
  size = 'medium', 
  showText = false, 
  text = 'Loading...',
  className = ''
}) => {
  const sizeClass = `pl--${size}`;
  
  return (
    <div className={`loading-container ${className}`}>
      <div className={`loading-with-text ${showText ? '' : 'hidden'}`}>
        <div className={`pl ${sizeClass}`}>
          <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <g className="pl__ring-g" strokeWidth="8">
                <circle className="pl__ring" cx="80" cy="80" r="72"/>
                <circle className="pl__ring-stroke" cx="80" cy="80" r="72"/>
              </g>
              <g className="pl__ring-g" strokeWidth="8">
                <circle className="pl__ring-rotate" cx="80" cy="80" r="72"/>
                <circle className="pl__ring-stroke" cx="80" cy="80" r="72"/>
              </g>
              <g className="pl__arrows" strokeWidth="8">
                <path d="m80 148v-72"/>
                <path d="m80 8v72"/>
                <path d="m52 36l28 28l28-28"/>
                <path d="m52 124l28-28l28 28"/>
              </g>
              <g className="pl__tick" strokeWidth="8" strokeLinecap="round">
                <path d="m80 8v72"/>
                <path d="m52 36l28 28l28-28"/>
                <path d="m80 148v-72"/>
                <path d="m52 124l28-28l28 28"/>
                <path d="m80 8v72"/>
                <path d="m52 36l28 28l28-28"/>
                <path d="m80 148v-72"/>
                <path d="m52 124l28-28l28 28"/>
              </g>
            </g>
          </svg>
        </div>
        {showText && <div className="loading-text">{text}</div>}
      </div>
    </div>
  );
};

export default BeautifulLoader;
