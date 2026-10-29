import { useState } from "react";
import { toast } from "sonner";

/**
 * Tiny wrapper around a server action: tracks loading/error/data and shows
 * a toast on failure. `fn` resolves to the action's result on success and to
 * `undefined` on failure, so callers can branch on the outcome without a
 * second try/catch.
 */
const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      toast.error(error.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
