"use client"
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";


export default function NotFound() {
  const router = useRouter();
  return (
    <section className="flex items-center justify-center h-screen pb-20 overflow-hidden bg-gray-2">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        <div className="px-4 py-10 bg-background rounded-xl shadow-1 sm:py-15 lg:py-20 xl:py-25">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">404</h1>

            <h2 className="mb-3 text-xl font-medium text-foreground sm:text-2xl">
              Sorry, the page can’t be found
            </h2>

            <p className="max-w-[410px] w-full mx-auto mb-7.5 text-foreground">
              The page you were looking for appears to have been moved, deleted
              or does not exist.
            </p>

            <Button
              className="inline-flex items-center gap-2 px-6 py-3 font-medium text-background duration-200 ease-out rounded-md bg-primary hover:bg-primary/80"
              onClick={() => router.back()}>
              <ArrowLeftIcon />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}