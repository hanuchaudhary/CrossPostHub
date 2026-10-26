export default function BubbleButton() {
  return (
    <button className="bubble-button md:h-12 h-10 md:w-28 w-24 bg-white text-black text-xs md:text-sm border rounded-full relative text-center overflow-hidden z-[1] transition-all duration-500 ease-in-out hover:text-white hover:scale-110">
      <div className="z-[9999] h-full w-full flex items-center justify-center hover:text-white transition-colors absolute left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2">
        Start now
      </div>
    </button>
  );
}
