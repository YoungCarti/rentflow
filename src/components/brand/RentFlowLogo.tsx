import type { SVGProps } from "react";

export default function RentFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="20 14 108 114"
      role="img"
      aria-label="RentFlow"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        className="fill-[#142236] dark:fill-white"
        d="M22 14h48c12.9 0 24.5 4.7 33.1 13.4C111.8 36 116 46.4 116 58.4c0 17.2-9.2 31.1-24.7 38.2L113 119H84.8L63 96.2v22.8H22V14Z"
      />
      <path
        className="fill-white dark:fill-[#142236]"
        d="M49 53.4 64.4 41c1.9-1.5 4.6-1.5 6.5 0l15.3 12.4c1.8 1.4 2.8 3.5 2.8 5.8v21.2c0 4.4-3.1 8.2-7.4 9l-12.3 2.2c-7.8 1.4-14.8 5.6-19.8 11.7l-7.5 9.2-17.5-18.3V72.5c0-2.3 1-4.4 2.8-5.8Z"
      />
      <path
        className="fill-[#142236] dark:fill-white"
        d="M57.2 59.8h10.2v10.2H57.2V59.8Zm14 0h10.2v10.2H71.2V59.8Zm-14 14h10.2V84H57.2V73.8Zm14 0h10.2V84H71.2V73.8Z"
      />
      <path
        className="fill-white dark:fill-[#142236]"
        d="M57.2 88.9c7.5 16.2 25.4 27 50 25v9.1l18.8-18.8-18.8-18.8v10.2c-21.4 2.4-36.2-2.3-44.1-13.8-2.5-3.6-7.8 3.2-5.9 7.1Z"
      />
      <path
        fill="#06C8EE"
        d="M50.2 82.2c8.8 24.7 29.5 38.8 57 36.3V128l18.8-18.8-18.8-18.8v10.1c-22.7 2.5-38.8-4.2-48.4-20.3-3.6-6.1-11.1-5.2-8.6 2Z"
      />
    </svg>
  );
}
