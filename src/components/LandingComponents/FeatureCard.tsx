"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
}

function FeatureCard({ title, description, image }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group"
    >
      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0 relative overflow-hidden">
          <div className="aspect-[4/3] relative">
            <motion.img
              className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-110"
              src={image || "/placeholder.svg"}
              alt={title}
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/10 transition-colors duration-500" />
          </div>

          <motion.div
            initial={{ y: 10 }}
            whileHover={{ y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 w-full px-6 py-6 z-10"
          >
            <div className="absolute top-0 left-0 bg-black blur-2xl w-[100vw] h-96 rounded-t-3xl" />

            <motion.h3
              className="text-2xl font-bold relative z-10 text-white mb-1 leading-tight"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h3>

            <motion.p
              className="text-neutral-400 text-md relative z-10"
              initial={{ y: 5 }}
              whileHover={{ y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {description}
            </motion.p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default FeatureCard;
