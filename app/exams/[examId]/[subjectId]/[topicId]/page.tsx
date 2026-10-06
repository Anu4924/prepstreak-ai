"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TopicDirectRoute() {
  const router = useRouter();
  const params = useParams();
  const examId = (params?.examId as string) || "sbi-po";
  const subjectId = (params?.subjectId as string) || "reasoning-ability";
  const topicId = (params?.topicId as string) || "coding-decoding";

  useEffect(() => {
    // Seamlessly navigate to the dedicated Axmok AI Learn experience
    router.replace(`/exams/${examId}/${subjectId}/${topicId}/learn`);
  }, [router, examId, subjectId, topicId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-xs text-charcoal-500 font-mono">
      Loading topic workspace...
    </div>
  );
}
