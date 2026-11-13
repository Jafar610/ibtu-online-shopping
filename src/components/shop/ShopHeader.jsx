import Breadcrumb from '../common/Breadcrumb'

export default function ShopHeader({ totalCount }) {
  return (
    <section className="relative bg-[#103321] overflow-hidden py-10 sm:py-14">
      {/* Decorative pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #95C623 0px,
            #95C623 2px,
            transparent 2px,
            transparent 20px
          ), repeating-linear-gradient(
            -45deg,
            #95C623 0px,
            #95C623 2px,
            transparent 2px,
            transparent 20px
          )`,
        }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#95C623]/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shop' },
          ]}
        />

        {/* Header content */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#95C623] px-3 py-1 rounded-full bg-[#95C623]/15 inline-block mb-3">
              Discover Your Style
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              Explore Our Collection
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/60 max-w-xl leading-relaxed">
              Discover beautiful Ethiopian fashion, timeless traditional clothing, and modern styles
              designed to celebrate your identity.
            </p>
          </div>

          {/* Product count badge */}
          <div className="shrink-0 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5 self-start sm:self-auto">
            <span className="font-serif text-2xl font-bold text-[#95C623]">{totalCount}</span>
            <span className="text-xs text-white/70 leading-tight">
              Products<br />Available
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

