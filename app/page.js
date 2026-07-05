import ChatApp from "@/components/ChatApp";
import { listPersonas } from "@/lib/personas";

export default function Home() {
  const personas = listPersonas();
  return <ChatApp personas={personas} />;
}
