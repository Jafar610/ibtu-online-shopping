import { Sparkles, Award, ShieldCheck, Truck } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'

export default function WhyChooseUs() {
  const features = [
    {
      icon: Sparkles,
      title: 'Authentic Ethiopian Fashion',
      amharicTitle: 'ትክክለኛ የሀበሻ ጥበብ',
      description:
        'Directly sourced from Ethiopian master weavers and skilled artisans practicing ancestral Tibeb techniques.',
    },
    {
      icon: Award,
      title: 'Quality and Craftsmanship',
      amharicTitle: 'የላቀ ጥራትና ውበት',
      description:
        'Spun from 100% genuine Ethiopian cotton (Shemma & Menen) with vibrant colorfast threads that endure.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Shopping',
      amharicTitle: 'አስተማማኝ ክፍያና ግብይት',
      description:
        'Protected transactions supporting Telebirr, CBE Birr, Chapa, and international cards with zero risk.',
    },
    {
      icon: Truck,
      title: 'Reliable Delivery',
      amharicTitle: 'ፈጣንና አስተማማኝ ማድረስ',
      description:
        'Swift delivery across Addis Ababa and all Ethiopian regions, plus expedited DHL diaspora worldwide shipping.',
    },
  ]

  return (
    <section id="why-choose-us" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="The ibtu Promise"
          title="Why Choose ibtu?"
          amharicTitle="ለምን ኢብቱን ይመርጣሉ?"
          description="We take pride in preserving Ethiopian culture while delivering a world-class luxury shopping experience."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group p-8 rounded-3xl bg-[#F8F9FA] hover:bg-[#103321] transition-all duration-300 border border-gray-100/80 hover:shadow-xl flex flex-col items-start"
              >
                {/* Icon Container with Lime Green Accent */}
                <div className="w-14 h-14 rounded-2xl bg-[#95C623]/20 group-hover:bg-[#95C623] text-[#103321] flex items-center justify-center transition-colors duration-300 mb-6 shadow-xs">
                  <Icon className="w-7 h-7 text-[#103321]" />
                </div>

                <span className="text-[11px] font-bold text-[#95C623] uppercase tracking-wider block mb-1">
                  {feature.amharicTitle}
                </span>

                <h3 className="font-serif font-bold text-lg text-[#103321] group-hover:text-white transition-colors duration-300 mb-3">
                  {feature.title}
                </h3>

                <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

