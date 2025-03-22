"use client";

import React, { memo } from "react";
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

export const SimplePostPreview = memo(function SimplePostPreview({
  content,
  images,
}: SimplePostPreviewProps) {
  const [expanded, setExpanded] = React.useState(false);
  const contentIsLong = content.length > 280;
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
        <div className="px-3 pb-1">
          <div
            className={`whitespace-pre-wrap text-sm overflow-hidden ${
              !expanded && contentIsLong ? "line-clamp-4" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          {contentIsLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-medium"
            >
              {expanded ? <>...less</> : <>...more</>}
            </button>
          )}

          {images.length > 0 && (
            <Carousel className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {images.map((file, index) => (
                  <CarouselItem key={index}>
                    <AspectRatio ratio={1}>
                      {file.type.startsWith("image/") ? (
                        <Image
                          height={100}
                          width={100}
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-contain rounded"
                        />
                      ) : file.type.startsWith("video/") ? (
                        <video
                          controls
                          className="w-full h-full object-contain rounded"
                        >
                          <source
                            src={URL.createObjectURL(file)}
                            type={file.type}
                          />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/50 rounded">
                          <p className="text-sm text-muted-foreground">
                            Unsupported file type
                          </p>
                        </div>
                      )}
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
});
