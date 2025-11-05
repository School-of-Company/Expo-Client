export default function StopModal() {
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="flex h-[400px] w-full max-w-[600px] flex-col items-center justify-center gap-[40px] rounded-[20px] bg-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
        >
          <path
            d="M189.167 158.333L113.334 82.4997C120.834 63.333 116.667 40.833 100.834 24.9997C84.167 8.33303 59.167 4.99969 39.167 14.1664L75.0003 49.9997L50.0003 74.9997L13.3336 39.1664C3.33364 59.1664 7.50031 84.1664 24.167 100.833C40.0003 116.666 62.5003 120.833 81.667 113.333L157.5 189.166C160.834 192.5 165.834 192.5 169.167 189.166L188.334 170C192.5 166.666 192.5 160.833 189.167 158.333Z"
            fill="#448FFF"
          />
        </svg>
        <p className="text-h3m text-center">
          점검중입니다.
          <br /> 나중에 다시 시도해주세요
        </p>
      </div>
    </div>
  );
}
