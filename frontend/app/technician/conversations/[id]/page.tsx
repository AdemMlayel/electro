import ConversationChatPage from "@/components/ConversationChatPage";

export default async function TechnicianConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ConversationChatPage
      basePath="/technician"
      conversationId={id}
      accent="indigo"
    />
  );
}
