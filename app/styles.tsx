const sliderStyles = `
  [type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #2563eb; /* blue-600 */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6.5 6.5h11'/%3E%3Cpath d='M6.5 17.5h11'/%3E%3Cpath d='M3 10h18'/%3E%3Cpath d='M3 14h18'/%3E%3C/svg%3E");
    background-size: 16px;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
  }

  [type='range']::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    background: #2563eb;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6.5 6.5h11'/%3E%3Cpath d='M6.5 17.5h11'/%3E%3Cpath d='M3 10h18'/%3E%3Cpath d='M3 14h18'/%3E%3C/svg%3E");
    background-size: 16px;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
  }
`;

export default sliderStyles;