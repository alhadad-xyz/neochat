import React, { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";

const Chat = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>("sales-bot");

  return (
    <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar onNavigate={() => {}} />
      <div className="flex-1 flex ml-64">
        <ChatSidebar selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
        <ChatArea selectedAgent={selectedAgent} />
      </div>
    </div>
  );
};

export default Chat;
