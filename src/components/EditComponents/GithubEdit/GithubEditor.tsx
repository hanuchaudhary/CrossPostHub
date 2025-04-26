"use client";

import React, { useEffect } from "react";
import GithubProfileCard from "./GithubPreview";

export function GithubEditor() {
  const [contributions, setContributions] = React.useState([]);
  const [user, setUser] = React.useState({
    avatarUrl: "",
    username: "",
    displayName: "",
    bio: "",
    followers: 0,
    following: 0,
    totalCommits: 0,
    yearsActive: 0,
  });
  const [loading, setLoading] = React.useState(true);
  useEffect(() => {
    const fetchGithubData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ githubUsername: "hanuchaudhary" }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch data");
        }
        setUser(data.user);
        setContributions(data.contributions);
        console.log(data); // Handle the fetched data as needed
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGithubData();
  }, []);

  return (
    <div>
      <GithubProfileCard
        user={{
          avatarUrl: "https://avatars.githubusercontent.com/u/your-id",
          username: "hanuchaudhary",
          displayName: "KushCh@udhary",
          bio: "Debugging React & Typescript ❤️ Building in Public",
          followers: 12,
          following: 3,
          totalCommits: 815,
          yearsActive: 3,
        }}
        loading={loading}
        contributions={contributions}
      />
    </div>
  );
}
