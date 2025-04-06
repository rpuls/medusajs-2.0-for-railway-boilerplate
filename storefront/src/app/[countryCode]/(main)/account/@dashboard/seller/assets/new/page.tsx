import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Upload New Asset",
  description: "Upload a new digital asset to your store.",
};

export default async function UploadAssetPage() {
  const t = await getTranslations("account");

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Upload New Asset</h1>
        <p className="text-base-regular">
          Fill out the form below to upload a new digital asset to your store.
        </p>
      </div>

      <form className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-2">
          <h2 className="text-xl-semi">Asset Information</h2>
          
          <div className="grid grid-cols-1 gap-y-4">
            <div>
              <label htmlFor="title" className="block text-base-semi mb-2">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="w-full p-2 border border-gray-200 rounded-md"
                placeholder="Enter asset title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-base-semi mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className="w-full p-2 border border-gray-200 rounded-md"
                placeholder="Describe your asset in detail"
                required
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-base-semi mb-2">
                Price (USD)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-200 rounded-md"
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-base-semi mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="w-full p-2 border border-gray-200 rounded-md"
                required
              >
                <option value="">Select a category</option>
                <option value="3d-models">3D Models</option>
                <option value="textures">Textures</option>
                <option value="sound-effects">Sound Effects</option>
                <option value="game-assets">Game Assets</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-base-semi mb-2">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                className="w-full p-2 border border-gray-200 rounded-md"
                placeholder="e.g. fantasy, medieval, low-poly"
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-y-2">
          <h2 className="text-xl-semi">Asset Files</h2>
          
          <div className="grid grid-cols-1 gap-y-4">
            <div>
              <label htmlFor="mainFile" className="block text-base-semi mb-2">
                Main Asset File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-2">Drag and drop your file here, or click to browse</p>
                <input
                  id="mainFile"
                  name="mainFile"
                  type="file"
                  className="w-full"
                  required
                />
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Max file size: 1GB. Supported formats depend on asset type.
              </p>
            </div>
            
            <div>
              <label htmlFor="previewImages" className="block text-base-semi mb-2">
                Preview Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-2">Drag and drop your images here, or click to browse</p>
                <input
                  id="previewImages"
                  name="previewImages"
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full"
                  required
                />
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Upload at least one preview image. Max 5 images. JPG, PNG formats.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-y-2">
          <h2 className="text-xl-semi">Additional Information</h2>
          
          <div className="grid grid-cols-1 gap-y-4">
            <div>
              <label htmlFor="version" className="block text-base-semi mb-2">
                Version
              </label>
              <input
                id="version"
                name="version"
                type="text"
                className="w-full p-2 border border-gray-200 rounded-md"
                placeholder="e.g. 1.0"
              />
            </div>
            
            <div>
              <label htmlFor="changelog" className="block text-base-semi mb-2">
                Changelog
              </label>
              <textarea
                id="changelog"
                name="changelog"
                rows={3}
                className="w-full p-2 border border-gray-200 rounded-md"
                placeholder="Initial release"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-x-4">
          <button type="submit" className="btn-primary">
            Submit for Review
          </button>
          <Link href="/account/seller" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
