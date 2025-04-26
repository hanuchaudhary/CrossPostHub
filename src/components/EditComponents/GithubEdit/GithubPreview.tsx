import Image from "next/image";
import { GithubIcon, FlameIcon } from "lucide-react";

interface ContributionDay {
  date: string;
  count: number;
}

interface Props {
  user: {
    avatarUrl: string;
    username: string;
    displayName: string;
    bio: string;
    followers: number;
    following: number;
    totalCommits: number;
    yearsActive: number;
  };
  contributions: any;
  loading?: boolean;
}

export default function GithubProfileCard({ user, contributions , loading}: Props) {
  return (
    <div className="bg-gradient-to-br from-[#1f1f1f] to-[#121212] p-6 rounded-2xl shadow-lg w-full max-w-5xl mx-auto">
      {/* Profile Info */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="rounded-full overflow-hidden w-20 h-20">
            <Image
              src={user.avatarUrl}
              alt="profile"
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {user.displayName}
            </h2>
            <p className="text-gray-400">@{user.username}</p>
            <p className="text-gray-400 mt-1">{user.bio}</p>
            <div className="text-gray-400 text-sm mt-2">
              <span>{user.followers} Followers</span> •{" "}
              <span>{user.following} Following</span>
            </div>
          </div>
        </div>

        <div className="text-gray-400 flex flex-col items-end">
          <GithubIcon size={32} />
          <p className="text-white mt-2">{user.totalCommits} Commits</p>
          <p>{user.yearsActive} Years</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 items-center text-gray-400 mt-6">
        <p className="font-semibold text-white">Past Year</p>
        <p>{user.totalCommits} Commits</p>
        <div className="flex items-center gap-1">
          <FlameIcon size={16} />
          <p>32 Days</p>{" "}
          {/* you can calculate active days from contributions array */}
        </div>
      </div>

      {/* Contribution Graph */}
      {!loading && (
        <div className="flex flex-wrap gap-1 mt-6">
          {contributions.contributions.map((day, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-sm ${
                day.count === 0
                  ? "bg-gray-700"
                  : day.count < 3
                    ? "bg-green-600"
                    : day.count < 6
                      ? "bg-green-500"
                      : "bg-green-400"
              }`}
              title={`${day.count} contributions on ${day.date}`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
