"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { motion } from "framer-motion";

interface SimplePostPreviewProps {
  content: string;
  images: File[];
}

export function SimplePostPreview({ content, images }: SimplePostPreviewProps) {
  return (
    <motion.div
      initial={{ x: 20 }}
      animate={{ x: 0 }}
      exit={{ x: 20 }}
      transition={{ duration: 0.1 }}
      className="w-full shadow-none border-l border-t-0 border-b-0 border-r-0 rounded-none max-w-sm mx-auto"
    >
      <div className="p-4">
        <p className="mb-4 break-words">{content}</p>
        {images.length > 0 && (
          <Carousel className="w-full max-w-xs mx-auto">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <AspectRatio ratio={1}>
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </AspectRatio>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </div>
    </motion.div>
  );
}
