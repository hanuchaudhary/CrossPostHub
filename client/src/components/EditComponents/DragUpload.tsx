import { useDropzone } from "react-dropzone";

export const DragUpload = ({ store }: { store: any }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      store.setBackground({ ...store.background, image: url });
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-dashed border-2 p-4 rounded-lg text-center cursor-pointer"
    >
      <input {...getInputProps()} />
      <p>Drag & drop an image or click to upload</p>
    </div>
  );
};
