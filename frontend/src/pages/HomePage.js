import { motion } from "framer-motion";
import { FiSearch, FiZap, FiShield, FiClock } from "react-icons/fi";
import ServiceCard from "../components/ServiceCard";

const SERVICES = [
  { id: 1, name: "Home Cleaning", description: "Deep cleaning & sanitization", price: 799, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop" },
  { id: 2, name: "Electrician", description: "Repairs, installs, fittings", price: 299, image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop" },
  { id: 3, name: "Plumber", description: "Leaks, blockages, bathroom", price: 349, image: "https://images.unsplash.com/photo-1581578731548-219c5d4b0b7b?q=80&w=1200&auto=format&fit=crop" },
  { id: 4, name: "AC Service", description: "Service & gas refill", price: 699, image: "https://images.unsplash.com/photo-1594737625785-c6683fcefe1b?q=80&w=1200&auto=format&fit=crop" },
  { id: 5, name: "Pest Control", description: "Odourless & safe", price: 999, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop" },
  { id: 6, name: "Carpenter", description: "Repairs & custom work", price: 399, image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-white to-brand-light">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-brand-dark">
              Book trusted home services <span className="text-brand-primary">anytime</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600">
              From cleaning to repairs, LocalHands connects you with vetted professionals near you.
            </p>

            <div className="mt-6 flex items-center bg-white rounded-xl shadow-card overflow-hidden">
              <span className="px-3 text-gray-500"><FiSearch /></span>
              <input
                className="flex-1 p-3 outline-none"
                placeholder="Search for a service (e.g., cleaning, AC, electrician)"
              />
              <button className="px-5 py-3 bg-brand-primary text-white font-semibold hover:bg-blue-600">
                Search
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2"><FiShield className="text-brand-primary" /> Vetted pros</div>
              <div className="flex items-center gap-2"><FiClock className="text-brand-primary" /> On-time guarantee</div>
              <div className="flex items-center gap-2"><FiZap className="text-brand-primary" /> Instant booking</div>
            </div>
          </motion.div>

          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop"
            alt="Hero"
            className="w-full h-80 md:h-[28rem] object-cover rounded-2xl shadow-card"
          />
        </div>
      </section>

      {/* Services */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold">Popular services</h2>
          <p className="text-gray-600 mt-1">Hand-picked categories people book most</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {SERVICES.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
