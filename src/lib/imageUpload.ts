import imageCompression from "browser-image-compression";
import { toast } from "@/hooks/use-toast";

const MAX_FILE_SIZE_MB = 50;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

export type ImageUploadPreset = "general" | "profile" | "summit";

const PRESET_OPTIONS: Record<ImageUploadPreset, { maxWidthOrHeight: number; quality: number }> = {
  general: { maxWidthOrHeight: 1920, quality: 0.8 },
  profile: { maxWidthOrHeight: 400, quality: 0.85 },
  summit: { maxWidthOrHeight: 1920, quality: 0.85 },
};

function getFileExtension(name: string): string {
  return name.slice(name.lastIndexOf(".")).toLowerCase();
}

function isAllowedFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  if (ALLOWED_EXTENSIONS.includes(ext)) return true;
  if (ALLOWED_TYPES.includes(file.type)) return true;
  return false;
}

function isHeicFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return ext === ".heic" || ext === ".heif" || file.type === "image/heic" || file.type === "image/heif";
}

/**
 * Convert HEIC/HEIF to JPEG using heic2any
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const blob = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });
  const resultBlob = Array.isArray(blob) ? blob[0] : blob;
  return new File([resultBlob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
    type: "image/jpeg",
  });
}

/**
 * Validates and compresses an image file before upload.
 * Returns the compressed File, or null if validation fails.
 */
export async function compressImage(
  file: File,
  preset: ImageUploadPreset = "general"
): Promise<File | null> {
  // Check file size (50MB max)
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    toast({
      title: "파일 크기 초과",
      description: `최대 ${MAX_FILE_SIZE_MB}MB까지 업로드할 수 있습니다.`,
      variant: "destructive",
    });
    return null;
  }

  // Check file format
  if (!isAllowedFile(file)) {
    toast({
      title: "지원하지 않는 형식",
      description: "JPG, PNG, WEBP, HEIC 형식만 업로드할 수 있습니다.",
      variant: "destructive",
    });
    return null;
  }

  let processedFile = file;

  // Convert HEIC/HEIF to JPEG first
  if (isHeicFile(file)) {
    try {
      processedFile = await convertHeicToJpeg(file);
    } catch (error) {
      console.error("HEIC conversion failed:", error);
      toast({
        title: "HEIC 변환 실패",
        description: "HEIC 파일을 변환할 수 없습니다. JPG 또는 PNG로 변환 후 업로드해주세요.",
        variant: "destructive",
      });
      return null;
    }
  }

  const options = PRESET_OPTIONS[preset];

  try {
    const compressed = await imageCompression(processedFile, {
      maxWidthOrHeight: options.maxWidthOrHeight,
      initialQuality: options.quality,
      useWebWorker: true,
      fileType: "image/jpeg",
    });
    return compressed;
  } catch (error) {
    console.error("Image compression failed:", error);
    return processedFile;
  }
}

/**
 * Validates and compresses, then returns a data URL for preview.
 */
export async function compressImageToDataUrl(
  file: File,
  preset: ImageUploadPreset = "general"
): Promise<string | null> {
  const compressed = await compressImage(file, preset);
  if (!compressed) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(compressed);
  });
}

/** Accept string for file inputs */
export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.heif";
