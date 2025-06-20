import React, { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EmbedWidget = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    width: "400px",
    height: "600px",
    theme: "light",
    position: "bottom-right",
    primaryColor: "#6366f1",
    borderRadius: "12px",
    agentName: "test",
  });

  const generateEmbedCode = () => {
    return `<!-- CanistChat Embed Widget -->
<div id="canistchat-widget-agent_3"></div>
<script>
(function() {
  // CanistChat Widget Configuration
  const config = {
    agentId: "agent_3",
    width: "${config.width}",
    height: "${config.height}",
    theme: "${config.theme}",
    position: "${config.position}",
    primaryColor: "${config.primaryColor}",
    borderRadius: "${config.borderRadius}",
    agentName: "${config.agentName}"
  };
  
  // Load CanistChat Widget
  const script = document.createElement('script');
  script.src = 'https://cdn.canistchat.com/widget.js';
  script.async = true;
  script.onload = function() {
    window.CanistChat.init(config);
  };
  document.head.appendChild(script);
})();
</script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    toast({
      title: "Code copied!",
      description: "The embed code has been copied to your clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex w-full">
      <DashboardSidebar onNavigate={() => {}} />
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">Embed Widget Generator</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Generate HTML code to embed <strong>{config.agentName}</strong> on your website
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configuration Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Widget Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="width">Width</Label>
                        <Input id="width" value={config.width} onChange={(e) => setConfig({ ...config, width: e.target.value })} placeholder="400px" />
                      </div>
                      <div>
                        <Label htmlFor="height">Height</Label>
                        <Input id="height" value={config.height} onChange={(e) => setConfig({ ...config, height: e.target.value })} placeholder="600px" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={config.theme} onValueChange={(value) => setConfig({ ...config, theme: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Select value={config.position} onValueChange={(value) => setConfig({ ...config, position: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input id="primaryColor" type="color" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="w-16 h-10 p-1 border-2" />
                        <Input value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="flex-1" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="borderRadius">Border Radius</Label>
                      <Input id="borderRadius" value={config.borderRadius} onChange={(e) => setConfig({ ...config, borderRadius: e.target.value })} placeholder="12px" />
                    </div>
                  </CardContent>
                </Card>

                {/* Enterprise Badge */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Enterprise Ready
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Advanced LLM integration with intelligent load balancing</p>
                  </CardContent>
                </Card>
              </div>

              {/* Preview and Code Generation */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                      <div
                        className="rounded-lg shadow-lg flex items-center justify-center text-white font-medium"
                        style={{
                          backgroundColor: config.primaryColor,
                          width: config.width,
                          height: "60px",
                          borderRadius: config.borderRadius,
                        }}
                      >
                        <Bot className="w-5 h-5 mr-2" />
                        {config.agentName}
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">Chat interface preview</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Generated Embed Code
                      <Button onClick={copyToClipboard} size="sm" variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea value={generateEmbedCode()} readOnly className="font-mono text-sm bg-gray-50 dark:bg-gray-800 min-h-[200px] resize-none" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Integration Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>Copy the embed code above</li>
                      <li>Paste it into your website's HTML where you want the chat widget to appear</li>
                      <li>The widget will automatically load and connect to your agent</li>
                      <li>Users can start chatting immediately without any additional setup</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmbedWidget;
