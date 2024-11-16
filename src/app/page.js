"use client";

import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { getUser } from "./api";
import { Tab } from "./components/Tab";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

function Home() {
  const tabs = [
    {
      id: 0,
      text: "All",
    },
    {
      id: 1,
      text: "Leanne Graham",
    },
    {
      id: 2,
      text: "Ervin Howell",
    },
  ];

  const router = useRouter();

  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("user");
  
  // 使用本地狀態來防止閃爍
  const [activeId, setActiveId] = useState(urlUserId ? Number(urlUserId) : 0);

  // 同步 URL 和本地狀態
  useEffect(() => {
    const newId = urlUserId ? Number(urlUserId) : 0;
    setActiveId(newId);
  }, [urlUserId]);

  // 預先獲取相鄰頁面的數據
  useEffect(() => {
    // 預取下一個 tab 的數據
    const nextId = activeId + 1;
    if (nextId < tabs.length) {
      queryClient.prefetchQuery({
        queryKey: ["user", String(nextId)],
        queryFn: () => getUser({ id: String(nextId) })
      });
    }
    
    // 預取上一個 tab 的數據
    const prevId = activeId - 1;
    if (prevId >= 0) {
      queryClient.prefetchQuery({
        queryKey: ["user", String(prevId)],
        queryFn: () => getUser({ id: String(prevId) })
      });
    }
  }, [activeId]);

  const query = useQuery({
    queryKey: ["user", urlUserId],
    queryFn: () => getUser(urlUserId ? { id: urlUserId } : undefined),
    onSuccess: (data) => console.log(data),
    keepPreviousData: true // 保留舊數據直到新數據加載完成
  });

  const handleClick = (id) => {
    // 立即更新本地狀態
    setActiveId(id);
    
    // 構建新的 URL
    const params = new URLSearchParams();
    if (id !== 0) {
      params.set("user", id);
    }
    
    // 使用 replace 而不是 push 來避免增加瀏覽器歷史記錄
    router.replace(`/?${params.toString()}`);
  };

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="flex gap-4 items-center">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            className="cursor-pointer"
          >
            <Tab
              text={tab.text}
              active={activeId === tab.id}
            />
          </div>
        ))}
      </div>
      <div className="w-full">
        {query.isLoading ? (
          <div className="animate-pulse bg-gray-200 h-32 rounded-md" />
        ) : (
          <pre>{JSON.stringify(query.data, null, 2)}</pre>
        )}
      </div>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}