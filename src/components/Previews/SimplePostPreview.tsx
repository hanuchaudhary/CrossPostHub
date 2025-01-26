"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { motion } from "framer-motion";
import Image from "next/image";

interface SimplePostPreviewProps {
  content: string;
  images: File[];
}

export function SimplePostPreview({ content, images }: SimplePostPreviewProps) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween" }}
      className="w-full shadow-none md:border-l border-t-0 border-b-0 border-r-0 rounded-none max-w-sm mx-auto"
    >
      {!content && images.length === 0 ? (
        <div className="w-96 px-2 select-none md:flex hidden nd:border-l h-full items-center justify-center">
          <h2 className="font-ClashDisplayMedium bg-secondary/50 rounded-xl leading-none border border-secondary px-7 py-3 text-base">
            Post Preview
          </h2>
        </div>
      ) : (
        <div className="p-4">
          <p
            dangerouslySetInnerHTML={{ __html: content }}
            className="mb-4 whitespace-pre-wrap"
          />
          {images.length > 0 && (
            <Carousel className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <AspectRatio ratio={1}>
                      <Image
                        height={100}
                        width={100}
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-contain rounded"
                      />
                    </AspectRatio>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious
                className={`${images.length > 1 ? "flex" : "hidden"}`}
              />
              <CarouselNext
                className={`${images.length > 1 ? "flex" : "hidden"}`}
              />
            </Carousel>
          )}
        </div>
      )}
    </motion.div>
  );
}
