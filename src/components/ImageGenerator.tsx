import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RunwareService, GeneratedImage } from "@/lib/runware";
import { Download, Sparkles } from "lucide-react";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [runwareService, setRunwareService] = useState<RunwareService | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("Please enter your Runware API key");
      return;
    }

    try {
      setIsGenerating(true);
      
      if (!runwareService) {
        const service = new RunwareService(apiKey);
        setRunwareService(service);
      }

      const result = await runwareService!.generateImage({
        positivePrompt: prompt,
      });

      setGeneratedImage(result);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage?.imageURL) return;

    try {
      const response = await fetch(generatedImage.imageURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${Date.now()}.webp`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-indigo-600">Real time image Generation</h1>
          <p className="text-gray-600">Create an interactive web application where users can input a text description, and the application will generate an image based on the provided description in real-time.</p>
        </div>

        <div className="space-y-4 bg-white rounded-xl p-6 shadow-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Runware API Key</label>
            <Input
              type="password"
              placeholder="Enter your Runware API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Image Description</label>
            <div className="relative">
              <Input
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full pr-24"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="absolute right-1 top-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-6" />
                    <span>Generate</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {generatedImage && (
          <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
            <div className="relative group">
              <img
                src={generatedImage.imageURL}
                alt={generatedImage.positivePrompt}
                className="w-full h-auto rounded-lg"
              />
              <Button
                onClick={handleDownload}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <p className="text-sm text-gray-600 italic">{generatedImage.positivePrompt}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;