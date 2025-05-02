"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Image from "next/image";
import BuySubscriptionButton from "../Buttons/BuySubscriptionButton";

export interface PricingCardProps {
  title: string;
  description: string;
  price: number;
  features: string[];
  classname?: string;
  cta: string;
  planId: string;
}

export default function PricingCard({
  title,
  description,
  price,
  features,
  classname,
  planId,
  cta,
}: PricingCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Card
        className={`${classname} rounded-3xl h-full flex flex-col justify-between`}
      >
        <CardHeader>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="dark:text-emerald-600 text-emerald-950 text-xl font-semibold"
          >
            {title}
          </motion.h1>
        </CardHeader>

        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex flex-col items-start justify-center"
          >
            <div>
              {price !== 0 && (
                <p className="text-xs text-neutral-700 dark:text-neutral-400">
                  pause or cancel anytime
                </p>
              )}
              <h1 className="text-4xl font-bold pb-4">
                {price === 0 ? "Free" : `${price}$`}
              </h1>
            </div>
            <p className="description text-xs text-secondary-foreground/90">
              {description}
            </p>
          </motion.div>
          <motion.ul className="space-y-1">
            {features.map((feature, index) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex gap-2 text-sm"
              >
                <Image height={24} width={24} src="/PricingTick.svg" alt="" />{" "}
                <span>{feature}</span>
              </motion.li>
            ))}
          </motion.ul>
        </CardContent>
        <CardFooter>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <BuySubscriptionButton
              planId={planId}
              buttonTitle={cta}
              price={price}
            />
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
