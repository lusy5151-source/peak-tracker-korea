import { toast } from "sonner";

/**
 * Wraps a Supabase mutation and shows a toast on failure.
 * Returns { data, error } — the caller can still inspect the result.
 */
export async function withErrorHandling<T>(
  operation: () => Promise<{ data: T; error: any }>,
  options?: { successMessage?: string; errorMessage?: string }
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await operation();
    if (result.error) {
      console.error("Supabase operation failed:", result.error);
      toast.error(options?.errorMessage || "저장에 실패했습니다. 다시 시도해주세요.");
      return { data: null, error: result.error };
    }
    if (options?.successMessage) {
      toast.success(options.successMessage);
    }
    return result;
  } catch (err) {
    console.error("Unexpected error in Supabase operation:", err);
    toast.error(options?.errorMessage || "저장에 실패했습니다. 다시 시도해주세요.");
    return { data: null, error: err };
  }
}
