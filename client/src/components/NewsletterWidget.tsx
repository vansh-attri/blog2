import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2 } from "lucide-react";

export default function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/subscribe", { email });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription successful!",
        description: "You've been added to our newsletter.",
      });
      setEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    subscribeMutation.mutate(email);
  };

  return (
    <div className="bg-primary bg-opacity-10 shadow-md rounded-lg p-6">
      <h3 className="text-lg font-bold mb-2 text-text">Subscribe to our newsletter</h3>
      <p className="text-sm text-secondary mb-4">
        Get the latest tech articles and career advice delivered to your inbox weekly.
      </p>
      <form className="space-y-2" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="sr-only">Email address</label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribeMutation.isPending}
          />
        </div>
        <div>
          <Button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            disabled={subscribeMutation.isPending}
          >
            {subscribeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
