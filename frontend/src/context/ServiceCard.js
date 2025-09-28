import { motion } from "framer-motion";

export default function ServiceCard({ service }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-card hover:shadow-cardHover transition overflow-hidden"
    >
      <img src={service.image} alt={service.name} className="w-full h-44 object-cover" />
      <div className="p-5">
        <h3 className="text-lg font-bold">{service.name}</h3>
        <p className="text-gray-600 mt-1 line-clamp-2">{service.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-brand-dark font-semibold">₹{service.price}</span>
          <button className="px-4 py-2 rounded-lg bg-brand-primary text-white font-medium hover:bg-blue-600">
            Book now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
