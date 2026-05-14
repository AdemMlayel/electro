import ConversationChatPage from "@/components/ConversationChatPage";

export default async function DashboardConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ConversationChatPage
      basePath="/dashboard"
      conversationId={id}
      accent="frosted"
    />
  );
}
