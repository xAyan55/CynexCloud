export default function FallbackLoader() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 select-none">
      <img
        src="/images/main-imgs/cynex-tp.png"
        alt="CynexCloud"
        className="h-10 object-contain opacity-80"
      />
      <div className="w-5 h-5 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
    </div>
  )
}
